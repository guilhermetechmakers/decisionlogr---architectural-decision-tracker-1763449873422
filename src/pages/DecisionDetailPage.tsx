import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Copy,
  Edit,
  FileText,
  Archive,
  CheckCircle,
  Send,
  Calendar,
  User,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useDecision, useShareToken, useArchiveDecision, useMarkDecisionDecided, useExportDecision, useSendReminder, useCreateComment } from '@/hooks/useDecision';
import { toast } from 'sonner';
import { useState } from 'react';
import { EditOptionModal } from '@/components/decisions/EditOptionModal';
import { ExportDialog } from '@/components/decisions/ExportDialog';
import { ArchiveConfirmationModal } from '@/components/decisions/ArchiveConfirmationModal';
import { FinalChoicePickerDialog } from '@/components/decisions/FinalChoicePickerDialog';
import { CommentsSection } from '@/components/decisions/CommentsSection';
import { LinkGenerationModal } from '@/components/decisions/LinkGenerationModal';
import { LinkManagementDialog } from '@/components/decisions/LinkManagementDialog';
import { Share2, Settings } from 'lucide-react';

export default function DecisionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: decision, isLoading, error } = useDecision(id || null);
  const { data: shareToken } = useShareToken(id || null);
  const archiveMutation = useArchiveDecision();
  const markDecidedMutation = useMarkDecisionDecided();
  const exportMutation = useExportDecision();
  const sendReminderMutation = useSendReminder();
  const createCommentMutation = useCreateComment();

  const [editOptionId, setEditOptionId] = useState<string | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showFinalChoiceDialog, setShowFinalChoiceDialog] = useState(false);
  const [showLinkGenerationModal, setShowLinkGenerationModal] = useState(false);
  const [showLinkManagementDialog, setShowLinkManagementDialog] = useState(false);

  const copyShareLink = () => {
    if (shareToken) {
      const url = `${window.location.origin}/share/${shareToken.token}`;
      navigator.clipboard.writeText(url);
      toast.success('Share link copied to clipboard');
    } else {
      toast.error('Share link not available. Generate one first.');
      setShowLinkGenerationModal(true);
    }
  };

  const handleLinkGenerated = (token: string) => {
    const url = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(url);
    toast.success('Share link generated and copied to clipboard');
  };

  const handleArchive = () => {
    if (id) {
      archiveMutation.mutate(id, {
        onSuccess: () => {
          setShowArchiveModal(false);
          navigate('/dashboard');
        },
      });
    }
  };

  const handleMarkDecided = (optionId: string) => {
    if (id) {
      markDecidedMutation.mutate(
        { decisionId: id, optionId },
        {
          onSuccess: () => {
            setShowFinalChoiceDialog(false);
          },
        }
      );
    }
  };

  const handleExport = () => {
    if (id) {
      exportMutation.mutate(id);
      setShowExportDialog(false);
    }
  };

  const handleSendReminder = () => {
    if (id) {
      sendReminderMutation.mutate(id);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'decided':
        return 'green';
      case 'waiting_for_client':
        return 'blue';
      case 'pending':
        return 'yellow';
      case 'overdue':
        return 'red';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Skeleton className="h-12 w-64 mb-6" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !decision) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Card>
            <CardContent className="pt-6">
              <p className="text-destructive">Failed to load decision</p>
              <Button onClick={() => navigate('/dashboard')} className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Link
                  to={`/projects/${decision.project.id}`}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {decision.project.name}
                </Link>
                <span className="text-muted-foreground">/</span>
                <Badge variant={getStatusBadgeVariant(decision.status)}>
                  {decision.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <h1 className="text-4xl font-bold mb-2">{decision.title}</h1>
              {decision.area && (
                <p className="text-lg text-muted-foreground mb-4">{decision.area}</p>
              )}
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Required by: {format(new Date(decision.required_by), 'MMM dd, yyyy')}</span>
                </div>
                {decision.assignee && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{decision.assignee.full_name}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {shareToken ? (
                <>
                  <Button onClick={copyShareLink} variant="outline">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Link
                  </Button>
                  <Button
                    onClick={() => setShowLinkManagementDialog(true)}
                    variant="outline"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Manage Links
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setShowLinkGenerationModal(true)}
                  className="bg-[#9D79F9] hover:bg-[#8B6AE8] text-white"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Generate Share Link
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Options Panel */}
        <Card className="mb-6 animate-fade-in-up">
          <CardHeader>
            <CardTitle>Options</CardTitle>
            <CardDescription>Compare the available options for this decision</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {decision.options.map((option) => (
                <Card
                  key={option.id}
                  className={`relative ${option.is_default ? 'ring-2 ring-primary' : ''}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{option.title}</CardTitle>
                      {option.is_default && (
                        <Badge variant="default" className="ml-2">Default</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {option.image_refs && option.image_refs.length > 0 && (
                      <div className="space-y-2">
                        {option.image_refs.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`${option.title} - Image ${idx + 1}`}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}
                    {option.specs && Object.keys(option.specs).length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Specifications</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {Object.entries(option.specs).map(([key, value]) => (
                            <li key={key}>
                              <span className="font-medium">{key}:</span> {String(value)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {option.cost_delta_numeric !== null && (
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Cost Impact</h4>
                        <p
                          className={`text-lg font-bold ${
                            option.cost_delta_numeric >= 0 ? 'text-destructive' : 'text-green-600'
                          }`}
                        >
                          {option.cost_delta_numeric >= 0 ? '+' : ''}
                          ${option.cost_delta_numeric.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {option.pros_cons_text && (
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Pros & Cons</h4>
                        <p className="text-sm text-muted-foreground">{option.pros_cons_text}</p>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setEditOptionId(option.id)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Option
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity & History Feed */}
          <Card className="lg:col-span-2 animate-fade-in-up">
            <CardHeader>
              <CardTitle>Activity & History</CardTitle>
              <CardDescription>Timeline of all actions related to this decision</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {decision.activities.map((activity) => (
                    <div key={activity.id} className="flex gap-4">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {activity.actor_id
                            ? activity.actor_meta?.name?.[0] || 'U'
                            : activity.actor_meta?.name?.[0] || 'G'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">
                            {activity.actor_id
                              ? activity.actor_meta?.name || 'User'
                              : activity.actor_meta?.name || 'Guest'}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(activity.created_at), 'MMM dd, yyyy HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {activity.action_type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  ))}
                  {decision.activities.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No activity yet
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Comments & Q&A Section */}
          <Card className="animate-fade-in-up">
            <CardHeader>
              <CardTitle>Comments & Q&A</CardTitle>
              <CardDescription>Threaded discussions</CardDescription>
            </CardHeader>
            <CardContent>
              <CommentsSection
                decisionId={decision.id}
                comments={decision.comments}
                onCreateComment={(comment) => {
                  createCommentMutation.mutate(comment, {
                    onSuccess: () => {
                      // Query will be invalidated automatically
                    },
                  });
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <Card className="mt-6 animate-fade-in-up">
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => navigate(`/decisions/${id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Decision
              </Button>
              <Button variant="outline" onClick={() => setShowExportDialog(true)}>
                <FileText className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
              <Button variant="outline" onClick={() => setShowArchiveModal(true)}>
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </Button>
              {decision.status !== 'decided' && (
                <Button variant="outline" onClick={() => setShowFinalChoiceDialog(true)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark Decided
                </Button>
              )}
              <Button variant="outline" onClick={handleSendReminder}>
                <Send className="mr-2 h-4 w-4" />
                Send Reminder
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowLinkGenerationModal(true)}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Generate Link
              </Button>
              {shareToken && (
                <Button
                  variant="outline"
                  onClick={() => setShowLinkManagementDialog(true)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Manage Links
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Audit Details */}
        {decision.status === 'decided' && decision.final_choice_option_id && (
          <Card className="mt-6 animate-fade-in-up">
            <CardHeader>
              <CardTitle>Audit Details</CardTitle>
              <CardDescription>Final decision confirmation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Decision Confirmed</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Final choice: {decision.options.find((o) => o.id === decision.final_choice_option_id)?.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  Confirmed at: {format(new Date(decision.updated_at), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modals */}
        {editOptionId && (
          <EditOptionModal
            option={decision.options.find((o) => o.id === editOptionId)!}
            open={!!editOptionId}
            onOpenChange={(open) => !open && setEditOptionId(null)}
          />
        )}

        <ExportDialog
          open={showExportDialog}
          onOpenChange={setShowExportDialog}
          onExport={handleExport}
        />

        <ArchiveConfirmationModal
          open={showArchiveModal}
          onOpenChange={setShowArchiveModal}
          onConfirm={handleArchive}
          decisionTitle={decision.title}
        />

        <FinalChoicePickerDialog
          open={showFinalChoiceDialog}
          onOpenChange={setShowFinalChoiceDialog}
          options={decision.options}
          onSelect={handleMarkDecided}
        />

        {id && (
          <>
            <LinkGenerationModal
              open={showLinkGenerationModal}
              onOpenChange={setShowLinkGenerationModal}
              decisionId={id}
              onSuccess={handleLinkGenerated}
            />

            <LinkManagementDialog
              open={showLinkManagementDialog}
              onOpenChange={setShowLinkManagementDialog}
              decisionId={id}
            />
          </>
        )}
      </div>
    </div>
  );
}
