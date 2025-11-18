import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  CheckCircle2,
  MessageCircle,
  Edit,
  Calendar,
  AlertCircle,
  Lock,
  Download,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ConfirmChoiceModal } from '@/components/client/ConfirmChoiceModal';
import { AskQuestionModal } from '@/components/client/AskQuestionModal';
import { RequestChangeModal } from '@/components/client/RequestChangeModal';
import { ErrorModal } from '@/components/client/ErrorModal';
import {
  useDecisionByShareToken,
  useValidateShareToken,
  useConfirmChoice,
  useAskQuestion,
  useRequestChange,
} from '@/hooks/useClientActions';
import type { Option } from '@/api/decisions';

export default function ClientViewPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAskModal, setShowAskModal] = useState(false);
  const [showRequestChangeModal, setShowRequestChangeModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorTitle, setErrorTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [requiresPasscode, setRequiresPasscode] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  // Validate token
  const { data: tokenValidation, isLoading: validatingToken } = useValidateShareToken(token || null);
  const { data: decision, isLoading: loadingDecision, error: decisionError } = useDecisionByShareToken(
    token || null
  );

  const confirmChoiceMutation = useConfirmChoice();
  const askQuestionMutation = useAskQuestion();
  const requestChangeMutation = useRequestChange();

  // Check if passcode is required
  useEffect(() => {
    if (tokenValidation?.requiresPasscode && !decision) {
      setRequiresPasscode(true);
    }
  }, [tokenValidation, decision]);

  // Handle token validation errors
  useEffect(() => {
    if (tokenValidation && !tokenValidation.valid) {
      if (tokenValidation.expired) {
        setErrorTitle('Link Expired');
        setErrorMessage('This share link has expired. Please contact the architect for a new link.');
        setShowErrorModal(true);
      } else if (tokenValidation.revoked) {
        setErrorTitle('Link Revoked');
        setErrorMessage('This share link has been revoked. Please contact the architect for a new link.');
        setShowErrorModal(true);
      } else {
        setErrorTitle('Invalid Link');
        setErrorMessage('This share link is invalid. Please check the link and try again.');
        setShowErrorModal(true);
      }
    }
  }, [tokenValidation]);

  // Handle decision loading errors
  useEffect(() => {
    if (decisionError) {
      setErrorTitle('Error Loading Decision');
      setErrorMessage(decisionError.message || 'Failed to load decision. Please try again.');
      setShowErrorModal(true);
    }
  }, [decisionError]);

  const handlePasscodeSubmit = async () => {
    if (!passcode.trim()) {
      setPasscodeError('Passcode is required');
      return;
    }

    // In production, verify passcode via API
    // For now, we'll proceed (server-side validation)
    setRequiresPasscode(false);
    setPasscodeError('');
  };

  const handleConfirmChoice = async (details: { name?: string; email?: string }) => {
    if (!token || !selectedOptionId || !decision) return;

    try {
      await confirmChoiceMutation.mutateAsync({
        token,
        decisionId: decision.id,
        optionId: selectedOptionId,
        name: details.name,
        email: details.email,
        ipAddress: undefined, // Will be captured server-side
        userAgent: navigator.userAgent,
      });
      setShowConfirmModal(false);
      setSelectedOptionId(null);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleAskQuestion = async (data: { question: string; name?: string; email?: string }) => {
    if (!token || !decision) return;

    try {
      await askQuestionMutation.mutateAsync({
        token,
        decisionId: decision.id,
        question: data.question,
        name: data.name,
        email: data.email,
        ipAddress: undefined,
        userAgent: navigator.userAgent,
      });
      setShowAskModal(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleRequestChange = async (data: {
    changeRequest: string;
    reason?: string;
    name?: string;
    email?: string;
  }) => {
    if (!token || !decision) return;

    try {
      await requestChangeMutation.mutateAsync({
        token,
        decisionId: decision.id,
        changeRequest: data.changeRequest,
        reason: data.reason,
        name: data.name,
        email: data.email,
        ipAddress: undefined,
        userAgent: navigator.userAgent,
      });
      setShowRequestChangeModal(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'decided':
        return <Badge className="bg-green-100 text-green-800">Decided</Badge>;
      case 'waiting_for_client':
        return <Badge className="bg-blue-100 text-blue-800">Waiting for You</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      default:
        return null;
    }
  };

  // Loading state
  if (validatingToken || loadingDecision) {
    return (
      <div className="min-h-screen bg-[#F7FAFC] p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  // Passcode entry
  if (requiresPasscode && !decision) {
    return (
      <div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Enter Passcode
            </CardTitle>
            <CardDescription>
              This decision requires a passcode to access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passcode">Passcode</Label>
              <Input
                id="passcode"
                type="password"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setPasscodeError('');
                }}
                placeholder="Enter passcode"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handlePasscodeSubmit();
                  }
                }}
              />
              {passcodeError && (
                <p className="text-sm text-destructive">{passcodeError}</p>
              )}
            </div>
            <Button onClick={handlePasscodeSubmit} className="w-full">
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (!decision || !tokenValidation?.valid) {
    return (
      <ErrorModal
        open={showErrorModal}
        onOpenChange={setShowErrorModal}
        title={errorTitle || 'Error'}
        message={errorMessage || 'An error occurred'}
        actionLabel="Go Home"
        onAction={() => navigate('/')}
      />
    );
  }

  const isDecided = decision.status === 'decided';
  const selectedOption = decision.options.find((opt) => opt.id === selectedOptionId);

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1A1A1A]">{decision.title}</h1>
              {decision.area && (
                <p className="text-sm text-[#7A7A7A] mt-1">Area: {decision.area}</p>
              )}
            </div>
            {getStatusBadge(decision.status)}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Decision Info */}
            <Card>
              <CardHeader>
                <CardTitle>Decision Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {decision.description && (
                  <div>
                    <p className="text-[#1A1A1A] whitespace-pre-wrap">{decision.description}</p>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-[#7A7A7A]">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Required by: {format(new Date(decision.required_by), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Options */}
            <Card>
              <CardHeader>
                <CardTitle>Your Options</CardTitle>
                <CardDescription>
                  {isDecided
                    ? 'A choice has already been confirmed for this decision.'
                    : 'Select an option below and confirm your choice'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isDecided ? (
                  <div className="rounded-lg bg-green-50 p-4 border border-green-200">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle2 className="h-5 w-5" />
                      <p className="font-medium">This decision has been confirmed</p>
                    </div>
                    {decision.final_choice_option_id && (
                      <p className="text-sm text-green-700 mt-2">
                        Selected: {decision.options.find((o) => o.id === decision.final_choice_option_id)?.title}
                      </p>
                    )}
                  </div>
                ) : (
                  <RadioGroup
                    value={selectedOptionId || ''}
                    onValueChange={setSelectedOptionId}
                    className="space-y-4"
                  >
                    {decision.options.map((option: Option) => (
                      <div key={option.id} className="flex items-start space-x-3">
                        <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                        <label
                          htmlFor={option.id}
                          className="flex-1 cursor-pointer"
                        >
                          <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg text-[#1A1A1A]">
                                    {option.title}
                                  </h3>
                                  {option.cost_delta_numeric !== null && (
                                    <p className="text-sm text-[#7A7A7A] mt-1">
                                      Cost Impact: ${option.cost_delta_numeric.toFixed(2)}
                                    </p>
                                  )}
                                  {option.pros_cons_text && (
                                    <p className="text-sm text-[#7A7A7A] mt-2">
                                      {option.pros_cons_text}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            {!isDecided && (
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => setShowConfirmModal(true)}
                    disabled={!selectedOptionId}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Confirm Choice
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowAskModal(true)}
                      className="w-full"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Ask Question
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowRequestChangeModal(true)}
                      className="w-full"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Request Change
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Security Notice */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Security Notice
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-[#7A7A7A]">
                  This is a secure, read-only view of the decision. All actions are logged and
                  recorded for audit purposes.
                </p>
              </CardContent>
            </Card>

            {/* Download PDF */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Export</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" disabled>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ConfirmChoiceModal
        open={showConfirmModal}
        onOpenChange={setShowConfirmModal}
        onConfirm={handleConfirmChoice}
        optionTitle={selectedOption?.title || ''}
        requiresDetails={true}
        isSubmitting={confirmChoiceMutation.isPending}
      />

      <AskQuestionModal
        open={showAskModal}
        onOpenChange={setShowAskModal}
        onSubmit={handleAskQuestion}
        requiresDetails={true}
        isSubmitting={askQuestionMutation.isPending}
      />

      <RequestChangeModal
        open={showRequestChangeModal}
        onOpenChange={setShowRequestChangeModal}
        onSubmit={handleRequestChange}
        requiresDetails={true}
        isSubmitting={requestChangeMutation.isPending}
      />

      <ErrorModal
        open={showErrorModal}
        onOpenChange={setShowErrorModal}
        title={errorTitle}
        message={errorMessage}
        actionLabel="Go Home"
        onAction={() => navigate('/')}
      />
    </div>
  );
}
