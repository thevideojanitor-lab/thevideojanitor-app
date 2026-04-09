import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Users, Video, Building2 } from "lucide-react";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const isHomePage = location.pathname === "/";
  const isEditorsPage = location.pathname === "/for-editors";
  const isAgenciesPage = location.pathname === "/for-agencies";

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
    setMobileOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-lg border-b border-border shadow-lg"
          : "bg-background/80 backdrop-blur-md border-b border-border/50"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link
          to="/"
          className="font-heading text-xl font-bold tracking-tight text-foreground hover:opacity-80 transition-opacity"
        >
          The<span className="text-primary">Video</span>Janitors
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6">
          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            {isHomePage ? (
              <>
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  How It Works
                </button>
                <button
                  onClick={() => scrollToSection("pricing")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pricing
                </button>
                <button
                  onClick={() => scrollToSection("showcase")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Showcase
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className={`text-sm transition-colors ${
                    isHomePage
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Home
                </Link>
              </>
            )}
          </div>

          {/* Separator */}
          <div className="w-px h-6 bg-border" />

          {/* For Buttons */}
          <div className="flex items-center gap-2">
            <Link to="/for-agencies">
              <Button
                variant={isAgenciesPage ? "default" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <Building2 className="w-4 h-4" />
                For Agencies
              </Button>
            </Link>
            <Link to="/for-editors">
              <Button
                variant={isEditorsPage ? "default" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <Users className="w-4 h-4" />
                For Editors
              </Button>
            </Link>
            <Link to="/">
              <Button
                variant={isHomePage ? "default" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <Video className="w-4 h-4" />
                For Creators
              </Button>
            </Link>
          </div>

          {/* Separator */}
          <div className="w-px h-6 bg-border" />

          {/* CTA Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open("https://calendly.com/yourlink", "_blank")}
            >
              Book Demo
            </Button>
            <Button
              variant="hero"
              size="sm"
              onClick={() => window.open("#waitlist", "_self")}
            >
              Get Started
            </Button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="lg:hidden bg-background border-b border-border px-4 pb-4 space-y-4 animate-in slide-in-from-top">
          {/* Page Links */}
          <div className="space-y-2">
            {isHomePage ? (
              <>
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="block text-sm text-muted-foreground py-2 w-full text-left hover:text-foreground transition-colors"
                >
                  How It Works
                </button>
                <button
                  onClick={() => scrollToSection("pricing")}
                  className="block text-sm text-muted-foreground py-2 w-full text-left hover:text-foreground transition-colors"
                >
                  Pricing
                </button>
                <button
                  onClick={() => scrollToSection("showcase")}
                  className="block text-sm text-muted-foreground py-2 w-full text-left hover:text-foreground transition-colors"
                >
                  Showcase
                </button>
              </>
            ) : (
              <Link
                to="/"
                className="block text-sm text-muted-foreground py-2 hover:text-foreground transition-colors"
              >
                Home
              </Link>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* For Buttons - Mobile */}
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
              Solutions
            </p>
            <Link to="/for-agencies" className="block">
              <Button
                variant={isAgenciesPage ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start gap-2"
              >
                <Building2 className="w-4 h-4" />
                For Agencies
              </Button>
            </Link>
            <Link to="/for-editors" className="block">
              <Button
                variant={isEditorsPage ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start gap-2"
              >
                <Users className="w-4 h-4" />
                For Editors
              </Button>
            </Link>
            <Link to="/" className="block">
              <Button
                variant={isHomePage ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start gap-2"
              >
                <Video className="w-4 h-4" />
                For Creators
              </Button>
            </Link>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* CTA Buttons - Mobile */}
          <div className="flex flex-col gap-2">
            <Button variant="ghost" size="sm" className="w-full">
              Book Demo
            </Button>
            <Button variant="hero" size="sm" className="w-full">
              Get Started
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;