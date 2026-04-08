import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Content Creator",
    company: "200K+ followers",
    quote: "I used to spend 10 hours a week editing. Now I upload raw clips and get back fire reels in two days. Game changer.",
    avatar: "SC",
  },
  {
    name: "Alex Torres",
    role: "YouTuber & Podcaster",
    company: "85K subscribers",
    quote: "The editors actually understand trends and platform formats. My Reels engagement went up 40% in the first month.",
    avatar: "AT",
  },
  {
    name: "Priya Patel",
    role: "E-commerce Creator",
    company: "NovaBrand",
    quote: "Our UGC ads convert 3x better since switching. And I never have to open Premiere Pro again. Worth every penny.",
    avatar: "PP",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 md:py-32 bg-card/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium uppercase tracking-widest text-primary mb-3">Testimonials</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold">Creators love the results.</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map(({ name, role, company, quote, avatar }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-2xl bg-card border border-border"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-text-secondary leading-relaxed mb-6">"{quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                  {avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold">{name}</p>
                  <p className="text-xs text-muted-foreground">{role} · {company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
