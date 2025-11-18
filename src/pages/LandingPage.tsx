import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FileText, Share2, CheckCircle2,
  ArrowRight, Star, Quote
} from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { DemoRequestDialog } from '@/components/landing/DemoRequestDialog';
import { 
  useLandingFeatures, 
  useLandingTestimonials, 
  useLandingPricingTiers 
} from '@/hooks/useLanding';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

// Icon mapping helper
function getIcon(iconName: string | null) {
  if (!iconName) return FileText;
  const IconComponent = (LucideIcons as any)[iconName];
  return IconComponent || FileText;
}

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { data: features = [], isLoading: featuresLoading } = useLandingFeatures();
  const { data: testimonials = [], isLoading: testimonialsLoading } = useLandingTestimonials();
  const { data: pricingTiers = [], isLoading: pricingLoading } = useLandingPricingTiers();

  // Intersection Observer for scroll animations
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({
              ...prev,
              [entry.target.id]: true,
            }));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref && observerRef.current) {
        observerRef.current.observe(ref);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [features, testimonials, pricingTiers]);

  // Fallback features if database is empty
  const displayFeatures = features.length > 0 ? features : [
    { id: '1', title: 'Decision Cards', description: 'Create concise decision cards with 1-3 options, images, specs, and cost impact.', icon_name: 'FileText' },
    { id: '2', title: 'Secure Sharing', description: 'Generate secure, shareable links for clients. No login required for them.', icon_name: 'Share2' },
    { id: '3', title: 'Required-by Dates', description: 'Set deadlines and track decisions with clear required-by dates.', icon_name: 'Clock' },
    { id: '4', title: 'Audit Trail', description: 'Complete activity history and immutable confirmation records.', icon_name: 'Shield' },
    { id: '5', title: 'Fast Interaction', description: 'Clients can ask questions, request changes, or confirm choices instantly.', icon_name: 'Zap' },
    { id: '6', title: 'Export & Archive', description: 'Export to PDF/CSV and maintain organized decision archives.', icon_name: 'CheckCircle2' },
  ];

  const steps = [
    {
      title: 'Create Decision',
      description: 'Fill in the decision details, add options with images and specs, set the required-by date.',
      icon: FileText,
    },
    {
      title: 'Share Link',
      description: 'Generate a secure shareable link and send it to your client. They don\'t need to log in.',
      icon: Share2,
    },
    {
      title: 'Track & Confirm',
      description: 'Monitor client interactions, receive confirmations, and maintain a complete audit trail.',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNavbar />
      
      {/* Hero Section with Animated Gradient Background */}
      <section 
        id="hero"
        className="relative overflow-hidden pt-24 pb-32 md:pt-32 md:pb-40"
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-background animate-gradient-shift" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(157,121,249,0.1),transparent_50%)]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div 
            ref={(el) => (sectionRefs.current.hero = el)}
            className={cn(
              "mx-auto max-w-4xl text-center transition-all duration-1000",
              isVisible.hero ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            )}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Track Architectural Decisions
              <span className="block text-primary mt-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                With Confidence
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Create concise decision cards, share secure links with clients, and maintain a complete audit trail. Fast, simple, and professional.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-shadow">
                <Link to="/signup">Get Started Free</Link>
              </Button>
              <DemoRequestDialog />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section 
        id="features"
        className="container mx-auto px-4 py-16 md:py-24"
      >
        <div 
          ref={(el) => (sectionRefs.current.features = el)}
          className={cn(
            "text-center mb-12 transition-all duration-1000 delay-100",
            isVisible.features ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to streamline your decision-making process
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {featuresLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="card-elevated">
                <CardHeader>
                  <Skeleton className="w-12 h-12 rounded-lg mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
              </Card>
            ))
          ) : (
            displayFeatures.map((feature, index) => {
              const IconComponent = getIcon(feature.icon_name);
              return (
                <Card
                  key={feature.id}
                  className={cn(
                    "card-elevated transition-all duration-500",
                    isVisible.features ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                  )}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })
          )}
        </div>
      </section>

      {/* How It Works */}
      <section 
        id="how-it-works"
        className="container mx-auto px-4 py-16 md:py-24"
      >
        <div className="bg-gradient-to-br from-accent/30 via-background to-accent/20 rounded-3xl p-8 md:p-16">
          <div 
            ref={(el) => (sectionRefs.current.howItWorks = el)}
            className={cn(
              "text-center mb-12 transition-all duration-1000",
              isVisible.howItWorks ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            )}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div
                  key={index}
                  className={cn(
                    "text-center transition-all duration-500 relative",
                    isVisible.howItWorks ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                  )}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg hover:scale-110 transition-transform">
                    <IconComponent className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                  {index < steps.length - 1 && (
                    <ArrowRight className="hidden md:block absolute top-8 right-0 w-8 h-8 text-primary/50 transform translate-x-8" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      {pricingTiers.length > 0 && (
        <section 
          id="pricing"
          className="container mx-auto px-4 py-16 md:py-24"
        >
          <div 
            ref={(el) => (sectionRefs.current.pricing = el)}
            className={cn(
              "text-center mb-12 transition-all duration-1000",
              isVisible.pricing ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            )}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that works for you
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {pricingLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="card-elevated">
                  <CardHeader>
                    <Skeleton className="h-8 w-1/2 mb-4" />
                    <Skeleton className="h-12 w-full mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                  </CardHeader>
                </Card>
              ))
            ) : (
              pricingTiers.map((tier, index) => (
                <Card
                  key={tier.id}
                  className={cn(
                    "card-elevated transition-all duration-500 relative",
                    tier.is_popular && "ring-2 ring-primary shadow-xl",
                    isVisible.pricing ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                  )}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  {tier.is_popular && (
                    <Badge className="absolute top-4 right-4" variant="lavender">
                      Popular
                    </Badge>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl mb-2">{tier.tier_name}</CardTitle>
                    <div className="mb-4">
                      {tier.price_monthly !== null ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-bold">${tier.price_monthly}</span>
                          <span className="text-muted-foreground">/month</span>
                        </div>
                      ) : (
                        <div className="text-2xl font-bold">Free</div>
                      )}
                    </div>
                    {tier.description && (
                      <p className="text-muted-foreground mb-4">{tier.description}</p>
                    )}
                    <ul className="space-y-2 mb-6 text-left">
                      {Array.isArray(tier.features_included) && tier.features_included.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button asChild className="w-full" size="lg">
                      <Link to="/signup">{tier.cta_text}</Link>
                    </Button>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </section>
      )}

      {/* Social Proof / Testimonials */}
      {testimonials.length > 0 && (
        <section 
          id="testimonials"
          className="container mx-auto px-4 py-16 md:py-24 bg-muted/30"
        >
          <div 
            ref={(el) => (sectionRefs.current.testimonials = el)}
            className={cn(
              "text-center mb-12 transition-all duration-1000",
              isVisible.testimonials ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            )}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by Architects
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what our users are saying
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonialsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="card-elevated">
                  <CardHeader>
                    <Skeleton className="h-16 w-16 rounded-full mb-4" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                  </CardHeader>
                </Card>
              ))
            ) : (
              testimonials.slice(0, 6).map((testimonial, index) => (
                <Card
                  key={testimonial.id}
                  className={cn(
                    "card-elevated transition-all duration-500",
                    isVisible.testimonials ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                  )}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-start gap-4 mb-4">
                      {testimonial.user_pic_url ? (
                        <img
                          src={testimonial.user_pic_url}
                          alt={testimonial.user_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-bold text-lg">
                            {testimonial.user_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-semibold">{testimonial.user_name}</div>
                        {testimonial.firm_name && (
                          <div className="text-sm text-muted-foreground">{testimonial.firm_name}</div>
                        )}
                        {testimonial.role && (
                          <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                        )}
                        {testimonial.rating && (
                          <div className="flex gap-1 mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-4 w-4",
                                  i < testimonial.rating! ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                )}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="relative">
                      <Quote className="absolute -top-2 -left-2 h-8 w-8 text-primary/20" />
                      <p className="text-muted-foreground italic pl-6">{testimonial.feedback}</p>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </section>
      )}

      {/* Final CTA Section */}
      <section className="container mx-auto px-4 py-24 md:py-32 text-center">
        <div 
          ref={(el) => (sectionRefs.current.cta = el)}
          className={cn(
            "max-w-3xl mx-auto transition-all duration-1000",
            isVisible.cta ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join architects and project managers who trust DecisionLogr for their decision tracking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-shadow">
              <Link to="/signup">Create Your Account</Link>
            </Button>
            <DemoRequestDialog />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
