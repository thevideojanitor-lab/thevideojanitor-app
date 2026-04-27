// src/components/WaitlistForm.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, Send } from "lucide-react";

interface WaitlistFormProps {
  type?: "creator" | "editor" | "agency";
  variant?: "inline" | "card";
}

// Replace these with your actual Formspree form IDs
const FORMSPREE_IDS = {
  creator: "mpqkeboo", // e.g., "xrbpqeyz"
  editor: "mvzdnlvl",
  agency: "xlgakzaj",
};

export const WaitlistForm = ({ type = "creator", variant = "card" }: WaitlistFormProps) => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`https://formspree.io/f/${FORMSPREE_IDS[type]}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          type,
          submittedAt: new Date().toISOString(),
          source: window.location.pathname,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        toast({
          title: "You're on the list!",
          description: "We'll reach out when spots open up.",
        });
      } else {
        const data = await response.json();
        throw new Error(data.error || "Submission failed");
      }
    } catch (err) {
      toast({
        title: "Submission failed",
        description: "Please try again or email thevideojanitors@gmail.com",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 text-center bg-primary/5 rounded-2xl border border-primary/20"
      >
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Check className="w-6 h-6 text-primary" />
        </div>
        <h3 className="font-heading font-semibold mb-2">Thanks for signing up!</h3>
        <p className="text-sm text-muted-foreground">
          We've added you to the {type} waitlist. You'll hear from us soon.
        </p>
      </motion.div>
    );
  }

  if (variant === "inline") {
    return (
      <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
        <Input
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="bg-background border-border h-12"
        />
        <Button type="submit" variant="hero" className="h-12 px-6" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join"}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-md mx-auto">
      <div>
        <Input
          type="text"
          placeholder="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="bg-card border-border h-12"
        />
      </div>
      <div>
        <Input
          type="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="bg-card border-border h-12"
        />
      </div>
      {type === "agency" && (
        <div>
          <Input
            type="text"
            placeholder="Company Name"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="bg-card border-border h-12"
          />
        </div>
      )}
      <div>
        <Textarea
          placeholder={
            type === "editor"
              ? "Tell us about your editing experience (software, years, niches)..."
              : "What type of content do you create? How many videos per month?"
          }
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="bg-card border-border min-h-[120px] resize-none"
        />
      </div>
      <Button type="submit" variant="hero" className="w-full h-12" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            Join Waitlist <Send className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
      <p className="text-xs text-center text-muted-foreground">
        No spam. Unsubscribe anytime.
      </p>
    </form>
  );
};

export default WaitlistForm;