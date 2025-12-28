export const metadata = {
  title: "Welcome - FlameSpark",
  description: "A revolutionary platform where ideas shine and creators get the recognition they deserve. See how FlameSpark helps all creators get the recognition they deserve.",
  alternates: { canonical: `${process.env.DOMAIN_NAME}/welcome` },
  openGraph: {
    title: "Welcome to FlameSpark: Where the Go-Getters Grow",
    description: "Find, support, and create amazing projects on FlameSpark and join a community of creators who don't have to fight for recognition.",
    url: `${process.env.DOMAIN_NAME}/welcome`,
    images: [`${process.env.DOMAIN_NAME}/flamespark_banner.png`],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Welcome to FlameSpark: Where the Go-Getters Grow",
    description: "Find, support, and create amazing projects on FlameSpark and join a community of creators who don't have to fight for recognition.",
    images: [`${process.env.DOMAIN_NAME}/flamespark_banner.png`],
  },
};

export default function WelcomeLayout({ children }) {
  return children;
}
