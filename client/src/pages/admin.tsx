import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { motion } from "framer-motion";

export default function Admin() {
  const { isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleLogin = () => {
    if (!email || !password) {
      toast({
        title: "Fehler",
        description: "Bitte alle Felder ausfüllen",
        variant: "destructive",
      });
      return;
    }

    // Redirect to Replit OAuth
    window.location.href = "/api/login";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Laden...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Admin Dashboard</CardTitle>
                <p className="text-muted-foreground mt-2">
                  Melde dich an, um die Analytics zu sehen
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    E-Mail:
                  </Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-testid="input-admin-email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="admin-password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Passwort:
                  </Label>
                  <Input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    data-testid="input-admin-password"
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleLogin}
                className="w-full gradient-bg hover:opacity-90"
                data-testid="button-admin-login"
              >
                Anmelden
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return <AdminDashboard />;
}
