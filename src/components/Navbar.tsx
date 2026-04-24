// src/components/Navbar.tsx
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Menu, X, ChevronDown, Video, Building2,
  Users, Briefcase, Info, HelpCircle,
} from "lucide-react";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSolutionsOpen(false);
  }, [location]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSolutionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const solutions = [
    { label: "For Creators", path: "/for-creators", icon: Video, desc: "Post more. Edit less." },
    { label: "For Agencies", path: "/for-agencies", icon: Building2, desc: "Scale without hiring." },
    { label: "For Brands", path: "/for-brands", icon: Briefcase, desc: "Content that converts." },
    { label: "For Editors", path: "/for-editors", icon: Users, desc: "Get consistent work." },
  ];

  const navLinks = [
    { label: "How It Works", path: "/how-it-works" },
    { label: "Pricing", path: "/pricing" },
    { label: "Showcase", path: "/showcase" },
    { label: "Our Editors", path: "/editors" },
    { label: "About", path: "/about" },
    { label: "FAQ", path: "/faq" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-lg border-b border-border shadow-lg"
          : "bg-background/80 backdrop-blur-md border-b border-border/50"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link to="/" className="font-heading text-xl font-bold tracking-tight shrink-0">
          The<span className="text-primary">Video</span>Janitors
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {/* Solutions Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setSolutionsOpen(!solutionsOpen)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-muted"
            >
              Solutions
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  solutionsOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {solutionsOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-xl p-2 z-50">
                {solutions.map(({ label, path, icon: Icon, desc }) => (
                  <Link
                    key={path}
                    to={path}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {navLinks.map(({ label, path }) => (
            <Link
              key={path}
              to={path}
              className={`text-sm px-3 py-2 rounded-lg transition-colors ${
                isActive(path)
                  ? "text-primary font-medium bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <Link to="/for-editors">
            <Button variant="ghost" size="sm">
              Apply as Editor
            </Button>
          </Link>
          <Link to="/pricing">
            <Button variant="hero" size="sm">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-background border-b border-border px-4 pb-6 space-y-1 max-h-[85vh] overflow-y-auto">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground pt-4 pb-2 px-3">
            Solutions
          </p>
          {solutions.map(({ label, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
            >
              <Icon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{label}</span>
            </Link>
          ))}

          <div className="border-t border-border my-3" />

          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground px-3 pb-2">
            Platform
          </p>
          {navLinks.map(({ label, path }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg transition-colors ${
                isActive(path)
                  ? "text-primary font-medium bg-primary/10"
                  : "hover:bg-muted"
              }`}
            >
              {label === "About" && <Info className="w-4 h-4 text-muted-foreground" />}
              {label === "FAQ" && <HelpCircle className="w-4 h-4 text-muted-foreground" />}
              {label}
            </Link>
          ))}

          <div className="border-t border-border mt-3 pt-3 flex flex-col gap-2">
            <Link to="/for-editors">
              <Button variant="ghost" size="sm" className="w-full">
                Apply as Editor
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="hero" size="sm" className="w-full">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;