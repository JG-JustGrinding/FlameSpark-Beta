import { Html, Head, Preview, Body, Container, Section, Text, Heading, Hr, Button } from "@react-email/components";

export default function DigestEmail({ username, totalNotifications, newNotifSegments, ctaUrl }) {
  return (
    <Html>
      <Head />
      <Preview>
        {`You have ${totalNotifications} new notifications since your last check.`}
      </Preview>
      <Body style={{ backgroundColor: '#f6f8fa', fontFamily: 'Montserrat, Lato, sans-serif', color: '#222' }}>
        <Container style={{ maxWidth: 600, margin: '40px auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 32 }}>
          <Section style={{ textAlign: 'center', marginBottom: 24 }}>
            <img
              src="https://flamesparkbeta.com/Logo_SubtlePadding_Background_White.png"
              alt="FlameSpark Logo"
              width="180"
              style={{ margin: '0 auto', display: 'block', height: 'auto', maxWidth: '100%' }}
            />
          </Section>
          <Section>
            <Heading as="h2" style={{ marginBottom: 0 }}>
              Hello{username ? `, ${username}` : ''}!
            </Heading>
            <Text style={{ fontSize: 18, margin: '16px 0 8px 0' }}>
              You have <b>{totalNotifications}</b> new notification{totalNotifications === 1 ? '' : 's'} since you've last checked.
            </Text>
          </Section>
          <Hr style={{ margin: '24px 0' }} />
          <Section>
            {newNotifSegments.map ((segment, index) => (
              <Text key={index} style={{ fontSize: 16, margin: '8px 0' }}>
                {segment.emoji ? `${segment.emoji} ` : '●'}<b>{segment.count}</b> {segment.text}
              </Text>
            ))}
            <Text style={{ fontSize: 16, margin: '8px 0' }}>
            <b>. . .</b>
            </Text>
          </Section>
          <Hr style={{ margin: '24px 0' }} />
          <Section style={{ textAlign: 'center' }}>
            <Button
              href={ctaUrl || 'https://flamesparkbeta.com'}
              style={{ backgroundColor: '#eb5036', color: '#fff', padding: '12px 32px', borderRadius: 6, fontSize: 16, textDecoration: 'none', border: 'none', fontWeight: 'bold' }}
            >
              View on FlameSpark
            </Button>
          </Section>
          <Hr style={{ margin: '32px 0 16px 0' }} />
          <Text style={{ fontSize: 13, color: '#888', textAlign: 'center' }}>
            You are receiving this email because you have digest notifications enabled on FlameSpark.<br />
            You can adjust your email preferences <a href='https://flamesparkbeta.com/account' rel="noopener noreferrer nofollow" style={{color:'#0670DB', textDecorationLine:'none', textDecoration:'underline'}} target="_blank">here</a>.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
