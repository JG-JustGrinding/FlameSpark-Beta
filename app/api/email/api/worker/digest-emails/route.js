export const runtime = 'nodejs';

import { Resend } from 'resend';
import { supabaseServiceClient } from '@/lib/supabaseServiceClient';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${process.env.ADMIN_EMAIL_SECRET}`) {
        return new Response("Unauthorized", { status: 401 });
    }

    // email route that sends digest emails: emails that summarize recent activity from notifications that the user hasn't yet seen
    const { data, error } = await supabaseServiceClient.auth.admin.listUsers();
    if (error) {
        return new Response("Failed to list users", { status: 500 });
    }

    for (const user of data?.users || []) {
        if (user.user_metadata?.disable_email_digest === true) continue;
        if (user.created_at > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) continue; // skip users created within the last week

        // Fetch notifications for user that the user hasn't checked yet
        const { data: profileData, error: profileError } = await supabaseServiceClient
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        if (profileError || !profileData) continue;

        const { data: notifications, error: notificationsError } = await supabaseServiceClient
            .from("notifications")
            .select("*")
            .eq("user_id", user.id)
            .eq("email_sent", false)
            .gt("created_at", profileData.notifications_last_checked_at || new Date(0).toISOString())
            .in("email_priority", ["digest", "medium"])
            .order("created_at", { ascending: false });

        if (notificationsError || !notifications || notifications.length === 0) continue;
        
        // Build email content
    }

    return new Response(JSON.stringify({ message: "success" }), { status: 200 });
}