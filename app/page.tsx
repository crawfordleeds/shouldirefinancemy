import Link from "next/link";
import Script from "next/script";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Home, Wallet, CreditCard } from "lucide-react";

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ShouldIRefinanceMy.com",
  "url": "https://shouldirefinancemy.com",
  "description": "Free refinance calculators that give you a clear YES or NO decision on whether to refinance your car, mortgage, personal loan, or do a balance transfer",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Any",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "featureList": [
    "Car loan refinance calculator",
    "Mortgage refinance calculator",
    "Personal loan refinance calculator",
    "Credit card balance transfer calculator",
    "Should I transfer balance on credit card calculator"
  ]
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How do I know if I should refinance?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Use our calculators to get a clear YES or NO answer. Generally, refinancing makes sense when you can get a lower interest rate, your break-even point is reasonable, and you plan to keep the loan long enough to recover any fees."
      }
    },
    {
      "@type": "Question",
      "name": "What is a break-even point for refinancing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The break-even point is how long it takes for your monthly savings to cover the costs of refinancing. For example, if refinancing costs $1,000 and saves you $50/month, your break-even is 20 months."
      }
    },
    {
      "@type": "Question",
      "name": "Does refinancing hurt your credit score?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Refinancing triggers a hard credit inquiry, which may temporarily lower your score by a few points. However, if refinancing helps you manage payments better or lowers your credit utilization, it can improve your score long-term."
      }
    }
  ]
};

export default function HomePage() {
  const tools = [
    {
      title: "Car Loan",
      description: "Should I refinance my auto loan?",
      href: "/car",
      icon: Car,
      available: true,
    },
    {
      title: "Mortgage",
      description: "Should I refinance my home loan?",
      href: "/mortgage",
      icon: Home,
      available: true,
    },
    {
      title: "Personal Loan",
      description: "Should I refinance my personal loan?",
      href: "/personal-loan",
      icon: Wallet,
      available: true,
    },
    {
      title: "Credit Card",
      description: "Should I transfer my balance?",
      href: "/credit-card",
      icon: CreditCard,
      available: true,
    },
  ];

  return (
    <>
      <Script
        id="webapp-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mb-4">
              Should I Refinance My...
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get a clear <span className="font-semibold text-primary">YES</span> or{" "}
              <span className="font-semibold text-destructive">NO</span> answer. 
              Not just numbers — a decision with the math to back it up.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {tools.map((tool) => (
              <Card 
                key={tool.href} 
                className={`transition-all hover:shadow-lg ${
                  tool.available 
                    ? "hover:border-primary cursor-pointer" 
                    : "opacity-60"
                }`}
              >
                {tool.available ? (
                  <Link href={tool.href} className="block">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <tool.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{tool.title}</CardTitle>
                          <CardDescription>{tool.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <span className="text-sm text-primary font-medium">
                        Calculate now →
                      </span>
                    </CardContent>
                  </Link>
                ) : (
                  <>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          <tool.icon className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{tool.title}</CardTitle>
                          <CardDescription>{tool.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <span className="text-sm text-muted-foreground">
                        Coming soon
                      </span>
                    </CardContent>
                  </>
                )}
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-4">Why Use This Calculator?</h2>
            <div className="grid gap-6 md:grid-cols-3 text-left">
              <div className="p-4">
                <h3 className="font-semibold mb-2">📊 Clear Answer</h3>
                <p className="text-sm text-muted-foreground">
                  Not just numbers — you get a YES or NO recommendation with reasoning.
                </p>
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-2">💰 See Your Savings</h3>
                <p className="text-sm text-muted-foreground">
                  Know exactly how much you&apos;ll save over the life of your loan.
                </p>
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-2">⏱️ Break-Even Point</h3>
                <p className="text-sm text-muted-foreground">
                  See how long until refinancing fees pay for themselves.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section for SEO */}
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">How do I know if I should refinance?</h3>
                <p className="text-muted-foreground">
                  Use our calculators to get a clear YES or NO answer. Generally, refinancing makes sense 
                  when you can get a lower interest rate, your break-even point is reasonable, and you 
                  plan to keep the loan long enough to recover any fees.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">What is a break-even point for refinancing?</h3>
                <p className="text-muted-foreground">
                  The break-even point is how long it takes for your monthly savings to cover the costs 
                  of refinancing. For example, if refinancing costs $1,000 and saves you $50/month, your 
                  break-even is 20 months.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Does refinancing hurt your credit score?</h3>
                <p className="text-muted-foreground">
                  Refinancing triggers a hard credit inquiry, which may temporarily lower your score by a 
                  few points. However, if refinancing helps you manage payments better or lowers your 
                  credit utilization, it can improve your score long-term.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
