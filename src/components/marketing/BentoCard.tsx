import { ReactNode } from "react"

interface Props {
  variant?: "default" | "sand" | "primary" | "ink"
  className?: string
  children: ReactNode
  [key: string]: unknown
}

const VARIANTS: Record<string, string> = {
  default: "bg-card border border-border rounded-card-lg shadow-lift",
  sand: "bg-surface-elevated border border-border rounded-card-lg",
  primary: "bg-primary text-primary-foreground rounded-card-lg shadow-soft",
  ink: "bg-foreground text-background rounded-card-lg shadow-soft",
}

export default function BentoCard({ variant = "default", className = "", children, ...rest }: Props) {
  return (
    <div className={`${VARIANTS[variant]} ${className}`} {...rest}>
      {children}
    </div>
  )
}
