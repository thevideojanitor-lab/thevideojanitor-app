// src/components/Footer.tsx
import { Link } from "react-router-dom";
import { Mail, Twitter, Linkedin, Instagram, Youtube } from "lucide-react";
import logoWebp from "@/assets/logo.webp";
import logoPng from "@/assets/logo.png";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="inline-block mb-3" aria-label="TheVideoJanitors — home">
              <picture>
                <source srcSet={logoWebp} type="image/webp" />
                <img src={logoPng} alt="TheVideoJanitors" className="h-16 w-auto" />
              </picture>
            </Link>
            <p className="font-heading text-sm font-semibold text-foreground mb-3">
              Clean edits. Fast delivery. No freelancer roulette.
            </p>
            <p className="text-sm text-muted-foreground mb-5 max-w-xs leading-relaxed">
              Managed short-form video editing without the freelancer mess.
              Upload footage. We clean up the rest.
            </p>
            <div className="flex gap-3">
              {[
                {
                  icon: Twitter,
                  href: "https://twitter.com/thevideojanitors",
                  label: "Twitter",
                },
                { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
                {
                  icon: Instagram,
                  href: "https://instagram.com",
                  label: "Instagram",
                },
                { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors group"
                >
                  <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4">
              Product
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link to="/how-it-works" className="hover:text-primary transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/showcase" className="hover:text-primary transition-colors">
                  Showcase
                </Link>
              </li>
              <li>
                <Link to="/editors" className="hover:text-primary transition-colors">
                  Our Editors
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4">
              Solutions
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link to="/for-creators" className="hover:text-primary transition-colors">
                  For Creators
                </Link>
              </li>
              <li>
                <Link to="/for-agencies" className="hover:text-primary transition-colors">
                  For Agencies
                </Link>
              </li>
              <li>
                <Link to="/for-brands" className="hover:text-primary transition-colors">
                  For Brands
                </Link>
              </li>
              <li>
                <Link to="/for-editors" className="hover:text-primary transition-colors">
                  For Editors
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link to="/about" className="hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors">
                  Contact & Support
                </Link>
              </li>
              <li>
                <Link to="/editors" className="hover:text-primary transition-colors">
                  Meet the Editors
                </Link>
              </li>
              <li>
                <a
                  href="mailto:hello@thevideojanitor.com"
                  className="hover:text-primary transition-colors inline-flex items-center gap-1.5"
                >
                  <Mail className="w-3 h-3" />
                  hello@thevideojanitor.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © {year} TheVideoJanitors. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-6 text-xs text-muted-foreground">
              <Link
                to="/legal/terms"
                className="hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/legal/privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/legal/refunds"
                className="hover:text-foreground transition-colors"
              >
                Refund Policy
              </Link>
              <Link
                to="/legal/shipping"
                className="hover:text-foreground transition-colors"
              >
                Delivery
              </Link>
              <Link
                to="/legal/cookies"
                className="hover:text-foreground transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;