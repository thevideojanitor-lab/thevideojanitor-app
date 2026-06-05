import { ReactNode } from "react"

interface Props {
  as?: "h1" | "h2"
  className?: string
  children: ReactNode
}

export default function EditorialHeading({ as = "h2", className = "", children }: Props) {
  const size = as === "h1" ? "text-5xl md:text-7xl" : "text-4xl md:text-6xl"
  const Tag = as
  return (
    <Tag className={`font-heading font-bold leading-[0.95] tracking-tight ${size} ${className}`}>
      {children}
    </Tag>
  )
}
