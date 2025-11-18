import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ChevronRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { useCurrentTermsOfService } from '@/hooks/useTerms';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Table of contents sections
const TOC_SECTIONS = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'service-scope', title: 'Service Scope' },
  { id: 'user-obligations', title: 'User Obligations' },
  { id: 'intellectual-property', title: 'Intellectual Property' },
  { id: 'termination', title: 'Termination' },
  { id: 'liability', title: 'Liability' },
  { id: 'governing-law', title: 'Governing Law' },
  { id: 'changes', title: 'Changes to Terms' },
];

export default function TermsOfServicePage() {
  const { data: terms, isLoading, error } = useCurrentTermsOfService();
  const [activeSection, setActiveSection] = useState<string>('');

  // Scroll spy for table of contents
  useEffect(() => {
    const handleScroll = () => {
      const sections = TOC_SECTIONS.map((s) => s.id);
      const scrollPosition = window.scrollY + 200; // Offset for header

      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i]);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [terms]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  // Default ToS content if none exists in database
  const defaultContent = `
# Terms of Service

**Last Updated:** ${terms ? format(new Date(terms.effective_date), 'MMMM d, yyyy') : 'N/A'}

## Introduction

Welcome to DecisionLogr. These Terms of Service ("Terms") govern your access to and use of DecisionLogr's services, including our website, applications, and related services (collectively, the "Service"). By accessing or using our Service, you agree to be bound by these Terms.

## Service Scope

DecisionLogr provides a platform for architectural decision tracking and client collaboration. We reserve the right to modify, suspend, or discontinue any part of the Service at any time, with or without notice.

## User Obligations

You agree to:
- Provide accurate and complete information when creating an account
- Maintain the security of your account credentials
- Use the Service only for lawful purposes
- Not interfere with or disrupt the Service or servers
- Not attempt to gain unauthorized access to any part of the Service

## Intellectual Property

All content, features, and functionality of the Service, including but not limited to text, graphics, logos, and software, are the property of DecisionLogr or its licensors and are protected by copyright, trademark, and other intellectual property laws.

## Termination

We may terminate or suspend your account and access to the Service immediately, without prior notice, for any breach of these Terms. Upon termination, your right to use the Service will cease immediately.

## Liability

TO THE MAXIMUM EXTENT PERMITTED BY LAW, DECISIONLOGR SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.

## Governing Law

These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which DecisionLogr operates, without regard to its conflict of law provisions.

## Changes to Terms

We reserve the right to modify these Terms at any time. We will notify users of any material changes via email or through the Service. Your continued use of the Service after such modifications constitutes acceptance of the updated Terms.
`;

  const content = terms?.content || defaultContent;

  // Parse content into sections (simple markdown-like parsing)
  const parseContent = (text: string) => {
    // Split by headers (## or ###)
    const lines = text.split('\n');
    const sections: { id: string; title: string; content: string }[] = [];
    let currentSection: { id: string; title: string; content: string } | null = null;

    lines.forEach((line) => {
      const h2Match = line.match(/^##\s+(.+)$/);
      const h3Match = line.match(/^###\s+(.+)$/);

      if (h2Match) {
        // Save previous section
        if (currentSection) {
          sections.push(currentSection);
        }
        // Start new section
        const title = h2Match[1].trim();
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        currentSection = { id, title, content: '' };
      } else if (currentSection) {
        // Skip h3 headers in content
        if (!h3Match) {
          currentSection.content += line + '\n';
        }
      }
    });

    // Add last section
    if (currentSection) {
      sections.push(currentSection);
    }

    return sections.length > 0 ? sections : null;
  };

  const sections = parseContent(content);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12 md:py-16 max-w-5xl">
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12 md:py-16 max-w-5xl">
          <Card className="card-elevated">
            <CardContent className="pt-6">
              <p className="text-destructive">Failed to load Terms of Service. Please try again later.</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 md:py-16 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents Sidebar */}
          <aside className="lg:col-span-1">
            <Card className="sticky top-24 card-elevated animate-fade-in-up">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Table of Contents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  {TOC_SECTIONS.map((section) => {
                    const isActive = activeSection === section.id;
                    return (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={cn(
                          'w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2',
                          isActive
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        )}
                      >
                        <ChevronRight
                          className={cn(
                            'h-4 w-4 transition-transform duration-200',
                            isActive ? 'translate-x-0' : '-translate-x-1 opacity-0'
                          )}
                        />
                        {section.title}
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="mb-12 animate-fade-in-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold">Terms of Service</h1>
              </div>
              {terms && (
                <div className="flex items-center gap-4 text-muted-foreground">
                  <p className="text-sm">
                    Version {terms.version_number}
                  </p>
                  <Separator orientation="vertical" className="h-4" />
                  <p className="text-sm">
                    Effective: {format(new Date(terms.effective_date), 'MMMM d, yyyy')}
                  </p>
                </div>
              )}
            </div>

            {/* Terms Content */}
            <Card className="card-elevated animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <CardContent className="pt-8 pb-12">
                <div className="prose prose-sm md:prose-base max-w-none">
                  {sections && sections.length > 0 ? (
                    sections.map((section, index) => (
                      <div
                        key={section.id}
                        id={section.id}
                        className={cn(
                          'mb-12 scroll-mt-24',
                          index === 0 && 'animate-fade-in-up'
                        )}
                        style={{ animationDelay: `${(index + 1) * 100}ms` }}
                      >
                        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
                          {section.title}
                        </h2>
                        <div
                          className="text-muted-foreground leading-relaxed whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{
                            __html: section.content
                              .trim()
                              .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                              .replace(/\n\n+/g, '</p><p>')
                              .replace(/^/, '<p>')
                              .replace(/$/, '</p>'),
                          }}
                        />
                        {index < sections.length - 1 && (
                          <Separator className="mt-8" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div
                      className="text-muted-foreground leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        __html: content
                          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\n\n+/g, '</p><p>')
                          .replace(/^/, '<p>')
                          .replace(/$/, '</p>'),
                      }}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card className="mt-8 card-elevated animate-fade-in-up" style={{ animationDelay: '600ms' }}>
              <CardHeader>
                <CardTitle>Questions About These Terms?</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p className="text-muted-foreground mb-4">
                  If you have any questions about these Terms of Service, please{' '}
                  <Link to="/contact" className="text-primary hover:underline">
                    contact us
                  </Link>
                  .
                </p>
                <p className="text-muted-foreground mb-4">
                  For information about how we handle your data, please see our{' '}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
                <p className="text-muted-foreground">
                  For information about cookies, please see our{' '}
                  <Link to="/cookies" className="text-primary hover:underline">
                    Cookie Policy
                  </Link>
                  .
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
