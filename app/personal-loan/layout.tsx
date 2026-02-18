import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Should I Refinance My Personal Loan? | Free Calculator",
  description:
    "Get a clear YES or NO answer on whether to refinance your personal loan. Calculate your exact savings, break-even point, and monthly payment change. See if refinancing is worth it.",
  keywords: [
    "should I refinance my personal loan",
    "personal loan refinance calculator",
    "refinance personal loan",
    "is refinancing my personal loan worth it",
    "personal loan refinance decision",
    "personal loan savings calculator",
    "debt consolidation refinance",
    "lower personal loan rate",
  ],
  openGraph: {
    title: "Should I Refinance My Personal Loan?",
    description:
      "Get a clear YES or NO answer. See your exact savings and break-even point.",
    url: "https://shouldirefinancemy.com/personal-loan",
  },
  twitter: {
    title: "Should I Refinance My Personal Loan?",
    description:
      "Get a clear YES or NO answer. See your exact savings and break-even point.",
  },
  alternates: {
    canonical: "https://shouldirefinancemy.com/personal-loan",
  },
};

export default function PersonalLoanLayout({ children }: { children: React.ReactNode }) {
  return children;
}
