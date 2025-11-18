import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ChevronRight, Download, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Table of contents sections
const TOC_SECTIONS = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'data-collection', title: 'Data Collection' },
  { id: 'data-retention', title: 'Data Retention' },
  { id: 'data-sharing', title: 'Data Sharing' },
  { id: 'user-rights', title: 'User Rights' },
  { id: 'security', title: 'Security Measures' },
  { id: 'cookies', title: 'Cookies and Tracking' },
  { id: 'contact', title: 'Contact Information' },
];

// Privacy Policy content
const PRIVACY_POLICY_CONTENT = {
  version: '1.0',
  effectiveDate: new Date('2024-01-01'),
  sections: [
    {
      id: 'introduction',
      title: 'Introduction',
      content: `Welcome to DecisionLogr. We are committed to protecting your privacy and ensuring transparency about how we collect, use, and protect your personal information. This Privacy Policy explains our practices regarding data collection, retention, sharing, and your rights concerning your personal data.

By using DecisionLogr, you agree to the collection and use of information in accordance with this policy. We encourage you to read this Privacy Policy carefully to understand our practices.`,
    },
    {
      id: 'data-collection',
      title: 'Data Collection',
      content: `We collect information that you provide directly to us and information that is automatically collected when you use our services.

**Information You Provide:**
- Account Information: Name, email address, company name, and password when you create an account
- Profile Information: Optional profile details, preferences, and settings
- Decision Content: Architectural decisions, options, descriptions, images, and related metadata you create
- Communications: Messages, comments, questions, and feedback you send through our platform
- Payment Information: Billing details processed securely through our payment providers (we do not store full credit card numbers)

**Automatically Collected Information:**
- Usage Data: How you interact with our services, features used, pages visited, and time spent
- Device Information: Browser type, operating system, device identifiers, and IP address
- Log Data: Server logs, error reports, and performance metrics
- Cookies and Tracking: Information collected through cookies and similar technologies (see Cookies section)`,
    },
    {
      id: 'data-retention',
      title: 'Data Retention',
      content: `We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.

**Retention Periods:**
- Account Data: Retained while your account is active and for a reasonable period after account closure (typically 30-90 days) to comply with legal obligations
- Decision Records: Retained according to your organization's retention policy or until you request deletion
- Audit Trails: Retained for compliance and legal purposes, typically for 7 years or as required by applicable law
- Marketing Communications: Retained until you opt out or request deletion
- Support Records: Retained for up to 3 years after the last interaction

You may request deletion of your personal data at any time, subject to legal and contractual obligations that may require us to retain certain information.`,
    },
    {
      id: 'data-sharing',
      title: 'Data Sharing',
      content: `We do not sell your personal information. We may share your information only in the following circumstances:

**Service Providers:**
We share information with trusted third-party service providers who perform services on our behalf, including:
- Cloud hosting and infrastructure providers
- Payment processors
- Email delivery services
- Analytics and monitoring tools
- Customer support platforms

These providers are contractually obligated to protect your information and use it only for the purposes we specify.

**Legal Requirements:**
We may disclose your information if required by law, court order, or government regulation, or to:
- Comply with legal processes or respond to government requests
- Protect our rights, property, or safety, or that of our users
- Prevent fraud or security threats
- Enforce our Terms of Service

**Business Transfers:**
In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will notify you of any such change in ownership.

**With Your Consent:**
We may share your information with third parties when you explicitly consent to such sharing.`,
    },
    {
      id: 'user-rights',
      title: 'User Rights',
      content: `Depending on your location, you may have certain rights regarding your personal information:

**Access:**
You have the right to request access to the personal information we hold about you, including details about how we use and share it.

**Correction:**
You can update your account information at any time through your profile settings. You may also request correction of inaccurate or incomplete information.

**Deletion:**
You have the right to request deletion of your personal information, subject to legal and contractual obligations that may require us to retain certain data.

**Data Portability:**
You may request a copy of your data in a structured, machine-readable format.

**Opt-Out:**
You can opt out of marketing communications at any time by clicking the unsubscribe link in emails or adjusting your notification preferences in your account settings.

**Objection to Processing:**
You may object to certain types of data processing, such as direct marketing or processing based on legitimate interests.

**Restriction of Processing:**
You may request that we restrict the processing of your personal information in certain circumstances.

To exercise these rights, please contact us using the information provided in the Contact Information section. We will respond to your request within 30 days, or as required by applicable law.`,
    },
    {
      id: 'security',
      title: 'Security Measures',
      content: `We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction:

**Technical Safeguards:**
- Encryption: Data in transit is encrypted using TLS/SSL protocols
- Secure Storage: Sensitive data is encrypted at rest using industry-standard encryption
- Access Controls: Role-based access controls and authentication mechanisms
- Regular Security Audits: Periodic security assessments and vulnerability testing
- Monitoring: Continuous monitoring for security threats and anomalies

**Organizational Safeguards:**
- Employee Training: Staff trained on data protection and privacy practices
- Limited Access: Access to personal data restricted to authorized personnel only
- Data Processing Agreements: Contracts with service providers that include data protection obligations

**Incident Response:**
In the event of a data breach that may affect your personal information, we will notify you and relevant authorities as required by applicable law.

While we strive to protect your information, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security but are committed to maintaining the highest standards of data protection.`,
    },
    {
      id: 'cookies',
      title: 'Cookies and Tracking',
      content: `We use cookies and similar tracking technologies to collect and store information about your preferences and activity on our platform.

**Types of Cookies:**
- Essential Cookies: Required for the platform to function properly (authentication, security)
- Functional Cookies: Remember your preferences and settings
- Analytics Cookies: Help us understand how users interact with our services
- Marketing Cookies: Used to deliver relevant advertisements (with your consent)

**Your Choices:**
You can control cookies through your browser settings. However, disabling certain cookies may limit your ability to use some features of our platform.

For detailed information about our cookie practices, please see our Cookie Policy.`,
    },
    {
      id: 'contact',
      title: 'Contact Information',
      content: `If you have questions, concerns, or wish to exercise your rights regarding your personal information, please contact us:

**Email:** privacy@decisionlogr.com
**Support:** support@decisionlogr.com
**Address:** [Your Company Address]

**Data Protection Officer:**
If you are located in the European Economic Area (EEA) and have concerns about how we process your personal data, you may contact our Data Protection Officer at dpo@decisionlogr.com.

**Complaints:**
If you believe we have not adequately addressed your privacy concerns, you have the right to file a complaint with your local data protection authority.`,
    },
  ],
};

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState<string>('');
  const [isPrinting, setIsPrinting] = useState(false);

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
  }, []);

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

  const handlePrint = () => {
    setIsPrinting(true);
    toast.loading('Preparing document for printing...', { id: 'print' });
    
    // Small delay to ensure toast shows
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
      toast.dismiss('print');
      toast.success('Print dialog opened');
    }, 100);
  };

  const handleDownload = () => {
    toast.loading('Generating PDF...', { id: 'download' });
    
    // Create a printable version
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow pop-ups to download the PDF');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Privacy Policy - DecisionLogr</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              line-height: 1.6;
              color: #1A1A1A;
              max-width: 800px;
              margin: 0 auto;
              padding: 40px 20px;
            }
            h1 {
              font-size: 32px;
              font-weight: 700;
              margin-bottom: 8px;
            }
            h2 {
              font-size: 24px;
              font-weight: 600;
              margin-top: 32px;
              margin-bottom: 16px;
              color: #1A1A1A;
            }
            p {
              margin-bottom: 16px;
              color: #1A1A1A;
            }
            strong {
              font-weight: 600;
            }
            .meta {
              color: #7A7A7A;
              font-size: 14px;
              margin-bottom: 32px;
            }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <h1>Privacy Policy</h1>
          <div class="meta">
            Version ${PRIVACY_POLICY_CONTENT.version} | Effective: ${format(PRIVACY_POLICY_CONTENT.effectiveDate, 'MMMM d, yyyy')}
          </div>
          ${PRIVACY_POLICY_CONTENT.sections.map(section => `
            <section>
              <h2>${section.title}</h2>
              <div>${section.content.split('\n').map(para => para.trim() ? `<p>${para.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>` : '').join('')}</div>
            </section>
          `).join('')}
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
      toast.dismiss('download');
      toast.success('PDF ready for download');
    }, 500);
  };

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
                  <Shield className="h-5 w-5" />
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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold">Privacy Policy</h1>
                </div>
                {/* Download/Print Buttons */}
                <div className="flex items-center gap-2 print:hidden">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrint}
                    disabled={isPrinting}
                    className="gap-2"
                  >
                    <Printer className="h-4 w-4" />
                    Print
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <p className="text-sm">
                  Version {PRIVACY_POLICY_CONTENT.version}
                </p>
                <Separator orientation="vertical" className="h-4" />
                <p className="text-sm">
                  Effective: {format(PRIVACY_POLICY_CONTENT.effectiveDate, 'MMMM d, yyyy')}
                </p>
              </div>
            </div>

            {/* Privacy Policy Content */}
            <Card className="card-elevated animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <CardContent className="pt-8 pb-12">
                <div className="prose prose-sm md:prose-base max-w-none">
                  {PRIVACY_POLICY_CONTENT.sections.map((section, index) => (
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
                      <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {section.content.split('\n').map((paragraph, pIndex) => {
                          if (!paragraph.trim()) return <br key={pIndex} />;
                          return (
                            <p key={pIndex} className="mb-4">
                              {paragraph.split(/(\*\*.+?\*\*)/).map((part, partIndex) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                  return (
                                    <strong key={partIndex}>
                                      {part.slice(2, -2)}
                                    </strong>
                                  );
                                }
                                return <span key={partIndex}>{part}</span>;
                              })}
                            </p>
                          );
                        })}
                      </div>
                      {index < PRIVACY_POLICY_CONTENT.sections.length - 1 && (
                        <Separator className="mt-8" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card className="mt-8 card-elevated animate-fade-in-up" style={{ animationDelay: '600ms' }}>
              <CardHeader>
                <CardTitle>Questions About Privacy?</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p className="text-muted-foreground mb-4">
                  If you have any questions about this Privacy Policy or wish to exercise your rights, please{' '}
                  <Link to="/contact" className="text-primary hover:underline">
                    contact us
                  </Link>
                  .
                </p>
                <p className="text-muted-foreground mb-4">
                  For information about our terms of use, please see our{' '}
                  <Link to="/terms" className="text-primary hover:underline">
                    Terms of Service
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
