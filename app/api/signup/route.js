import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const body = await req.json()
    const { email, password, accessKey, username } = body

    if (!email || !password || !accessKey || !username) {
      return NextResponse.json(
        { error: 'Missing fields' },
        { status: 400 }
      )
    }

    // 1. Check access key
    const { data: keyRow, error: keyError } = await supabaseAdmin
      .from('access_keys')
      .select('*')
      .eq('key', accessKey)
      .eq('used', false)
      .single()

    if (keyError || !keyRow) {
      return NextResponse.json(
        { error: 'Invalid access key' },
        { status: 401 }
      )
    }

    // 2. Create user
    const { data: userData, error: signUpError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          username
        }
      })

    if (signUpError) {
      return NextResponse.json(
        { error: signUpError.message },
        { status: 400 }
      )
    }

    // 3. Burn the key
    await supabaseAdmin
      .from('access_keys')
      .update({
        used: true,
        used_by: userData.user.id,
        used_at: new Date()
      })
      .eq('key', accessKey)

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}