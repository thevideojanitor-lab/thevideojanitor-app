// src/pages/EditorsPage.tsx
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Star, Award, Crown, Clock, CheckCircle2,
  Zap, ArrowRight, Shield, TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

// Tier badge config
const tierConfig = {
  Verified: {
    icon: Award,
    color: "text-muted-foreground",
    bg: "bg-muted/50",
    border: "border-border",
    badge: "bg-secondary text-secondary-foreground",
  },
  Priority: {
    icon: Star,
    color: "text-primary",
    bg: "bg-primary/5",
    border: "border-primary/30",
    badge: "bg-primary/10 text-primary border border-primary/20",
  },
  Premier: {
    icon: Crown,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/50",
    badge: "bg-primary text-primary-foreground",
  },
};

const editors = [
  {
    name: "Alex Kim",
    initials: "AK",
    tier: "Premier" as const,
    specialties: ["Talking Head", "Podcast Clips", "YouTube Shorts"],
    software: ["Premiere Pro", "After Effects"],
    timezone: "EST (UTC-5)",
    rating: 4.9,
    completedJobs: 340,
    turnaroundAvg: "36h",
    revisionRate: "1.2%",
    bio: "Short-form specialist with 5+ years in content editing. Known for sharp pacing, clean captions, and strong hook delivery.",
  },
  {
    name: "Maria Santos",
    initials: "MS",
    tier: "Premier" as const,
    specialties: ["UGC Ads", "Product Promos", "Motion Graphics"],
    software: ["DaVinci Resolve", "After Effects"],
    timezone: "CET (UTC+1)",
    rating: 4.8,
    completedJobs: 278,
    turnaroundAvg: "40h",
    revisionRate: "1.8%",
    bio: "Brand-focused editor with deep experience in e-commerce and performance ad creative. Specializes in conversion-driven content.",
  },
  {
    name: "Jordan Davis",
    initials: "JD",
    tier: "Priority" as const,
    specialties: ["Reels", "TikTok", "Brand Content"],
    software: ["Premiere Pro"],
    timezone: "PST (UTC-8)",
    rating: 4.7,
    completedJobs: 112,
    turnaroundAvg: "42h",
    revisionRate: "2.9%",
    bio: "Creator-first editor who understands platform trends. Fast, communicative, and delivers scroll-stopping short-form content.",
  },
  {
    name: "Priya Nair",
    initials: "PN",
    tier: "Priority" as const,
    specialties: ["Agency Content", "Multi-brand", "Captions"],
    software: ["Premiere Pro", "DaVinci Resolve"],
    timezone: "IST (UTC+5:30)",
    rating: 4.6,
    completedJobs: 87,
    turnaroundAvg: "44h",
    revisionRate: "3.1%",
    bio: "Experienced with high-volume agency workflows. Reliable, detail-oriented, and consistently on-brief.",
  },
  {
    name: "Carlos Mendez",
    initials: "CM",
    tier: "Verified" as const,
    specialties: ["YouTube Shorts", "Talking Head", "B-roll"],
    software: ["Premiere Pro"],
    timezone: "CST (UTC-6)",
    rating: 4.5,
    completedJobs: 34,
    turnaroundAvg: "46h",
    revisionRate: "4.2%",
    bio: "Newer to the network but consistently strong on briefs. Brings energy and attention to detail to every request.",
  },
  {
    name: "Sophie Chen",
    initials: "SC",
    tier: "Verified" as const,
    specialties: ["TikTok", "Lifestyle", "Sound Design"],
    software: ["DaVinci Resolve"],
    timezone: "AEST (UTC+10)",
    rating: 4.5,
    completedJobs: 28,
    turnaroundAvg: "47h",
    revisionRate: "3.8%",
    bio: "Lifestyle and creator content specialist. Excellent sound design instincts and strong grasp of trending formats.",
  },
];

const trustStats = [
  { icon: Shield, label: "All editors vetted", desc: "Portfolio review, test edit, and background check" },
  { icon: CheckCircle2, label: "Quality monitored", desc: "Admin oversight on every job, not just complaints" },
  { icon: Clock, label: "48h SLA enforced", desc: "Missed deadlines trigger automatic review" },
  { icon: TrendingUp, label: "Tier-based progression", desc: "Editors earn their level through performance" },
];

const EditorsPage = () => {
  return (
    <>
      <SEO
        title="Meet the Editors - TheVideoJanitors"
        description="Meet the vetted video editors behind TheVideoJanitors. Verified, Priority, and Premier tier editors specializing in short-form content for creators, agencies, and brands."
        keywords="vetted video editors, short-form video editors, professional video editors, trusted editors"
        canonical="https://thevideojanitors.com/editors"
      />
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />

        {/* Hero */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
          <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-medium uppercase tracking-widest text-primary mb-4"
            >
              Our Editor Network
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6"
            >
              The editors behind{" "}
              <span className="text-gradient">the clean content.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10"
            >
              Every editor on our platform has been vetted, tested, and approved. No random picks.
              No freelancer roulette. Just skilled, accountable editors who show up and deliver.
            </motion.p>

            {/* Tier Legend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex flex-wrap justify-center gap-3"
            >
              {(["Verified", "Priority", "Premier"] as const).map((tier) => {
                const cfg = tierConfig[tier];
                return (
                  <div
                    key={tier}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${cfg.badge}`}
                  >
                    <cfg.icon className="w-3.5 h-3.5" />
                    {tier}
                  </div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Trust Stats */}
        <section className="py-12 border-y border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {trustStats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm font-semibold mb-1">{stat.label}</p>
                  <p className="text-xs text-muted-foreground">{stat.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Editor Cards */}
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">
                Featured Editors
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                Skilled, vetted, and ready.
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Editors are matched to your request — you don't browse and pick. This page is for transparency and trust.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {editors.map((editor, i) => {
                const cfg = tierConfig[editor.tier];
                const TierIcon = cfg.icon;

                return (
                  <motion.div
                    key={editor.name}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`p-6 rounded-2xl bg-card border transition-colors ${cfg.border} ${
                      editor.tier === "Premier" ? "card-shadow" : ""
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${cfg.bg} ${cfg.color}`}
                        >
                          {editor.initials}
                        </div>
                        <div>
                          <h3 className="font-heading font-semibold">{editor.name}</h3>
                          <p className="text-xs text-muted-foreground">{editor.timezone}</p>
                        </div>
                      </div>
                      <div
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${cfg.badge}`}
                      >
                        <TierIcon className="w-3 h-3" />
                        {editor.tier}
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-muted-foreground leading-relaxed mb-5">
                      {editor.bio}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-5">
                      {[
                        { label: "Rating", value: `${editor.rating}★` },
                        { label: "Jobs", value: `${editor.completedJobs}+` },
                        { label: "Avg. TAT", value: editor.turnaroundAvg },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="bg-muted/50 rounded-xl p-3 text-center"
                        >
                          <p className="text-sm font-bold text-primary">{stat.value}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Specialties */}
                    <div className="mb-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                        Specialties
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {editor.specialties.map((s) => (
                          <span
                            key={s}
                            className="text-[11px] bg-card border border-border px-2.5 py-1 rounded-full"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Software */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                        Software
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {editor.software.map((sw) => (
                          <span
                            key={sw}
                            className="text-[11px] bg-primary/5 border border-primary/20 text-primary px-2.5 py-1 rounded-full"
                          >
                            {sw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Disclaimer */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center text-xs text-muted-foreground mt-12 max-w-lg mx-auto"
            >
              Editors are matched to your requests by our team based on style, niche, timezone, and
              availability. Clients cannot directly select or hire individual editors at this time.
            </motion.p>
          </div>
        </section>

        {/* Vetting Process */}
        <section className="py-24 md:py-32 bg-card/50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">
                Our Vetting Process
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold">
                How we approve every editor.
              </h2>
            </motion.div>

            <div className="max-w-3xl mx-auto">
              {[
                {
                  step: "01",
                  title: "Portfolio Review",
                  desc: "We review submitted portfolios for technical quality, short-form expertise, and platform fluency.",
                },
                {
                  step: "02",
                  title: "Skills Assessment",
                  desc: "Applicants complete a checklist covering software proficiency, turnaround capability, and specialties.",
                },
                {
                  step: "03",
                  title: "Paid Test Edit",
                  desc: "Every approved applicant completes a paid test edit using a real brief. We assess quality, adherence, and communication.",
                },
                {
                  step: "04",
                  title: "Onboarding & Agreement",
                  desc: "Accepted editors complete onboarding, agree to our editor terms, and are briefed on quality standards and SLAs.",
                },
                {
                  step: "05",
                  title: "Ongoing Monitoring",
                  desc: "Performance is tracked continuously. Ratings, revision rates, and on-time delivery determine tier progression — and continued platform access.",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex gap-6 pb-8 last:pb-0"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary">{item.step}</span>
                    </div>
                    {i < 4 && (
                      <div className="w-px flex-1 bg-border mt-2" />
                    )}
                  </div>
                  <div className="pb-2">
                    <h3 className="font-heading font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Dual CTA */}
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* For Clients */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl bg-card border border-border text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <Zap className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-3">
                  Want vetted editors working on your content?
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Subscribe to a plan and get matched with the right editor for your content and style.
                </p>
                <Link to="/pricing">
                  <Button variant="hero" className="w-full">
                    View Plans <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </motion.div>

              {/* For Editors */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl bg-card border border-border text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <Crown className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-3">
                  Are you an editor? Join our network.
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Consistent jobs, fair pay, weekly payouts. No bidding wars, no chasing clients.
                </p>
                <Link to="/for-editors">
                  <Button variant="hero-outline" className="w-full">
                    Apply Now <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default EditorsPage;