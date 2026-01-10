export const runtime = 'nodejs';

import { Resend } from 'resend';
import { supabaseServiceClient } from '@/lib/supabaseServiceClient';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${process.env.ADMIN_EMAIL_SECRET}`) {
        //return new Response("Unauthorized", { status: 401 });
    }

    const { subject, html } = await req.json();

    if (!subject || !html) {
        return new Response("Missing subject or html", { status: 400 });
    }

    const { data } = await supabaseServiceClient.auth.admin.listUsers();

    /*for (const user of users) {
      await resend.emails.send({
        from: "FlameSpark <flamespark@mail.flamespark.com>",
        to: user.email,
        subject,
        html,
      });
    }*/
    //console.log(data.users);
    //console.log("First User to send newsletter to:", data.users[1]);

    // For testing purposes, send only to the first user
    if (data.users.length > 0) {
        const user = data.users[1];

        await resend.emails.send({
            from: "FlameSpark <flamespark@mail.flamesparkbeta.com>",
            to: ['justgrindingweb@gmail.com'],
            subject,
            html,
        });
    }

    return Response.json({
        sent: data.users.length,
        first: data.users[1]?.email || null,
    });
}