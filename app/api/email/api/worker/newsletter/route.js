export const runtime = 'nodejs';

import { Resend } from 'resend';
import { supabaseServiceClient } from '@/lib/supabaseServiceClient';

const resend = new Resend(process.env.RESEND_API_KEY);
const BATCH_SIZE = Number(process.env.RESEND_BATCH_SIZE || 500);

function chunkArray(arr, size) {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
}

export async function POST(req) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${process.env.ADMIN_EMAIL_SECRET}`) {
        return new Response("Unauthorized", { status: 401 });
    }

    const { subject, html } = await req.json();

    if (!subject || !html) {
        return new Response("Missing subject or html", { status: 400 });
    }

    const { data, error } = await supabaseServiceClient.auth.admin.listUsers();
    if (error) {
        return new Response("Failed to list users", { status: 500 });
    }

    // Only include users with an email and that have not disabled newsletters in auth metadata
    const users = (data?.users ?? []).filter(
        (u) => !!u.email && !(u.user_metadata?.disable_email_newsletter === true)
    );

    if (users.length === 0) {
        return Response.json({ queued: 0 });
    }

    const messages = users.map((user) => ({
        from: "FlameSpark <flamespark@mail.flamesparkbeta.com>",
        to: user.email,
        subject,
        html,
    }));

    const chunks = chunkArray(messages, BATCH_SIZE);
    let queuedTotal = 0;
    const results = [];

    for (const chunk of chunks) {
        try {
            await resend.batch.send(chunk);
            queuedTotal += chunk.length;
            results.push({ size: chunk.length, status: 'ok' });
        } catch (_) {
            results.push({ size: chunk.length, status: 'error' });
        }
    }

    return Response.json({ queued: queuedTotal, results });
}