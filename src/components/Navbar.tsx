import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <a href="#" className="font-heading text-xl font-bold tracking-tight text-foreground">
          The<span className="text-primary">Video</span>Janitors
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          <a href="#showcase" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Showcase</a>
          <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm">Book Demo</Button>
          <Button variant="hero" size="sm">Join Waitlist</Button>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-background border-b border-border px-4 pb-4 space-y-3">
          <a href="#how-it-works" className="block text-sm text-muted-foreground py-2" onClick={() => setMobileOpen(false)}>How It Works</a>
          <a href="#pricing" className="block text-sm text-muted-foreground py-2" onClick={() => setMobileOpen(false)}>Pricing</a>
          <a href="#showcase" className="block text-sm text-muted-foreground py-2" onClick={() => setMobileOpen(false)}>Showcase</a>
          <a href="#faq" className="block text-sm text-muted-foreground py-2" onClick={() => setMobileOpen(false)}>FAQ</a>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" size="sm" className="flex-1">Book Demo</Button>
            <Button variant="hero" size="sm" className="flex-1">Join Waitlist</Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
