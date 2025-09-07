import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OnboardingFormProps {
  onStart: (age: number, gender: string) => void;
}

export default function OnboardingForm({ onStart }: OnboardingFormProps) {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!age || !gender) {
      alert('Bitte fülle alle Felder aus!');
      return;
    }

    const ageNum = parseInt(age, 10);
    if (ageNum < 16 || ageNum > 100) {
      alert('Bitte gib ein gültiges Alter zwischen 16 und 100 ein!');
      return;
    }

    onStart(ageNum, gender);
  };

  return (
    <Card className="shadow-2xl">
      <CardHeader className="text-center space-y-4">
        <CardTitle className="text-3xl font-bold">
          🌱 Nachhaltigkeits‑Check
        </CardTitle>
        <p className="text-muted-foreground">
          Entdecke deine nachhaltigen Gewohnheiten
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="gender">Geschlecht:</Label>
            <Select value={gender} onValueChange={setGender} required>
              <SelectTrigger data-testid="select-gender">
                <SelectValue placeholder="Bitte wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="männlich">Männlich</SelectItem>
                <SelectItem value="weiblich">Weiblich</SelectItem>
                <SelectItem value="divers">Divers</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="age">Alter:</Label>
            <Input
              id="age"
              type="number"
              min="16"
              max="100"
              placeholder="z.B. 25"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
              data-testid="input-age"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full gradient-bg hover:opacity-90 font-bold"
            data-testid="button-start-quiz"
          >
            Quiz starten
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
