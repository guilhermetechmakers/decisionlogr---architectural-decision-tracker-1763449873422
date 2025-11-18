import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, FileText, Share2, Clock, Shield, Zap } from "lucide-react";
import { Footer } from "@/components/layout/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 md:py-32">
        <div className="mx-auto max-w-4xl text-center animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            Track Architectural Decisions
            <span className="block text-primary mt-2">With Confidence</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create concise decision cards, share secure links with clients, and maintain a complete audit trail. Fast, simple, and professional.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link to="/signup">Get Started Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Everything You Need
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16 bg-muted/30 rounded-3xl my-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                {index + 1}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Get Started?
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join architects and project managers who trust DecisionLogr for their decision tracking.
        </p>
        <Button asChild size="lg" className="text-lg px-8 py-6">
          <Link to="/signup">Create Your Account</Link>
        </Button>
      </section>
      <Footer />
    </div>
  );
}

const features = [
  {
    icon: FileText,
    title: "Decision Cards",
    description: "Create concise decision cards with 1-3 options, images, specs, and cost impact.",
  },
  {
    icon: Share2,
    title: "Secure Sharing",
    description: "Generate secure, shareable links for clients. No login required for them.",
  },
  {
    icon: Clock,
    title: "Required-by Dates",
    description: "Set deadlines and track decisions with clear required-by dates.",
  },
  {
    icon: Shield,
    title: "Audit Trail",
    description: "Complete activity history and immutable confirmation records.",
  },
  {
    icon: Zap,
    title: "Fast Interaction",
    description: "Clients can ask questions, request changes, or confirm choices instantly.",
  },
  {
    icon: CheckCircle2,
    title: "Export & Archive",
    description: "Export to PDF/CSV and maintain organized decision archives.",
  },
];

const steps = [
  {
    title: "Create Decision",
    description: "Fill in the decision details, add options with images and specs, set the required-by date.",
  },
  {
    title: "Share Link",
    description: "Generate a secure shareable link and send it to your client. They don't need to log in.",
  },
  {
    title: "Track & Confirm",
    description: "Monitor client interactions, receive confirmations, and maintain a complete audit trail.",
  },
];
