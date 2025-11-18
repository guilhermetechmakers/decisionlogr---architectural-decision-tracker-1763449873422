import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateExport } from '@/hooks/useExports';
import { FileDown, Loader2 } from 'lucide-react';

interface DecisionExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decisionId?: string;
  projectId?: string;
  decisionTitle?: string;
  projectName?: string;
}

export function DecisionExportModal({
  open,
  onOpenChange,
  decisionId,
  projectId,
  decisionTitle,
  projectName,
}: DecisionExportModalProps) {
  const [format, setFormat] = useState<'pdf' | 'csv'>('pdf');
  const [includeImages, setIncludeImages] = useState(true);
  const [includeAuditTrail, setIncludeAuditTrail] = useState(true);

  const createExport = useCreateExport();

  const handleExport = () => {
    if (!decisionId && !projectId) {
      return;
    }

    createExport.mutate(
      {
        decisionId,
        projectId,
        exportType: format,
        includeImages,
        includeAuditTrail,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const exportTarget = decisionId ? decisionTitle || 'Decision' : projectName || 'Project';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#1A1A1A]">
            Export {exportTarget}
          </DialogTitle>
          <DialogDescription className="text-[#7A7A7A]">
            Choose export format and options. You'll receive an email notification when the export is ready.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-[#1A1A1A]">Export Format</Label>
            <RadioGroup
              value={format}
              onValueChange={(value) => setFormat(value as 'pdf' | 'csv')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="font-normal text-[#7A7A7A] cursor-pointer">
                  PDF Document
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="font-normal text-[#7A7A7A] cursor-pointer">
                  CSV Spreadsheet
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-[#1A1A1A]">Export Options</Label>
            <div className="space-y-2">
              {format === 'pdf' && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeImages"
                    checked={includeImages}
                    onCheckedChange={(checked) => setIncludeImages(checked === true)}
                  />
                  <Label
                    htmlFor="includeImages"
                    className="text-sm font-normal text-[#7A7A7A] cursor-pointer"
                  >
                    Include images and attachments
                  </Label>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeAuditTrail"
                  checked={includeAuditTrail}
                  onCheckedChange={(checked) => setIncludeAuditTrail(checked === true)}
                />
                <Label
                  htmlFor="includeAuditTrail"
                  className="text-sm font-normal text-[#7A7A7A] cursor-pointer"
                >
                  Include audit trail and activity history
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-full"
            disabled={createExport.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={createExport.isPending}
            className="rounded-full bg-[#9D79F9] hover:bg-[#8B6AE8] text-white hover:scale-105 transition-transform"
          >
            {createExport.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Export...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Create Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
