import { ReactNode } from "react"
import { motion } from "motion/react"
import { fadeUp, scaleIn } from "@/lib/animations"

interface Props {
  variant?: "fadeUp" | "scaleIn"
  delay?: number
  className?: string
  children: ReactNode
}

export default function Reveal({ variant = "fadeUp", delay = 0, className, children }: Props) {
  const variants = variant === "scaleIn" ? scaleIn : fadeUp
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  )
}
