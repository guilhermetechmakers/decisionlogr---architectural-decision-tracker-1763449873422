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
import { useExportActivities } from '@/hooks/useActivities';
import type { ExportOptions } from '@/api/activities';

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activityIds?: string[];
  decisionId?: string;
  projectId?: string;
  startDate?: string;
  endDate?: string;
}

export function ExportModal({
  open,
  onOpenChange,
  activityIds,
  decisionId,
  projectId,
  startDate,
  endDate,
}: ExportModalProps) {
  const [format, setFormat] = useState<'pdf' | 'csv'>('pdf');
  const [includeHistory, setIncludeHistory] = useState(true);
  const [includeImages, setIncludeImages] = useState(false);

  const exportActivities = useExportActivities();

  const handleExport = () => {
    const options: ExportOptions = {
      format,
      includeHistory,
      includeImages,
    };

    if (activityIds && activityIds.length > 0) {
      options.activityIds = activityIds;
    }
    if (decisionId) {
      options.decisionId = decisionId;
    }
    if (projectId) {
      options.projectId = projectId;
    }
    if (startDate) {
      options.startDate = startDate;
    }
    if (endDate) {
      options.endDate = endDate;
    }

    exportActivities.mutate(options, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#1A1A1A]">
            Export Audit Trail
          </DialogTitle>
          <DialogDescription className="text-[#7A7A7A]">
            Choose export format and options for your activity history
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-[#1A1A1A]">Export Format</Label>
            <RadioGroup value={format} onValueChange={(value) => setFormat(value as 'pdf' | 'csv')}>
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
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeHistory"
                  checked={includeHistory}
                  onCheckedChange={(checked) => setIncludeHistory(checked === true)}
                />
                <Label
                  htmlFor="includeHistory"
                  className="text-sm font-normal text-[#7A7A7A] cursor-pointer"
                >
                  Include full activity history
                </Label>
              </div>
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
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-full"
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={exportActivities.isPending}
            className="rounded-full bg-[#9D79F9] hover:bg-[#8B6AE8] text-white"
          >
            {exportActivities.isPending ? 'Exporting...' : 'Export'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
