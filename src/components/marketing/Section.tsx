import { ReactNode } from "react"

interface Props {
  id?: string
  tone?: "default" | "sand"
  className?: string
  children: ReactNode
}

export default function Section({ id, tone = "default", className = "", children }: Props) {
  const toneCls = tone === "sand" ? "bg-surface-elevated/60 border-y border-border" : ""
  return (
    <section id={id} className={`px-4 py-24 md:py-32 ${toneCls} ${className}`}>
      <div className="max-w-6xl mx-auto w-full">{children}</div>
    </section>
  )
}
