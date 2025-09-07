import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Check } from "lucide-react";
import { Question } from "@/types/quiz";

interface QuizCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: 'yes' | 'no') => void;
}

export default function QuizCard({ question, questionNumber, totalQuestions, onAnswer }: QuizCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    startPos.current = { x: clientX, y: clientY };
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    
    const deltaX = clientX - startPos.current.x;
    const deltaY = clientY - startPos.current.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    const threshold = 100;
    
    if (Math.abs(dragOffset.x) > threshold) {
      onAnswer(dragOffset.x > 0 ? 'yes' : 'no');
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      onAnswer('no');
    } else if (e.key === 'ArrowRight') {
      onAnswer('yes');
    }
  };

  const rotation = dragOffset.x * 0.1;
  const cardStyle = {
    transform: isDragging 
      ? `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`
      : 'translate(0px, 0px) rotate(0deg)',
    transition: isDragging ? 'none' : 'transform 0.2s ease',
  };

  return (
    <Card 
      ref={cardRef}
      className={`relative h-96 shadow-2xl cursor-grab ${isDragging ? 'cursor-grabbing' : ''} card-swipe`}
      style={cardStyle}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      data-testid={`quiz-card-${questionNumber}`}
    >
      <CardContent className="p-8 flex flex-col h-full">
        <div className="text-sm text-muted-foreground mb-6">
          <span data-testid="question-number">Frage {questionNumber}</span> von{" "}
          <span data-testid="total-questions">{totalQuestions}</span>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl text-center leading-relaxed text-foreground" data-testid="question-text">
            {question.text}
          </p>
        </div>
        
        <div className="flex justify-center gap-8 mt-6">
          <Button
            variant="destructive"
            size="lg"
            className="w-16 h-16 rounded-full p-0 hover:scale-110 transition-transform"
            onClick={() => onAnswer('no')}
            data-testid="button-no"
          >
            <X className="w-8 h-8" />
          </Button>
          <Button
            className="w-16 h-16 rounded-full p-0 bg-accent hover:bg-accent/90 hover:scale-110 transition-transform"
            onClick={() => onAnswer('yes')}
            data-testid="button-yes"
          >
            <Check className="w-8 h-8" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
