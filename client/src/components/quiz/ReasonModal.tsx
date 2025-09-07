import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Question } from "@/types/quiz";

interface ReasonModalProps {
  answer: 'yes' | 'no';
  question: Question;
  onSubmit: (reasons: string[]) => void;
  onClose: () => void;
}

export default function ReasonModal({ answer, question, onSubmit, onClose }: ReasonModalProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  
  const reasons = answer === 'yes' ? question.yesReasons : question.noReasons;
  const title = answer === 'yes' ? 'Warum Ja?' : 'Warum Nein?';

  const toggleReason = (reason: string) => {
    setSelectedReasons(prev => 
      prev.includes(reason) 
        ? prev.filter(r => r !== reason)
        : [...prev, reason]
    );
  };

  const handleSubmit = () => {
    onSubmit(selectedReasons);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      data-testid="reason-modal-overlay"
    >
      <Card 
        className="w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        data-testid="reason-modal-card"
      >
        <CardHeader>
          <CardTitle className="text-center" data-testid="reason-modal-title">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {reasons.map((reason, index) => (
              <Button
                key={index}
                variant="outline"
                className={`w-full p-3 text-left justify-start h-auto whitespace-normal ${
                  selectedReasons.includes(reason) 
                    ? 'bg-accent/10 border-accent text-accent-foreground' 
                    : 'hover:bg-accent/10 hover:border-accent'
                }`}
                onClick={() => toggleReason(reason)}
                data-testid={`reason-option-${index}`}
              >
                {reason}
              </Button>
            ))}
          </div>
          
          <Button 
            onClick={handleSubmit}
            className="w-full gradient-bg hover:opacity-90 font-bold"
            data-testid="button-continue"
          >
            Weiter
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
