export const metadata = {
	title: "Search - FlameSpark",
	description: "Search projects, users, and content on FlameSpark.",
	robots: {
		index: false,
		follow: true,
	},

    alternates: {
        canonical: `${process.env.DOMAIN_NAME}/search`,
    },
};

export default function SearchLayout({ children }) {
	return children;
}

