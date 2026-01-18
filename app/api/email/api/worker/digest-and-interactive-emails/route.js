export const runtime = 'nodejs';

import { Resend } from 'resend';
import { supabaseServiceClient } from '@/lib/supabaseServiceClient';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${process.env.ADMIN_EMAIL_SECRET}`) {
        return new Response("Unauthorized", { status: 401 });
    }

    
}