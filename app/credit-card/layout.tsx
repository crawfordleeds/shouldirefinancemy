import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Should I Do a Balance Transfer? | Credit Card Calculator",
  description:
    "Get a clear YES or NO answer on whether a credit card balance transfer is worth it. Calculate savings from 0% APR offers, factor in transfer fees, and see if you can pay off during the promo period.",
  keywords: [
    "balance transfer calculator",
    "should I do a balance transfer",
    "credit card balance transfer",
    "0% APR balance transfer",
    "balance transfer worth it",
    "credit card refinance calculator",
    "balance transfer fee calculator",
    "pay off credit card debt",
    "debt consolidation calculator",
  ],
  openGraph: {
    title: "Should I Do a Balance Transfer?",
    description:
      "Get a clear YES or NO answer. Calculate your savings with 0% APR offers.",
    url: "https://shouldirefinancemy.com/credit-card",
  },
  twitter: {
    title: "Should I Do a Balance Transfer?",
    description:
      "Get a clear YES or NO answer. Calculate your savings with 0% APR offers.",
  },
  alternates: {
    canonical: "https://shouldirefinancemy.com/credit-card",
  },
};

export default function CreditCardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
