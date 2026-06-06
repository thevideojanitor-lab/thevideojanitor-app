import { motion, AnimatePresence } from "motion/react"
import { X, Download, ExternalLink } from "lucide-react"
import { slideInFromBottom } from "@/lib/animations"
import type { Request, Brief } from "@/lib/supabase"

interface Props {
  request: Request | null
  onClose: () => void
}

const VIBE_COLORS: Record<string, string> = {
  energetic: "bg-primary/15 text-primary border-primary/30",
  calm: "bg-editor-accent/15 text-editor-accent border-editor-accent/30",
  funny: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  professional: "bg-muted-foreground/15 text-muted-foreground border-border",
  emotional: "bg-[rgba(59,130,246,0.15)] text-[#60a5fa] border-[rgba(59,130,246,0.3)]",
  inspirational: "bg-green-500/15 text-green-400 border-green-500/30",
}

export default function BriefViewer({ request, onClose }: Props) {
  const brief = (request?.brief ?? {}) as Brief
  const aspectRatios = request?.aspect_ratios ?? []

  return (
    <AnimatePresence>
      {request && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            variants={slideInFromBottom}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-0 left-0 right-0 z-50 bg-input border-t border-border rounded-t-2xl max-h-[85vh] flex flex-col"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-card rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
              <div>
                <h2 className="font-heading text-base font-semibold text-foreground">Full Brief</h2>
                <p className="text-xs text-muted-foreground capitalize">{request.edit_type} edit · {request.credits_cost} cr</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
              {/* Description */}
              {brief.description && (
                <div>
                  <p className="text-xs font-sans uppercase tracking-wider text-muted-foreground mb-2">Description</p>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{brief.description}</p>
                </div>
              )}

              {/* Vibe tags */}
              {brief.vibe && brief.vibe.length > 0 && (
                <div>
                  <p className="text-xs font-sans uppercase tracking-wider text-muted-foreground mb-2">Vibe</p>
                  <div className="flex flex-wrap gap-2">
                    {brief.vibe.map((tag) => (
                      <span
                        key={tag}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${
                          VIBE_COLORS[tag] ?? "bg-card text-muted-foreground border-border"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Aspect ratios */}
              {aspectRatios.length > 0 && (
                <div>
                  <p className="text-xs font-sans uppercase tracking-wider text-muted-foreground mb-2">Aspect Ratios</p>
                  <div className="flex flex-wrap gap-2">
                    {aspectRatios.map((ratio) => (
                      <span
                        key={ratio}
                        className="text-xs font-mono font-medium px-2.5 py-1 rounded bg-card text-foreground border border-border"
                      >
                        {ratio}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Captions */}
              <div>
                <p className="text-xs font-sans uppercase tracking-wider text-muted-foreground mb-2">Captions</p>
                <p className="text-sm text-foreground">
                  {brief.captions === "yes" ? "Include captions" : "No captions needed"}
                </p>
              </div>

              {/* Instructions */}
              {brief.instructions && (
                <div>
                  <p className="text-xs font-sans uppercase tracking-wider text-muted-foreground mb-2">
                    Additional Instructions
                  </p>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{brief.instructions}</p>
                </div>
              )}

              {/* Reference link */}
              {brief.referenceLink && (
                <div>
                  <p className="text-xs font-sans uppercase tracking-wider text-muted-foreground mb-2">Reference Video</p>
                  <a
                    href={brief.referenceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-editor-accent hover:underline break-all"
                  >
                    <ExternalLink size={13} className="shrink-0" />
                    {brief.referenceLink}
                  </a>
                </div>
              )}

              {/* Submitted time */}
              <div>
                <p className="text-xs font-sans uppercase tracking-wider text-muted-foreground mb-2">Submitted</p>
                <p className="text-sm text-foreground">
                  {new Date(request.submitted_at).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex gap-3 px-5 py-4 border-t border-border shrink-0 pb-safe">
              <button
                onClick={onClose}
                className="flex-1 border border-border text-foreground text-sm font-medium rounded-lg py-2.5 hover:bg-card transition-colors"
              >
                Close
              </button>
              {request.footage_url && (
                <a
                  href={request.footage_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-editor-accent text-foreground text-sm font-semibold rounded-lg py-2.5 hover:bg-[#2563EB] transition-colors"
                >
                  <Download size={15} />
                  Download Footage
                </a>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
