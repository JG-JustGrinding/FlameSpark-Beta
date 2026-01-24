export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Home - FlameSpark",
  description:
    "Get updates on followed projects and discover new posts on FlameSpark.",
  alternates: {
    canonical: `${process.env.DOMAIN_NAME}/home`,
  },
  openGraph: {
    title: "Home - FlameSpark",
    description:
      "Get updates on followed projects and discover new posts on FlameSpark.",
    url: `${process.env.DOMAIN_NAME}/home`,
    siteName: "FlameSpark",
    type: "website",
  },
  twitter: {
    title: "Home - FlameSpark",
    description:
      "Get updates on followed projects and discover new posts on FlameSpark.",
  },
};

export default async function HomeLayout({ children }) {
  return children;
}