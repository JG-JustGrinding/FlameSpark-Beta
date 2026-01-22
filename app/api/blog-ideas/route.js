export const runtime = 'nodejs';

import { supabaseServiceClient } from '@/lib/supabaseServiceClient';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const body = await req.json();
    const { title, summary, contact, tags, userId } = body || {};

    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      return new Response(JSON.stringify({ message: 'Title is required' }), { status: 400 });
    }

    const payload = {
      title: title.trim(),
      summary: summary?.trim() || null,
      contact: contact?.trim() || null,
      tags: tags?.trim() || null,
      status: 'new',
      created_at: new Date().toISOString(),
    };

    // Attempt to persist to DB (optional; non-fatal if fails)
    /*
    const { data, error } = await supabaseServiceClient
      .from('blog_ideas')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      console.error('Failed to insert blog idea:', error);
    }
      */

    let data = null;

    // Prepare email content
    const esc = (v) => (v ?? '').toString();
    const nice = (v) => (v && v.toString().trim().length ? v : '—');
    const html = `
      <div style="font-family: Arial, sans-serif; color:#111;">
        <h2 style="margin:0 0 12px 0;">New Blog Idea Submission</h2>
        <p><strong>Title:</strong> ${esc(title)}</p>
        <p><strong>Summary:</strong><br/>${esc(summary)}</p>
        <p><strong>Tags:</strong> ${nice(tags)}</p>
        <p><strong>Contact:</strong> ${nice(contact)}</p>
        ${userId ? `<p><strong>Submitted by User ID:</strong> ${esc(userId)}</p>` : ''}
        ${data?.id ? `<p style="color:#636363;font-size:12px;">Saved as ID: ${data.id}</p>` : ''}
        <p style="color:#636363;font-size:12px;">Submitted at: ${new Date().toISOString()}</p>
      </div>
    `;
    const text = `New Blog Idea Submission\n\nTitle: ${esc(title)}\nSummary: ${esc(summary)}\nTags: ${nice(tags)}\nContact: ${nice(contact)}\n${data?.id ? `Saved ID: ${data.id}\n` : ''}Submitted at: ${new Date().toISOString()}`;

    // Send email via Resend
    const { error: emailError } = await resend.emails.send({
      from: 'FlameSpark <flamespark@mail.flamesparkbeta.com>',
      to: 'flamespark.business@gmail.com',
      subject: `New Blog Idea: ${title.trim()}`,
      html,
      text,
    });

    if (emailError) {
      console.error('Failed to send blog idea email:', emailError);
      return new Response(JSON.stringify({ message: 'Failed to send email' }), { status: 502 });
    }

    return new Response(JSON.stringify({ message: 'ok', id: data?.id || null }), { status: 200 });
  } catch (e) {
    console.error('Blog idea POST error:', e);
    return new Response(JSON.stringify({ message: 'Invalid request' }), { status: 400 });
  }
}
