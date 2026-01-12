"use client";

import { useState } from "react";

export default function DigestEmailTest() {
	const [adminSecret, setAdminSecret] = useState("");
	const [result, setResult] = useState(null);
	const [error, setError] = useState("");
	const [sending, setSending] = useState(false);

	const send = async () => {
		setError("");
		setResult(null);
		setSending(true);
		try {
			const response = await fetch("/api/email/api/worker/digest-emails", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${adminSecret}`,
				},
				body: JSON.stringify({}),
			});
			const data = await response.json().catch(() => ({}));
			if (!response.ok) {
				setError(`Error ${response.status}: ${data?.message || response.statusText}`);
			} else {
				setResult(data);
			}
		} catch (e) {
			setError(e?.message || "Unknown error");
		} finally {
			setSending(false);
		}
	};

	return (
		<div style={{ padding: 24 }}>
			<h1>Digest Emails Test</h1>
			<p>Trigger the digest worker route and view the response.</p>

			<div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 720 }}>
				<label>
					<span>Admin Secret (Bearer): </span>
					<input
						type="text"
						value={adminSecret}
						placeholder="Paste ADMIN_EMAIL_SECRET"
						onChange={(e) => setAdminSecret(e.target.value)}
						style={{ width: "100%" }}
					/>
				</label>

				<div style={{ display: "flex", gap: 8 }}>
					<button onClick={send} disabled={sending || !adminSecret}>
						{sending ? "Fetching..." : "Fetch Route"}
					</button>
					<button
						onClick={() => {
							setResult(null);
							setError("");
						}}
						disabled={sending}
					>
						Clear Output
					</button>
				</div>

				{!!error && <p style={{ color: "#b00020" }}>{error}</p>}
				{!!result && (
					<pre style={{ background: "#f5f5f5", padding: 12, overflowX: "auto" }}>
						{JSON.stringify(result, null, 2)}
					</pre>
				)}
			</div>
		</div>
	);
}
