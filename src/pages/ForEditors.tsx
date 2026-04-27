import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck, Calendar, Coins, TrendingUp, Clock, Award, Star,
  Crown, Check, Quote, Wifi, MessageSquare, Monitor, Scissors,
  ArrowRight,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import editorHeroBg from "@/assets/editor-hero-bg.jpg";
import SEO from "@/components/SEO";
import { EditorApplicationEmbed } from "@/components/EditorApplicationEmbed";

const trustSignals = [
  { icon: ShieldCheck, label: "No Bidding Wars" },
  { icon: Coins, label: "Weekly Payouts" },
  { icon: TrendingUp, label: "Merit-Based Growth" },
];

const benefits = [
  {
    icon: ShieldCheck,
    title: "No Bidding Wars",
    description: "Stop wasting time pitching. We assign jobs to the best fit based on skills, style, and availability.",
  },
  {
    icon: Calendar,
    title: "Steady Workflow",
    description: "Consistent volume from agencies and creators. No more feast-or-famine freelancing.",
  },
  {
    icon: Coins,
    title: "Fair Pay",
    description: "Transparent credit system. Cash out weekly via PayPal or Stripe. No hidden fees, no surprises.",
  },
  {
    icon: TrendingUp,
    title: "Growth Path",
    description: "Perform well, level up through tiers, unlock higher pay rates and priority assignments.",
  },
];

const steps = [
  { step: "01", title: "Apply", description: "Submit your portfolio and editing samples. We review within 48 hours." },
  { step: "02", title: "Test Edit", description: "Complete a short paid test edit so we can assess your style and quality." },
  { step: "03", title: "Get Assigned", description: "Once approved, get matched with jobs that fit your skills and availability." },
  { step: "04", title: "Earn & Level Up", description: "Deliver great work, earn credits, cash out weekly. Hit milestones to tier up." },
];

const tiers = [
  {
    name: "Verified",
    icon: Award,
    color: "text-muted-foreground",
    bgColor: "bg-muted-foreground/10",
    borderColor: "border-border",
    requirements: ["Pass test edit", "Complete onboarding", "Agree to editor terms"],
    benefits: ["Access to standard jobs", "48h turnaround assignments", "Community access", "Base rate per credit"],
  },
  {
    name: "Priority",
    icon: Star,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary",
    requirements: ["50+ completed edits", "4.5+ avg rating", "< 5% revision rate"],
    benefits: ["Priority job matching", "Rush turnaround jobs", "1.5x base rate", "Direct client requests"],
    highlighted: true,
  },
  {
    name: "Premier",
    icon: Crown,
    color: "text-primary",
    bgColor: "bg-primary/15",
    borderColor: "border-primary",
    requirements: ["200+ completed edits", "4.8+ avg rating", "< 2% revision rate", "Mentor contributions"],
    benefits: ["First pick on all jobs", "2x base rate", "Revenue share option", "Beta features access", "Editor advisory board"],
  },
];

const requirements = [
  { icon: Monitor, label: "Premiere Pro or DaVinci Resolve proficiency" },
  { icon: Scissors, label: "Short-form video editing expertise (Reels, TikTok, Shorts)" },
  { icon: Wifi, label: "Reliable high-speed internet connection" },
  { icon: MessageSquare, label: "Strong communication and responsiveness" },
  { icon: Clock, label: "Ability to meet 48-hour turnaround deadlines" },
];

const testimonials = [
  {
    quote: "I used to spend 40% of my time bidding on projects. Now I just get assigned work that matches my skills. My income is more stable than it's ever been.",
    name: "Alex Kim",
    role: "Verified Editor · 6 months",
    avatar: "AK",
  },
  {
    quote: "The tier system actually rewards good work. I hit Priority in 3 months and my rate jumped 50%. It feels fair and motivating.",
    name: "Jordan Davis",
    role: "Priority Editor · 1 year",
    avatar: "JD",
  },
  {
    quote: "Clear briefs, admin support when I need it, and weekly payouts that never miss. This is how freelancing should work.",
    name: "Maria Santos",
    role: "Premier Editor · 2 years",
    avatar: "MS",
  },
];

const faqs = [
  {
    q: "How do payouts work?",
    a: "Credits are converted to cash weekly. Payouts happen every Friday via PayPal or Stripe. Minimum payout threshold is $50.",
  },
  {
    q: "Can I choose which jobs I take?",
    a: "Jobs are assigned based on your skills, style preferences, and availability. Priority and Premier editors get first pick and can decline assignments.",
  },
  {
    q: "How does the tier system work?",
    a: "You start as Verified after passing the test edit. As you complete more edits with high ratings and low revision rates, you automatically progress to Priority and Premier tiers with higher pay rates.",
  },
  {
    q: "What are the technical requirements?",
    a: "You need proficiency in Premiere Pro or DaVinci Resolve, experience with short-form video editing, reliable internet, and the ability to meet 48-hour turnaround deadlines.",
  },
  {
    q: "What kind of support do editors get?",
    a: "Every job comes with a structured brief. You have access to monitored chat with clients, admin support for disputes, and a private editor community for tips and feedback.",
  },
];

const ForEditors = () => {
  return (
    <>
    <SEO 
    title="For Editors - Join Our Network"
        description="Join 100+ vetted editors. Get consistent work, fair pay, and weekly payouts. No bidding wars, no chasing clients."
        keywords="video editor jobs, freelance editing, remote video editing, video editing work"
      />
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0">
          <img src={editorHeroBg} alt="" className="w-full h-full object-cover opacity-20" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-sm font-medium uppercase tracking-widest text-primary mb-6">
            Trusted by 100+ editors
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6">
            Consistent short-form editing work.{" "}
            <span className="text-gradient">Fair pay. No bidding wars.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            Join a vetted network of editors. Get assigned jobs based on your skills and availability. Earn credits, cash out reliably. Level up to earn more.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button variant="hero" size="lg" className="text-base px-8 py-6">
              Apply to be an Editor <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
            <Button variant="hero-outline" size="lg" className="text-base px-8 py-6" onClick={() => document.getElementById("requirements")?.scrollIntoView({ behavior: "smooth" })}>
              View Requirements
            </Button>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="flex flex-wrap justify-center gap-8 md:gap-12">
            {trustSignals.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-text-secondary">{label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Join */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">Why Join</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Built for editors who value their craft.</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {benefits.map((b, i) => (
              <motion.div key={b.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <b.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-semibold mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 md:py-32 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">How It Works</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">From application to earning in 4 steps.</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {steps.map((s, i) => (
              <motion.div key={s.step} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="text-5xl font-heading font-bold text-primary/20 mb-4">{s.step}</div>
                <h3 className="font-heading text-xl font-semibold mb-3">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Editor Tiers */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">Editor Tiers</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Grow your career. Unlock higher pay.</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Every edit you deliver builds your reputation. Hit milestones to level up automatically.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {tiers.map((tier, i) => (
              <motion.div key={tier.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className={`relative p-8 rounded-2xl border transition-colors ${tier.highlighted ? "bg-card border-primary card-shadow" : "bg-card border-border hover:border-primary/30"}`}>
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">Most Common</div>
                )}
                <div className={`w-14 h-14 rounded-xl ${tier.bgColor} flex items-center justify-center mb-5`}>
                  <tier.icon className={`w-7 h-7 ${tier.color}`} />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-6">{tier.name}</h3>

                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Requirements</p>
                <ul className="space-y-2 mb-6">
                  {tier.requirements.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="text-text-secondary">{r}</span>
                    </li>
                  ))}
                </ul>

                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Benefits</p>
                <ul className="space-y-2">
                  {tier.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-text-secondary">{b}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section id="requirements" className="py-24 md:py-32 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">Requirements</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">What we look for.</h2>
          </motion.div>
          <div className="max-w-2xl mx-auto space-y-4">
            {requirements.map((req, i) => (
              <motion.div key={req.label} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="flex items-center gap-4 p-5 rounded-xl bg-card border border-border">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <req.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium">{req.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">From Our Editors</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Hear from editors in the network</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-8 rounded-2xl bg-card border border-border">
                <Quote className="w-8 h-8 text-primary/30 mb-4" />
                <p className="text-sm text-text-secondary leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">{t.avatar}</div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 md:py-32 bg-card/50">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">FAQ</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Common questions</h2>
          </motion.div>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-primary/30">
                <AccordionTrigger className="text-sm font-medium hover:no-underline py-5">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto">
            <h2 className="font-heading text-3xl md:text-5xl font-bold mb-6">
              Ready to turn your skills into{" "}
              <span className="text-gradient">steady income?</span>
            </h2>
            <p className="text-lg text-text-secondary mb-10 max-w-xl mx-auto">
              Join 100+ editors earning reliable income doing what they love. No bidding. No chasing clients. Just great work and fair pay.
            </p>
            <EditorApplicationEmbed 
  buttonVariant="hero" 
  buttonSize="lg" 
  buttonText="Apply to be an Editor"
  className="text-base px-8 py-6"
/>
            <p className="text-xs text-muted-foreground mt-6">Weekly payouts via PayPal/Stripe · No upfront fees · Cancel anytime</p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
    </>
  );
};

export default ForEditors;
