import React, { useState } from 'react';
import { MessageCircle, X, Send, Bug, Lightbulb, AlertTriangle, MessageSquare, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface FeedbackData {
  type: 'bug' | 'feature' | 'improvement' | 'general' | 'error' | 'kritik' | 'verbesserung';
  message: string;
  userName: string;
}

const feedbackTypes = [
  { value: 'verbesserung', label: 'Verbesserung', icon: Star, color: 'text-blue-600' },
  { value: 'kritik', label: 'Kritik', icon: AlertTriangle, color: 'text-orange-600' },
  { value: 'bug', label: 'Bug melden', icon: Bug, color: 'text-red-600' },
  { value: 'feature', label: 'Feature-Wunsch', icon: Lightbulb, color: 'text-yellow-600' },
  { value: 'error', label: 'Fehler', icon: AlertTriangle, color: 'text-red-500' },
  { value: 'general', label: 'Allgemein', icon: MessageSquare, color: 'text-gray-600' }
];

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FeedbackData>({
    type: 'general',
    message: '',
    userName: ''
  });
  const { toast } = useToast();
  const [location] = useLocation();

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      // Reset form state on unmount
      setIsOpen(false);
      setIsSubmitting(false);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userName.trim() || !formData.message.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie Name und Nachricht aus.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get browser info
      const browserInfo = {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        platform: navigator.platform
      };

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: formData.message,
          userName: formData.userName,
          title: feedbackTypes.find(t => t.value === formData.type)?.label || 'Anmerkung',
          type: formData.type,
          page: location,
          browserInfo
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Erfolgreich übermittelt! ✅",
          description: result.message,
          variant: "default"
        });
        
        // Reset form
        setFormData({
          type: 'general',
          message: '',
          userName: ''
        });
        setIsOpen(false);
      } else {
        throw new Error(result.error || 'Submission failed');
      }
    } catch (error: any) {
      console.error('Feedback submission error:', error);
      toast({
        title: "Fehler beim Senden",
        description: "Bitte versuchen Sie es später erneut.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedType = feedbackTypes.find(type => type.value === formData.type);

  return (
    <>
      {/* Floating Feedback Button */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-blue-600 hover:bg-blue-700 z-50"
            size="icon"
            data-testid="button-feedback-open"
          >
            <MessageCircle className="h-6 w-6 text-white" />
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-lg" data-testid="modal-feedback">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              Feedback & Anmerkungen
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Feedback Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Art des Feedbacks*</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger data-testid="select-feedback-type">
                  <SelectValue>
                    {selectedType && (
                      <div className="flex items-center gap-2">
                        <selectedType.icon className={`h-4 w-4 ${selectedType.color}`} />
                        {selectedType.label}
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {feedbackTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className={`h-4 w-4 ${type.color}`} />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="userName">Name*</Label>
              <Input
                id="userName"
                value={formData.userName}
                onChange={(e) => setFormData(prev => ({ ...prev, userName: e.target.value }))}
                placeholder="Ihr Name"
                required
                data-testid="input-feedback-name"
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Nachricht*</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Detaillierte Beschreibung Ihres Feedbacks..."
                rows={4}
                required
                data-testid="textarea-feedback-message"
              />
            </div>

            {/* Page Info */}
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              📄 Aktuelle Seite: {location}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                data-testid="button-feedback-cancel"
              >
                <X className="h-4 w-4 mr-2" />
                Abbrechen
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                data-testid="button-feedback-submit"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Wird gesendet...' : 'Senden'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}