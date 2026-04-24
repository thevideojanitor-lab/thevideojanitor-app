// src/components/LegalLayout.tsx
import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

const LegalLayout = ({ title, lastUpdated, children }: LegalLayoutProps) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-24 max-w-3xl">
        <div className="mb-12">
          <p className="text-sm text-primary font-medium uppercase tracking-widest mb-3">Legal</p>
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-3">{title}</h1>
          <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
        </div>
        <div className="prose prose-sm max-w-none space-y-8 text-text-secondary">
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
};

// Shared sub-components for legal content
export const LegalSection = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <div className="space-y-3">
    <h2 className="font-heading text-xl font-semibold text-foreground">{title}</h2>
    <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">{children}</div>
  </div>
);

export const LegalList = ({ items }: { items: string[] }) => (
  <ul className="space-y-2 pl-4">
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
        <span className="text-primary mt-1 shrink-0">•</span>
        {item}
      </li>
    ))}
  </ul>
);

export default LegalLayout;