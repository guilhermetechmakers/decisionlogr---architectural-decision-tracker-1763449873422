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
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: () => void;
}

export function ExportDialog({ open, onOpenChange, onExport }: ExportDialogProps) {
  const [includeHistory, setIncludeHistory] = useState(true);
  const [includeImages, setIncludeImages] = useState(true);
  const [includeComments, setIncludeComments] = useState(true);

  const handleExport = () => {
    onExport();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Decision</DialogTitle>
          <DialogDescription>
            Configure what to include in the PDF export
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-history"
              checked={includeHistory}
              onCheckedChange={(checked) => setIncludeHistory(checked === true)}
            />
            <Label htmlFor="include-history" className="cursor-pointer">
              Include activity history
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-images"
              checked={includeImages}
              onCheckedChange={(checked) => setIncludeImages(checked === true)}
            />
            <Label htmlFor="include-images" className="cursor-pointer">
              Include images
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-comments"
              checked={includeComments}
              onCheckedChange={(checked) => setIncludeComments(checked === true)}
            />
            <Label htmlFor="include-comments" className="cursor-pointer">
              Include comments
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>Export PDF</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
