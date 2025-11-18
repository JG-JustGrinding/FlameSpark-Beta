import { Lato, Montserrat, Mouse_Memoirs, Quicksand } from 'next/font/google';
import "./globals.css";

const flameSparkFont = Mouse_Memoirs({
  variable: "--flameSpark-font",
  subsets: ['latin'],
  weight: ['400']
});

const lato = Lato({
  variable: "--lato",
  subsets: ['latin'], 
  weight: ['400', '700'] 
});

const montserrat = Montserrat({ 
  variable: "--montserrat",
  subsets: ['latin'], 
  weight: ['400', '700'] 
});

const quicksand = Quicksand({ 
  variable: "--quicksand",
  subsets: ['latin'], 
  weight: ['400', '700'] 
});

export const metadata = {
  title: "FlameSpark",
  description: "Where the Go-Getters Grow",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${lato.variable} ${montserrat.variable} ${quicksand.variable} ${flameSparkFont.variable}`}>
        {children}
      </body>
    </html>
  );
}
