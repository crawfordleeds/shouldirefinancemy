import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Should I Transfer Balance on Credit Card? | Free Calculator",
  description:
    "Get a clear YES or NO answer on whether to transfer your credit card balance. Free calculator shows savings from 0% APR balance transfer offers, fees, and payoff timeline.",
  keywords: [
    "should I transfer balance on credit card",
    "should I transfer balance on credit card calculator",
    "balance transfer calculator",
    "should I do a balance transfer",
    "credit card balance transfer",
    "credit card balance transfer calculator",
    "0% APR balance transfer",
    "0% balance transfer calculator",
    "balance transfer worth it",
    "is balance transfer worth it calculator",
    "credit card refinance calculator",
    "balance transfer fee calculator",
    "pay off credit card debt",
    "debt consolidation calculator",
    "transfer credit card balance",
    "balance transfer savings calculator",
  ],
  openGraph: {
    title: "Should I Transfer Balance on Credit Card? | Free Calculator",
    description:
      "Get a clear YES or NO answer. Free calculator shows your savings with 0% APR balance transfer offers.",
    url: "https://www.shouldirefinancemy.com/credit-card",
  },
  twitter: {
    title: "Should I Transfer Balance on Credit Card? | Free Calculator",
    description:
      "Get a clear YES or NO answer. Free calculator shows your savings with 0% APR balance transfer offers.",
  },
  alternates: {
    canonical: "https://www.shouldirefinancemy.com/credit-card",
  },
};

export default function CreditCardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
