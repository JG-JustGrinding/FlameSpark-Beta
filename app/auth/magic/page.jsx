"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import PrimaryPageLayout from "@/components/PrimaryPageLayout";

export default function MagicLinkVerifier() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Verifying magic link...");

  useEffect(() => {
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type") || "magiclink";

    async function verify() {
      if (!tokenHash) {
        setStatus("Missing verification token.");
        router.replace("/login?error=missing_token");
        return;
      }
      const { data, error } = await supabase.auth.verifyOtp({
        type,
        token_hash: tokenHash,
      });

      if (error) {
        setStatus("Verification failed.");
        router.replace("/login?error=verify_failed");
        return;
      }

      setStatus("Redirecting...");
      router.replace("/");
    }

    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PrimaryPageLayout title="Signing In" description="Completing your login">
      <p className="bodyFont" style={{ marginTop: 24 }}>{status}</p>
    </PrimaryPageLayout>
  );
}
