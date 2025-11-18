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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import type { Option } from '@/api/decisions';

interface FinalChoicePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: Option[];
  onSelect: (optionId: string) => void;
}

export function FinalChoicePickerDialog({
  open,
  onOpenChange,
  options,
  onSelect,
}: FinalChoicePickerDialogProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');

  const handleConfirm = () => {
    if (selectedOptionId) {
      onSelect(selectedOptionId);
      setSelectedOptionId('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark Decision as Decided</DialogTitle>
          <DialogDescription>
            Select the final option that was chosen for this decision
          </DialogDescription>
        </DialogHeader>
        <RadioGroup value={selectedOptionId} onValueChange={setSelectedOptionId}>
          {options.map((option) => (
            <div key={option.id} className="flex items-center space-x-2 p-4 border rounded-lg">
              <RadioGroupItem value={option.id} id={option.id} />
              <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                <div className="font-medium">{option.title}</div>
                {option.cost_delta_numeric !== null && (
                  <div className="text-sm text-muted-foreground">
                    Cost: {option.cost_delta_numeric >= 0 ? '+' : ''}
                    ${option.cost_delta_numeric.toLocaleString()}
                  </div>
                )}
              </Label>
            </div>
          ))}
        </RadioGroup>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedOptionId}>
            Confirm Choice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
