export const runtime = 'nodejs';

import { Resend } from 'resend';
import { render } from "@react-email/render";
import DigestEmail from '@/emails/DigestEmail';
import { supabaseServiceClient } from '@/lib/supabaseServiceClient';

const resend = new Resend(process.env.RESEND_API_KEY);

const hoursLastNotificationThreshold = 12; // only send digest emails to users who haven't received a standard notification in the last # hours
const daysBeforeSkipNewUsers = 1; // number of days to skip sending digest emails to new users
const digestNotificationMinCount = 3; // minimum number of notifications to send a digest email
const digestNotificationMinWithHighPriorityCount = 5; // minimum number of notifications needed to send a digest email if at least one notification is high priority
const highPriorityOverride = 10; // if a user has at least this many digest notifications, send digest regardless of total count

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
        if (user.created_at > new Date(Date.now() - daysBeforeSkipNewUsers * 24 * 60 * 60 * 1000).toISOString()) continue; // skip users created within the last # days
        if (user.banned_until && new Date(user.banned_until) > new Date()) continue; // skip banned users
        if (user.user_metadata?.last_standard_notification_at && new Date(user.user_metadata.last_standard_notification_at) > new Date(Date.now() - hoursLastNotificationThreshold * 60 * 60 * 1000)) continue; // skip users who have received a standard notification in the last 12 hours
        if (!user.email) continue;

        // Fetch notifications for user that the user hasn't checked yet
        const { data: profileData, error: profileError } = await supabaseServiceClient
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        if (profileError || !profileData) continue;

        const lastChecked = profileData.notifications_last_checked_at
        ? new Date(profileData.notifications_last_checked_at).toISOString()
        : new Date(0).toISOString();

        const { data: notifications, error: notificationsError } = await supabaseServiceClient
            .from("notifications")
            .select("*")
            .eq("user_id", user.id)
            .eq("email_sent", false)
            .gt("created_at", lastChecked)
            .gt("created_at", new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString())
            .in("email_priority", ["digest", "medium"])
            .order("created_at", { ascending: false })
            .limit(999);

        if (notificationsError || !notifications || notifications.length === 0) continue;

        // decide whether to send digest email or individual interactive emails
        if (user.user_metadata?.disable_email_digest == true) {
            // try to send interactive emails instead (max 1)
            // get most recent high priority notification
            const highPriorityNotification = notifications.find(n => n.email_priority === "medium");
            if (highPriorityNotification) {
                await sendSingleNotificationEmail(user, highPriorityNotification);
                continue;
            }
        } else if (user.user_metadata?.disable_email_interaction == true) {
            // send digest email only if enough notifications
            if (notifications.length >= digestNotificationMinCount) {
                await sendDigestEmail(user, notifications, profileData.username);
                continue;
            }
        }

        const highPriorityNotifs = notifications.filter(n => n.email_priority === "medium");
        const hasHighPriority = highPriorityNotifs.length > 0;

        if (hasHighPriority) {
            if (notifications.length >= digestNotificationMinWithHighPriorityCount) {
                if (highPriorityNotifs.length > 2 || notifications.length >= highPriorityOverride) {
                    await sendDigestEmail(user, notifications, profileData.username);
                } else {
                    await sendSingleNotificationEmail(user, highPriorityNotifs[0]);
                }
            } else {
                await sendSingleNotificationEmail(user, highPriorityNotifs[0]);
            }
        } else if (notifications.length >= digestNotificationMinCount) {
            await sendDigestEmail(user, notifications, profileData.username);
        }
    }

    return new Response(JSON.stringify({ message: "success" }), { status: 200 });
}

async function sendDigestEmail(user, notifications, username) {
    // Implement digest email sending logic here
    if (user.user_metadata?.disable_email_digest === true) return;

    // limit of notifications to include in digest
    const notificationLimit = 99;
    const notificationsToInclude = notifications.slice(0, notificationLimit);

    // count of notifications to include in digest (need to split after : so it's like )
    const likes = notificationsToInclude.filter(n => n.category.split(":")[1].startsWith("like")).length;
    const comments = notificationsToInclude.filter(n => n.category.split(":")[1] === "post_comment").length;
    const replies = notificationsToInclude.filter(n => n.category.split(":")[1] === "comment_reply").length;
    const votes = notificationsToInclude.filter(n => n.category.split(":")[1] === "poll_vote").length;
    const joins = notificationsToInclude.filter(n => n.category.split(":")[1] === "project_join").length;
    const includeJoinSection = joins > 3;
    const posts = notificationsToInclude.filter(n => n.category.split(":")[1] === "project_post").length;
    const includePostSection = posts > 3;

    let newNotifSegments = [];
    if (includeJoinSection) newNotifSegments.push({ emoji: "🤝", count: joins, text: `new project member${joins === 1 ? '' : 's'}` });
    if (includePostSection) newNotifSegments.push({ emoji: "📝", count: posts, text: `new project post${posts === 1 ? '' : 's'}` });
    if (likes > 0) newNotifSegments.push({ emoji: "👍", count: likes, text: `new like${likes === 1 ? '' : 's'}` });
    if (comments > 0) newNotifSegments.push({ emoji: "💬", count: comments, text: `new comment${comments === 1 ? '' : 's'}` });
    if (replies > 0) newNotifSegments.push({ emoji: "↩️", count: replies, text: `new repl${replies === 1 ? 'y' : 'ies'}` });
    if (votes > 0) newNotifSegments.push({ emoji: "🗳️", count: votes, text: `new poll vote${votes === 1 ? '' : 's'}` });

    const html = await render(<DigestEmail totalNotifications={notifications.length > notificationLimit ? `${notificationLimit}+` : notifications.length} newNotifSegments={newNotifSegments} username={username} ctaUrl='https://flamesparkbeta.com' />);

    try {
        const { data, error } = await resend.emails.send({
            from: "FlameSpark <flamespark@mail.flamesparkbeta.com>",
            to: user.email,
            subject: `You Have ${notifications.length > notificationLimit ? `${notificationLimit}+` : notifications.length} New Notification${notifications.length === 1 ? '' : 's'} on FlameSpark`,
            html,
        });

        if (error) {
            throw error;
        }

        // Mark notifications as email_sent
        // don't include join or post notifications in the email_sent update if they were not included in the digest
        const notificationIds = notificationsToInclude
            .filter(n => {
                const type = n.category.split(":")[1];
                if (type === "project_join" && !includeJoinSection) return false;
                if (type === "project_post" && !includePostSection) return false;
                return true;
            })
            .map(n => n.id);

        await supabaseServiceClient.from("notifications").update({ email_sent: true }).in("id", notificationIds);
        // Update user's last_standard_notification_at
        await supabaseServiceClient.auth.admin.updateUserById(user.id, {
            user_metadata: {
                ...user.user_metadata,
                last_standard_notification_at: new Date().toISOString(),
            },
        });
    } catch (e) {
        console.error("Failed to send digest email to user:", user.id, e);
    }
}

async function sendSingleNotificationEmail(user, notification) {
    if (user.user_metadata?.disable_email_interaction === true) return;

    const variables = {
        EMAIL_TITLE: notification.title || "You Have a New Notification",
        NOTIFICATION_HREF: notification.href || "",
        NOTIFICATION_ICON: notification.icon || "",
        NOTIFICATION_TITLE: notification.title || "",
        NOTIFICATION_MESSAGE: notification.message || "",
    };

    try {
        const { data, error } = await resend.emails.send({
            from: "FlameSpark <flamespark@mail.flamesparkbeta.com>",
            to: user.email,
            template: {
                id: "8b0d3de5-4109-43e1-8c26-7808fc4ae139",
                variables,
            },
        });

        if (error) {
            throw error;
        }

        await supabaseServiceClient.from("notifications").update({ email_sent: true }).eq("id", notification.id);
        // Update user's last_standard_notification_at
        await supabaseServiceClient.auth.admin.updateUserById(user.id, {
            user_metadata: {
                ...user.user_metadata,
                last_standard_notification_at: new Date().toISOString(),
            },
        });
    } catch (e) {
        console.error("Failed to send single notification email to user:", user.id, e);
    }
}