import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Home, GraduationCap, CreditCard } from "lucide-react";

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
      available: false,
    },
    {
      title: "Student Loan",
      description: "Should I refinance my student loans?",
      href: "/student-loan",
      icon: GraduationCap,
      available: false,
    },
    {
      title: "Personal Loan",
      description: "Should I refinance my personal loan?",
      href: "/personal-loan",
      icon: CreditCard,
      available: false,
    },
  ];

  return (
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
      </div>
    </main>
  );
}
