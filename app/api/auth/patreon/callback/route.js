import { NextResponse } from 'next/server';
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
    const domain = 'https://flamesparkbeta.com';

    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const rawState = searchParams.get('state');
    let stateEmail = null;
    let stateRedirectUrl = '/';

    if (rawState) {
        try {
            const decoded = JSON.parse(Buffer.from(decodeURIComponent(rawState), 'base64').toString('utf-8'));
            const candidate = (decoded?.email || '').trim();
            const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate);
            if (isValid) stateEmail = candidate;
            if (typeof decoded?.redirectUrl === 'string' && decoded.redirectUrl.startsWith('/')) {
                stateRedirectUrl = decoded.redirectUrl;
            }
        } catch {}
    }

    if (!code) {
        return NextResponse.redirect(`${domain}/login?error=missing_code`);
    }

    /* -------------------------
       Exchange code → token
    ------------------------- */
    const tokenRes = await fetch(
        'https://www.patreon.com/api/oauth2/token',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                client_id: process.env.NEXT_PUBLIC_PATREON_CLIENT_ID,
                client_secret: process.env.PATREON_CLIENT_SECRET,
                redirect_uri: process.env.NEXT_PUBLIC_PATREON_REDIRECT_URI
            })
        }
    );

    const token = await tokenRes.json();
    if (!token.access_token) {
        return NextResponse.redirect(`${domain}/login?error=token_failed`);
    }

    /* -------------------------
       Fetch identity + membership
    ------------------------- */
    const identityRes = await fetch(
        'https://www.patreon.com/api/oauth2/v2/identity' +
        '?include=memberships' +
        '&fields[member]=patron_status,currently_entitled_amount_cents,last_charge_status' +
        '&fields[user]=email',
        {
            headers: {
                Authorization: `Bearer ${token.access_token}`
            }
        }
    );

    const identity = await identityRes.json();
    const memberships = identity.included ?? [];

    const allowTrial = String(process.env.ALLOW_PATREON_TRIAL || '').toLowerCase() === 'true';
    const isEligiblePaidPatron = memberships.some((m) => {
        const campaignMatch = m.relationships?.campaign?.data?.id === process.env.PATREON_CAMPAIGN_ID;
        const status = (m.attributes?.patron_status || '').toLowerCase();
        const entitledCents = Number(m.attributes?.currently_entitled_amount_cents || 0);
        const lastCharge = (m.attributes?.last_charge_status || '').toLowerCase();
        const hasTier = Boolean(m.relationships?.currently_entitled_tier?.data?.id);
        const isActive = status === 'active_patron';
        const isPaid = entitledCents > 0 || lastCharge === 'paid';
        const isTrialEligible = allowTrial && hasTier && !isPaid;
        return campaignMatch && isActive && (isPaid || isTrialEligible);
    });

    if (!isEligiblePaidPatron) {
        return NextResponse.redirect(`${domain}/login?error=not_a_patron`);
    }

    /* -------------------------
       Deterministic identity
    ------------------------- */
    const patreonId = identity.data.id;
    let email = identity.data.attributes?.email || stateEmail;

    // if identity.data.attributes?.email is null but there is an email associated with their account (fetched from patreon id), use that email
    if (!email) {
        const { data: existingUsers, error } = await supabase.auth.admin.listUsers({
            filter: `user_metadata->>patreon_id=eq.${patreonId}`,
            limit: 1
        });
        
        if (error) {
            return NextResponse.redirect(`${domain}/login?error=user_lookup_failed`);
        }
        if (existingUsers.length > 0) {
            email = existingUsers[0].email;

            if (!email) {
                return NextResponse.redirect(`${domain}/login?mode=add_email`);
            }
        } else {
            return NextResponse.redirect(`${domain}/login?mode=add_email`);
        }
    }
    
    /* -------------------------
       Create OR fetch user
    ------------------------- */
    const { data: user, error: createUserError } =
        await supabase.auth.admin.createUser({
            email,
            email_confirm: true,
            user_metadata: {
                provider: 'patreon',
                patreon_id: patreonId
            }
        });

    /* -------------------------
       Create session
    ------------------------- */
    const { data: link, error } =
        await supabase.auth.admin.generateLink({
            type: 'magiclink',
            email,
            options: {
                redirectTo: `https://flamesparkbeta.com${stateRedirectUrl}`
            }
        });

        if (error) {
        console.log("Error generating magic link:", error.message);
    }


    if (error || !link?.properties.action_link) {
        return NextResponse.redirect(`${domain}/login?error=session_failed`);
    }

    // Prefer client-side verification using token_hash to reliably create a session.
    const tokenHash = link.properties.hashed_token;
    const type = link.properties.verification_type; // expected 'magiclink'
    const redirectUrl = new URL(`${domain}/auth/magic`);
    redirectUrl.searchParams.set('token_hash', tokenHash);
    redirectUrl.searchParams.set('type', type);
    // Optional: include email for debugging/telemetry (not required for verifyOtp)
    redirectUrl.searchParams.set('email', email);

    return NextResponse.redirect(redirectUrl.toString());
}
