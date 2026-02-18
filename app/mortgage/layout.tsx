import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Should I Refinance My Mortgage? | Free Home Loan Refinance Calculator",
  description:
    "Get a clear YES or NO answer on whether to refinance your mortgage. Calculate your exact savings, break-even point, PMI elimination, and monthly payment change. Free calculator with expert decision logic.",
  keywords: [
    "should I refinance my mortgage",
    "mortgage refinance calculator",
    "home loan refinance calculator",
    "is refinancing my mortgage worth it",
    "mortgage refinance decision",
    "refinance savings calculator",
    "break even refinance calculator",
    "PMI refinance calculator",
    "when to refinance mortgage",
    "mortgage refi calculator",
  ],
  openGraph: {
    title: "Should I Refinance My Mortgage?",
    description:
      "Get a clear YES or NO answer. See your exact savings, break-even point, and PMI impact.",
    url: "https://shouldirefinancemy.com/mortgage",
  },
  twitter: {
    title: "Should I Refinance My Mortgage?",
    description:
      "Get a clear YES or NO answer. See your exact savings, break-even point, and PMI impact.",
  },
  alternates: {
    canonical: "https://shouldirefinancemy.com/mortgage",
  },
};

export default function MortgageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
