// src/components/ContactFormspree.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, ArrowRight, Send } from "lucide-react";

// Replace with your Formspree contact form ID
const FORMSPREE_CONTACT_ID = "xeevwnvz";

type InquiryType = "general" | "billing" | "request" | "editor" | "agency";

export const ContactFormspree = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    inquiryType: "general" as InquiryType,
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`https://formspree.io/f/${FORMSPREE_CONTACT_ID}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          submittedAt: new Date().toISOString(),
          pageUrl: window.location.href,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        toast({
          title: "Message sent!",
          description: "We'll get back to you within 24 hours.",
        });
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to send");
      }
    } catch (err) {
      toast({
        title: "Failed to send",
        description: "Please email us directly at thevideojanitors@gmail.com",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-12 rounded-2xl bg-card border border-primary/30 text-center"
      >
        <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
        <h3 className="font-heading text-xl font-semibold mb-3">Message received!</h3>
        <p className="text-muted-foreground mb-6">
          We'll get back to you at <strong className="text-foreground">{formData.email}</strong> within 24 hours.
        </p>
        <Button
          variant="hero-outline"
          onClick={() => {
            setSubmitted(false);
            setFormData({
              name: "",
              email: "",
              inquiryType: "general",
              subject: "",
              message: "",
            });
          }}
        >
          Send another message
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            Full Name *
          </label>
          <Input
            placeholder="Your name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="bg-card border-border h-12"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            Email Address *
          </label>
          <Input
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="bg-card border-border h-12"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">
          Inquiry Type *
        </label>
        <select
          value={formData.inquiryType}
          onChange={(e) =>
            setFormData({ ...formData, inquiryType: e.target.value as InquiryType })
          }
          required
          className="w-full h-12 px-4 bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-primary/50 transition-colors appearance-none"
        >
          <option value="general">General Question</option>
          <option value="billing">Billing & Credits</option>
          <option value="request">Active Request Issue</option>
          <option value="editor">Editor Application</option>
          <option value="agency">Agency / Enterprise Inquiry</option>
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">
          Subject *
        </label>
        <Input
          placeholder="What's this about?"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          required
          className="bg-card border-border h-12"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">
          Message *
        </label>
        <Textarea
          placeholder="Tell us what you need help with. The more detail you include, the faster we can help."
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          required
          className="bg-card border-border min-h-[160px] resize-none"
        />
      </div>

      <Button type="submit" variant="hero" className="w-full h-12" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            Send Message <Send className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
      <p className="text-xs text-center text-muted-foreground">
        We respond within 24 hours, 7 days a week.
      </p>
    </form>
  );
};

export default ContactFormspree;