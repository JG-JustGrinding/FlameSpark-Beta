export const runtime = 'nodejs';

import { Resend } from 'resend';
import { supabaseServiceClient } from '@/lib/supabaseServiceClient';

const resend = new Resend(process.env.RESEND_API_KEY);
const BATCH_SIZE = Number(30);
const FETCH_LIMIT = 150;
const celebrationEmojis = ["🎉", "🚀", "✨", "🥳", "🎊", "🌟", "🔥", "⚡", "🏆"];

function chunkArray(arr, size) {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
}

// Only doing project completion emails for high priority for now
export async function POST(req) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${process.env.ADMIN_EMAIL_SECRET}`) {
        return new Response("Unauthorized", { status: 401 });
    }

    const { data, error } = await supabaseServiceClient
        .from("notifications")
        .select("*")
        .eq("email_sent", false)
        .eq("email_priority", "high")
        .eq("category", "completions:project_completion") // only project completion for now
        .limit(FETCH_LIMIT)
        .order("created_at", { ascending: true });

    if (error) {
        return new Response("Failed to load notifications", { status: 500 });
    }

    // Build messages for batch sending
    const queued = [];
    for (const notification of data || []) {
        try {
            // get user email
            const { data: userData } = await supabaseServiceClient.auth.admin.getUserById(notification.user_id);

            const userEmail = userData?.user?.email;
            if (!userEmail) continue;
            if (userData?.user?.user_metadata?.disable_email_important === true) continue;

            // get profile and project
            const [{ data: profileData }, { data: projectData }] = await Promise.all([
                supabaseServiceClient.from("profiles").select("*").eq("id", notification.user_id).single(),
                (() => {
                    const match = notification.href?.match(/project\/([^/?]+)/);
                    const projectId = match?.[1];
                    if (!projectId) return { data: null };
                    return supabaseServiceClient.from("projects").select("*").eq("id", projectId).single();
                })(),
            ]);

            if (!projectData) continue;

            const emoji = celebrationEmojis[Math.floor(Math.random() * celebrationEmojis.length)];
            queued.push({
                id: notification.id,
                to: userEmail,
                variables: {
                    project_title: projectData?.title || "Unnamed Project",
                    project_icon: projectData?.icon || "",
                    project_id: projectData?.id,
                    project_cover_image: projectData?.cover_image || "",
                    username: profileData?.display_name || "user",
                    emoji
                },
            });
        } catch (e) {
            // Skip problematic notifications but continue processing others
            console.error("Notification failed", notification.id, e);
            continue;
        }
    }

    if (queued.length === 0) {
        return new Response(JSON.stringify({ queued: 0, chunks: [] }), { status: 200 });
    }

    const messages = queued.map((q) => ({
        from: "FlameSpark <flamespark@mail.flamesparkbeta.com>",
        to: q.to,
        template: {
            id: "77ca57cd-a0e7-4f7e-a4bb-ca465df209e8",
            variables: q.variables,
        },
    }));

    const pairs = queued.map((q, i) => ({ id: q.id, msg: messages[i] }));
    const chunks = chunkArray(pairs, BATCH_SIZE);
    let queuedTotal = 0;
    const results = [];

    for (const chunk of chunks) {
        try {
            const { data: sendResults, error } = await resend.batch.send(
                chunk.map((p) => p.msg)
            );

            if (error) {
                // Entire batch failed — do not mark anything as sent
                console.log("Batch send error", error);
                results.push({ size: chunk.length, status: 'error' });
                continue;
            }

            const successfulIds = [];
            const failedIds = [];
            sendResults.data?.forEach((res, i) => {
                if (res?.error) {
                    failedIds.push(chunk[i].id);
                } else {
                    successfulIds.push(chunk[i].id);
                }
            });

            if (successfulIds.length > 0) {
                await supabaseServiceClient
                    .from("notifications")
                    .update({ email_sent: true })
                    .in("id", successfulIds);
            }

            queuedTotal += successfulIds.length;

            results.push({
                size: chunk.length,
                sent: successfulIds.length,
                failed: failedIds.length,
            });
        } catch (e) {
            console.log("Batch processing error", e);
            results.push({ size: chunk.length, status: 'error' });
            // Do not mark as sent on failure
        }
    }

    return new Response(JSON.stringify({ queued: queuedTotal, chunks: results }), { status: 200 });
}

