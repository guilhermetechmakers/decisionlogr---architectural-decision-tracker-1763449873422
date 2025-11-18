import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  BookOpen,
  Mail,
  FileText,
  Clock,
  Loader2,
  X,
  Search,
  ChevronRight,
  Rocket,
  Users,
  Settings,
  MessageSquare,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import {
  useFAQs,
  useFAQCategories,
  useSubmitContactForm,
  useChangelogEntries,
} from '@/hooks/useHelp';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Contact form validation schema
const contactFormSchema = z.object({
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200, 'Subject is too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description is too long'),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

// Quick Start Guide steps
const quickStartSteps = [
  {
    id: 1,
    title: 'Create Your Account',
    description: 'Sign up for DecisionLogr using your email address. Verify your email to get started.',
    icon: Users,
    color: 'bg-[#F4F0FF] text-[#9D79F9]',
  },
  {
    id: 2,
    title: 'Create Your First Project',
    description: 'Set up a project to organize your architectural decisions. Projects help you group related decisions together.',
    icon: Rocket,
    color: 'bg-[#F6FDF6] text-[#5FD37B]',
  },
  {
    id: 3,
    title: 'Create a Decision',
    description: 'Add a new decision with 1-3 options. Include images, specifications, cost impacts, and pros/cons for each option.',
    icon: FileText,
    color: 'bg-[#FFFBE6] text-[#F6C96B]',
  },
  {
    id: 4,
    title: 'Share with Clients',
    description: 'Generate a secure shareable link and send it to your clients. They can view options, ask questions, and confirm choices without logging in.',
    icon: MessageSquare,
    color: 'bg-[#F0F8FF] text-[#6AD8FA]',
  },
  {
    id: 5,
    title: 'Track & Export',
    description: 'Monitor decision status in your dashboard, view activity history, and export decisions as PDFs for your records.',
    icon: Settings,
    color: 'bg-[#F4F0FF] text-[#9D79F9]',
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [contactFile, setContactFile] = useState<File | null>(null);

  // Fetch data
  const { data: faqs = [], isLoading: faqsLoading } = useFAQs(selectedCategory);
  const { data: categories = [] } = useFAQCategories();
  const { data: changelogEntries = [], isLoading: changelogLoading } = useChangelogEntries(10);
  const submitContactForm = useSubmitContactForm();

  // Contact form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  // Filter FAQs by search query
  const filteredFAQs = faqs.filter((faq) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query)
    );
  });

  // Group FAQs by category
  const faqsByCategory = filteredFAQs.reduce((acc, faq) => {
    const category = faq.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(faq);
    return acc;
  }, {} as Record<string, typeof faqs>);

  const onSubmitContactForm = async (data: ContactFormData) => {
    try {
      // TODO: Handle file upload if needed
      await submitContactForm.mutateAsync({
        subject: data.subject,
        description: data.description,
        attachment_url: null,
        attachment_name: contactFile?.name || null,
      });
      reset();
      setContactFile(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        alert('File size must be less than 10MB');
        return;
      }
      setContactFile(file);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 md:py-16 max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center animate-fade-in-up">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">Help & Support</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions, learn how to get started, and get in touch with our support team.
          </p>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="faq" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              <span className="hidden sm:inline">FAQs</span>
            </TabsTrigger>
            <TabsTrigger value="guide" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Quick Start</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Contact</span>
            </TabsTrigger>
            <TabsTrigger value="changelog" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Changelog</span>
            </TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-8">
            {/* Search and Filter */}
            <Card className="card-elevated animate-fade-in-up">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search FAQs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {categories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={selectedCategory === undefined ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(undefined)}
                      >
                        All
                      </Button>
                      {categories.map((category) => (
                        <Button
                          key={category}
                          variant={selectedCategory === category ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedCategory(category)}
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* FAQs */}
            {faqsLoading ? (
              <Card className="card-elevated">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                </CardContent>
              </Card>
            ) : filteredFAQs.length === 0 ? (
              <Card className="card-elevated animate-fade-in-up">
                <CardContent className="pt-6 text-center py-12">
                  <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No FAQs found matching your search.' : 'No FAQs available yet.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {Object.entries(faqsByCategory).map(([category, categoryFAQs], categoryIndex) => (
                  <Card
                    key={category}
                    className="card-elevated animate-fade-in-up"
                    style={{ animationDelay: `${categoryIndex * 100}ms` }}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-lg">{category}</span>
                        <Badge variant="secondary" className="ml-auto">
                          {categoryFAQs.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {categoryFAQs.map((faq) => (
                          <AccordionItem key={faq.id} value={faq.id}>
                            <AccordionTrigger className="text-left font-medium">
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed">
                              <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                                {faq.answer}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Quick Start Guide Tab */}
          <TabsContent value="guide" className="space-y-8">
            <Card className="card-elevated animate-fade-in-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-primary" />
                  Quick Start Guide
                </CardTitle>
                <CardDescription>
                  Get up and running with DecisionLogr in just a few steps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {quickStartSteps.map((step, index) => (
                    <div
                      key={step.id}
                      className="flex gap-6 animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className={cn('w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0', step.color)}>
                        <step.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold">{step.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            Step {step.id}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Additional Resources */}
            <Card className="card-elevated animate-fade-in-up" style={{ animationDelay: '500ms' }}>
              <CardHeader>
                <CardTitle>Additional Resources</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    <Link to="/dashboard" className="text-primary hover:underline flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      Go to Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/decisions/new" className="text-primary hover:underline flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      Create Your First Decision
                    </Link>
                  </li>
                  <li>
                    <Link to="/help" className="text-primary hover:underline flex items-center gap-2">
                      <ChevronRight className="h-4 w-4" />
                      Browse FAQs
                    </Link>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-8">
            <Card className="card-elevated animate-fade-in-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Contact Support
                </CardTitle>
                <CardDescription>
                  Have a question or need help? Send us a message and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmitContactForm)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="What can we help you with?"
                      {...register('subject')}
                      className={cn(errors.subject && 'border-destructive')}
                    />
                    {errors.subject && (
                      <p className="text-sm text-destructive">{errors.subject.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Please provide as much detail as possible..."
                      rows={6}
                      {...register('description')}
                      className={cn(errors.description && 'border-destructive')}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">{errors.description.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="attachment">Attachment (Optional)</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="attachment"
                        type="file"
                        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                        onChange={handleFileChange}
                        className="cursor-pointer"
                      />
                      {contactFile && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          <span>{contactFile.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setContactFile(null)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Maximum file size: 10MB. Supported formats: PDF, DOC, DOCX, TXT, PNG, JPG, JPEG
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Changelog Tab */}
          <TabsContent value="changelog" className="space-y-8">
            {changelogLoading ? (
              <Card className="card-elevated">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                </CardContent>
              </Card>
            ) : changelogEntries.length === 0 ? (
              <Card className="card-elevated animate-fade-in-up">
                <CardContent className="pt-6 text-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No changelog entries available yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {changelogEntries.map((entry, index) => (
                  <Card
                    key={entry.id}
                    className="card-elevated animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-xl">{entry.title}</CardTitle>
                            <Badge
                              variant={
                                entry.release_type === 'major'
                                  ? 'default'
                                  : entry.release_type === 'minor'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {entry.release_type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="font-mono">v{entry.version_number}</span>
                            <Separator orientation="vertical" className="h-4" />
                            <span>{format(new Date(entry.release_date), 'MMMM d, yyyy')}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap mb-4">
                        {entry.description}
                      </div>
                      {entry.highlights && entry.highlights.length > 0 && (
                        <div className="space-y-2 mb-4">
                          <h4 className="font-semibold text-foreground">Highlights:</h4>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            {entry.highlights.map((highlight, i) => (
                              <li key={i}>{highlight}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {entry.breaking_changes && (
                        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 mb-4">
                          <h4 className="font-semibold text-destructive mb-2">Breaking Changes</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {entry.breaking_changes}
                          </p>
                        </div>
                      )}
                      {entry.migration_notes && (
                        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                          <h4 className="font-semibold text-primary mb-2">Migration Notes</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {entry.migration_notes}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Legal Links Section */}
        <Card className="mt-12 card-elevated animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <CardHeader>
            <CardTitle>Legal & Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/terms"
                className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
              >
                <FileText className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                <div>
                  <h4 className="font-semibold group-hover:text-primary transition-colors">Terms of Service</h4>
                  <p className="text-sm text-muted-foreground">Read our terms and conditions</p>
                </div>
              </Link>
              <Link
                to="/cookies"
                className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
              >
                <FileText className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                <div>
                  <h4 className="font-semibold group-hover:text-primary transition-colors">Cookie Policy</h4>
                  <p className="text-sm text-muted-foreground">Learn about our cookie usage</p>
                </div>
              </Link>
              <Link
                to="/privacy"
                className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
              >
                <FileText className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                <div>
                  <h4 className="font-semibold group-hover:text-primary transition-colors">Privacy Policy</h4>
                  <p className="text-sm text-muted-foreground">How we protect your data</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
