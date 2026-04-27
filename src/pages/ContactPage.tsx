// src/pages/ContactPage.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail, Clock, MessageSquare, FileQuestion,
  CreditCard, ArrowRight, Loader2, CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { ContactFormspree } from "@/components/ContactFormspree";

const helpTopics = [
  {
    icon: CreditCard,
    title: "Billing & Credits",
    description: "Questions about your plan, credits, or payments.",
    link: "/faq#billing",
    linkLabel: "See billing FAQ",
  },
  {
    icon: FileQuestion,
    title: "How It Works",
    description: "Not sure about the process? We'll walk you through it.",
    link: "/how-it-works",
    linkLabel: "Read the guide",
  },
  {
    icon: MessageSquare,
    title: "Request Support",
    description: "Issue with an active request, revision, or swap.",
    link: "/faq",
    linkLabel: "Check the FAQ",
  },
  {
    icon: ArrowRight,
    title: "Editor Applications",
    description: "Want to join as an editor? Start your application.",
    link: "/for-editors",
    linkLabel: "Apply now",
  },
];

type InquiryType = "general" | "billing" | "request" | "editor" | "agency";

const ContactPage = () => {
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

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast({
        title: "Message sent!",
        description: "We'll get back to you within 24 hours.",
      });
    }, 1500);
  };

  return (
    <>
      <SEO
        title="Contact & Support - TheVideoJanitors"
        description="Get in touch with TheVideoJanitors. Support for billing, requests, editor applications, and general questions. Response within 24 hours."
        keywords="contact video janitors, video editing support, help video editing"
        canonical="https://thevideojanitors.com/contact"
      />
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />

        {/* Hero */}
        <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
          <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-medium uppercase tracking-widest text-primary mb-4"
            >
              Contact & Support
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6"
            >
              We're here to{" "}
              <span className="text-gradient">help.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-text-secondary"
            >
              Send us a message below. Our team responds within 24 hours — usually much faster.
            </motion.p>
          </div>
        </section>

        {/* Contact Info Strip */}
        <section className="py-8 border-y border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-center gap-8 md:gap-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <a
                    href="mailto:support@thevideojanitors.com"
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    support@thevideojanitors.com
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Response Time</p>
                  <p className="text-sm font-medium">Within 24 hours, 7 days a week</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Form */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading text-2xl font-bold mb-8">Send a message</h2>

                {submitted ? (
                  <div className="p-12 rounded-2xl bg-card border border-primary/30 text-center">
                    <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h3 className="font-heading text-xl font-semibold mb-3">Message received!</h3>
                    <p className="text-muted-foreground mb-6">
                      We'll get back to you at <strong>{formData.email}</strong> within 24 hours.
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
                  </div>
                ) : (
                  <ContactFormspree />
                )}
              </motion.div>

              {/* Help Topics */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading text-2xl font-bold mb-8">Help topics</h2>
                <div className="space-y-4">
                  {helpTopics.map((topic, i) => (
                    <motion.div
                      key={topic.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <topic.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-heading font-semibold mb-1">{topic.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{topic.description}</p>
                          <Link
                            to={topic.link}
                            className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
                          >
                            {topic.linkLabel}
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Response Promise */}
                <div className="mt-8 p-6 rounded-2xl bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <h3 className="font-heading font-semibold">Our response promise</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We respond to every message within <strong className="text-foreground">24 hours</strong>,
                    7 days a week. Urgent issues related to active requests are prioritized and typically
                    addressed within a few hours.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default ContactPage;