// src/components/TallyModal.tsx
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface TallyModalProps {
  url: string;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const TallyModal = ({
  url,
  children,
  title,
  subtitle,
}: TallyModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure portal runs only on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll
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

  const embedUrl = `${url}?alignLeft=1&hideTitle=1&transparentBackground=1`;

  const modal = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-lg flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
            <div>
              {title && (
                <h2 className="text-lg font-semibold text-white">{title}</h2>
              )}
              {subtitle && (
                <p className="text-sm text-gray-400">{subtitle}</p>
              )}
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Fullscreen Iframe */}
          <div className="flex-1">
            <iframe
              src={embedUrl}
              title={title || "Tally Form"}
              className="w-full h-full border-0"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Trigger */}
      <div
        onClick={() => setIsOpen(true)}
        className="inline-block cursor-pointer"
      >
        {children}
      </div>

      {/* Portal render */}
      {mounted && createPortal(modal, document.body)}
    </>
  );
};

export default TallyModal;