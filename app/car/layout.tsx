import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Should I Refinance My Car Loan? | Free Auto Refinance Calculator",
  description:
    "Get a clear YES or NO answer on whether to refinance your car loan. See your exact savings, break-even point, and monthly payment change. Free calculator.",
  keywords: [
    "should I refinance my car",
    "car refinance calculator",
    "auto loan refinance calculator",
    "is refinancing my car worth it",
    "car refinance decision",
    "auto refinance savings",
    "refinance car loan calculator",
  ],
  openGraph: {
    title: "Should I Refinance My Car Loan?",
    description:
      "Get a clear YES or NO answer. See your exact savings and break-even point.",
    url: "https://shouldirefinancemy.com/car",
  },
  twitter: {
    title: "Should I Refinance My Car Loan?",
    description:
      "Get a clear YES or NO answer. See your exact savings and break-even point.",
  },
};

export default function CarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
