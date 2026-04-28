// src/components/EditorApplicationEmbed.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, ArrowRight } from "lucide-react";

interface EditorApplicationEmbedProps {
  buttonVariant?: "hero" | "hero-outline" | "ghost";
  buttonSize?: "default" | "lg" | "sm";
  buttonText?: string;
  className?: string;
}

export const EditorApplicationEmbed = ({
  buttonVariant = "hero",
  buttonSize = "lg",
  buttonText = "Apply to be an Editor",
  className,
}: EditorApplicationEmbedProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Replace with your actual Tally form ID
  const TALLY_FORM_ID = "Y5o9X0"; // e.g., "wA1X2Y"
  const tallyUrl = `https://tally.so/embed/Y5o9X0?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`;

  return (
    <>
      <Button
        variant={buttonVariant}
        size={buttonSize}
        onClick={() => setIsOpen(true)}
        className={className}
      >
        {buttonText} <ArrowRight className="w-4 h-4 ml-2" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                <div>
                  <h3 className="font-heading font-semibold text-lg">Editor Application</h3>
                  <p className="text-xs text-muted-foreground">
                    Apply to join our vetted editor network
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Tally Iframe */}
              <div className="flex-1 overflow-y-auto bg-card">
                <iframe
                  src={tallyUrl}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  marginHeight={0}
                  marginWidth={0}
                  title="Editor Application"
                  className="min-h-[600px] w-full"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EditorApplicationEmbed;