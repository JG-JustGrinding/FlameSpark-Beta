"use client";
export default function EmailSendTest() {
    const click = async () => {
                const response = await fetch('/api/email/api/worker/newsletter', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ---IGNORE---`
                    },
                    body: JSON.stringify({
                        subject: "Test Email",
                        html: "<p>This is a test email for FlameSpark.</p>"
                    })
                });
                const data = await response.json();
                console.log(data);
            };

    return (
        <div>
            <h1>Email Send Test</h1>
            <p>This is a test page for sending emails.</p>
            <button onClick={() => click()}>
                Send Test Email
            </button>
        </div>
    );
}