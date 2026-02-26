import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://shouldirefinancemy.com"),
  title: "Should I Refinance My Loan? | Free Refinance Decision Calculator",
  description:
    "Get a clear YES or NO answer on whether you should refinance your car, mortgage, or student loan. Free calculator shows your exact savings and break-even point.",
  keywords: [
    "should I refinance",
    "refinance calculator",
    "should I refinance my car",
    "should I refinance my mortgage",
    "refinance decision",
    "is refinancing worth it",
    "refinance savings calculator",
    "break even refinance",
    "should I transfer balance on credit card",
    "balance transfer calculator",
  ],
  authors: [{ name: "ShouldIRefinanceMy.com" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://shouldirefinancemy.com",
    title: "Should I Refinance My Loan? | Free Decision Calculator",
    description:
      "Get a clear YES or NO answer on whether you should refinance. See your exact savings and break-even point.",
    siteName: "ShouldIRefinanceMy.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Should I Refinance My Loan? | Free Decision Calculator",
    description:
      "Get a clear YES or NO answer on whether you should refinance. See your exact savings and break-even point.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://www.shouldirefinancemy.com" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
