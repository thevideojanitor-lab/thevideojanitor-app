import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface WaitlistFormProps {
  type?: "creator" | "editor" | "agency";
}

const WaitlistForm = ({ type = "creator" }: WaitlistFormProps) => {
  const [loading, setLoading] = useState(false);
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

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Success! 🎉",
        description: "You've been added to the waitlist. We'll be in touch soon!",
      });
      setFormData({ name: "", email: "", company: "", message: "" });
      setLoading(false);
    }, 1500);

    // Replace with actual API call:
    // try {
    //   await fetch('/api/waitlist', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ ...formData, type }),
    //   });
    // } catch (error) {
    //   toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    // }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <div>
        <Input
          type="text"
          placeholder="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="bg-card border-border"
        />
      </div>
      <div>
        <Input
          type="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="bg-card border-border"
        />
      </div>
      {type === "agency" && (
        <div>
          <Input
            type="text"
            placeholder="Company Name"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="bg-card border-border"
          />
        </div>
      )}
      <div>
        <Textarea
          placeholder={
            type === "editor"
              ? "Tell us about your editing experience..."
              : "What type of content do you create?"
          }
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="bg-card border-border min-h-[100px]"
        />
      </div>
      <Button type="submit" variant="hero" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          "Join Waitlist"
        )}
      </Button>
      <p className="text-xs text-center text-muted-foreground">
        We'll never share your information. Unsubscribe anytime.
      </p>
    </form>
  );
};

export default WaitlistForm;