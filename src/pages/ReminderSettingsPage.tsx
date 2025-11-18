import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CreateReminderModal } from '@/components/reminders/CreateReminderModal';
import { TemplateEditorModal } from '@/components/reminders/TemplateEditorModal';
import { OptOutDialog } from '@/components/reminders/OptOutDialog';
import {
  useReminders,
  useTemplates,
  useDeleteReminder,
  useResumeReminder,
} from '@/hooks/useReminders';
import { ArrowLeft, Plus, MoreVertical, Edit, Trash2, Play, Pause, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ReminderSettingsPage() {
  const navigate = useNavigate();
  const [createReminderOpen, setCreateReminderOpen] = useState(false);
  const [editReminderId, setEditReminderId] = useState<string | undefined>();
  const [templateEditorOpen, setTemplateEditorOpen] = useState(false);
  const [editTemplateId, setEditTemplateId] = useState<string | undefined>();
  const [optOutDialogOpen, setOptOutDialogOpen] = useState(false);
  const [optOutReminderId, setOptOutReminderId] = useState<string>('');
  const [optOutAction, setOptOutAction] = useState<'pause' | 'cancel'>('pause');

  const { data: reminders = [], isLoading: remindersLoading } = useReminders();
  const { data: templates = [], isLoading: templatesLoading } = useTemplates();
  const deleteReminder = useDeleteReminder();
  const resumeReminder = useResumeReminder();

  const handleEditReminder = (reminderId: string) => {
    setEditReminderId(reminderId);
    setCreateReminderOpen(true);
  };

  const handleDeleteReminder = async (reminderId: string) => {
    if (confirm('Are you sure you want to delete this reminder?')) {
      await deleteReminder.mutateAsync(reminderId);
    }
  };

  const handlePauseReminder = (reminderId: string) => {
    setOptOutReminderId(reminderId);
    setOptOutAction('pause');
    setOptOutDialogOpen(true);
  };

  const handleCancelReminder = (reminderId: string) => {
    setOptOutReminderId(reminderId);
    setOptOutAction('cancel');
    setOptOutDialogOpen(true);
  };

  const handleResumeReminder = async (reminderId: string) => {
    await resumeReminder.mutateAsync(reminderId);
  };

  const handleEditTemplate = (templateId: string) => {
    setEditTemplateId(templateId);
    setTemplateEditorOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      paused: 'secondary',
      completed: 'outline',
      cancelled: 'destructive',
    };
    return (
      <Badge variant={variants[status] || 'default'} className="capitalize">
        {status}
      </Badge>
    );
  };

  const getFrequencyLabel = (frequency: string, customDays?: number | null) => {
    if (frequency === 'custom' && customDays) {
      return `Every ${customDays} day${customDays > 1 ? 's' : ''}`;
    }
    return frequency.charAt(0).toUpperCase() + frequency.slice(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Reminder Settings</h1>
          <p className="text-muted-foreground">
            Manage automated reminders for decision deadlines and customize email templates
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content - Reminders */}
          <div className="lg:col-span-2 space-y-6">
            {/* Reminders Section */}
            <Card className="animate-fade-in-up">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Active Reminders</CardTitle>
                  <CardDescription>
                    Configure automated reminders for your decisions
                  </CardDescription>
                </div>
                <Button onClick={() => {
                  setEditReminderId(undefined);
                  setCreateReminderOpen(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Reminder
                </Button>
              </CardHeader>
              <CardContent>
                {remindersLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : reminders.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No reminders configured</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditReminderId(undefined);
                        setCreateReminderOpen(true);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Reminder
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Decision</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Next Reminder</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reminders.map((reminder) => (
                        <TableRow key={reminder.id}>
                          <TableCell className="font-medium">
                            {reminder.decision.title}
                          </TableCell>
                          <TableCell>
                            {getFrequencyLabel(reminder.frequency, reminder.custom_interval_days)}
                          </TableCell>
                          <TableCell>
                            {format(new Date(reminder.next_reminder_date), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>{getStatusBadge(reminder.status)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditReminder(reminder.id)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                {reminder.status === 'paused' ? (
                                  <DropdownMenuItem
                                    onClick={() => handleResumeReminder(reminder.id)}
                                  >
                                    <Play className="mr-2 h-4 w-4" />
                                    Resume
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => handlePauseReminder(reminder.id)}
                                  >
                                    <Pause className="mr-2 h-4 w-4" />
                                    Pause
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => handleCancelReminder(reminder.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Cancel
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteReminder(reminder.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Templates Section */}
            <Card className="animate-fade-in-up">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Email Templates</CardTitle>
                  <CardDescription>
                    Customize reminder email templates with variables
                  </CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditTemplateId(undefined);
                    setTemplateEditorOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Template
                </Button>
              </CardHeader>
              <CardContent>
                {templatesLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : templates.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No templates created</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditTemplateId(undefined);
                        setTemplateEditorOpen(true);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Template
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {templates.map((template) => (
                      <Card key={template.id} className="border">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <CardTitle className="text-lg">{template.template_name}</CardTitle>
                                {template.is_default && (
                                  <Badge variant="secondary">Default</Badge>
                                )}
                              </div>
                              <CardDescription className="mt-1">
                                Subject: {template.subject}
                              </CardDescription>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditTemplate(template.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {template.content}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Quick Info */}
          <div className="space-y-6">
            <Card className="animate-fade-in-up">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Quick Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Template Variables</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li><code className="text-xs bg-muted px-1 py-0.5 rounded">{'{{decision_title}}'}</code> - Decision title</li>
                    <li><code className="text-xs bg-muted px-1 py-0.5 rounded">{'{{required_by}}'}</code> - Required by date</li>
                    <li><code className="text-xs bg-muted px-1 py-0.5 rounded">{'{{project_name}}'}</code> - Project name</li>
                    <li><code className="text-xs bg-muted px-1 py-0.5 rounded">{'{{area}}'}</code> - Decision area</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Reminder Frequency</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Daily: Every day until decision is made</li>
                    <li>• Weekly: Every week until decision is made</li>
                    <li>• Custom: Set your own interval in days</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Notification Channels</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Email: Sent to your registered email</li>
                    <li>• SMS: Text message (requires phone number)</li>
                    <li>• App: In-app notification</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateReminderModal
        open={createReminderOpen}
        onOpenChange={(open) => {
          setCreateReminderOpen(open);
          if (!open) setEditReminderId(undefined);
        }}
        reminderId={editReminderId}
      />

      <TemplateEditorModal
        open={templateEditorOpen}
        onOpenChange={(open) => {
          setTemplateEditorOpen(open);
          if (!open) setEditTemplateId(undefined);
        }}
        templateId={editTemplateId}
        initialData={
          editTemplateId
            ? templates.find((t) => t.id === editTemplateId)
            : undefined
        }
      />

      <OptOutDialog
        open={optOutDialogOpen}
        onOpenChange={setOptOutDialogOpen}
        reminderId={optOutReminderId}
        action={optOutAction}
      />
    </div>
  );
}
