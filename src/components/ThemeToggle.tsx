import { Sun, Moon } from "lucide-react"
import { motion } from "motion/react"
import { useThemeStore } from "@/stores/themeStore"

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useThemeStore()

  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.88 }}
      className={`p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ${className ?? ""}`}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -20, opacity: 0, scale: 0.8 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </motion.div>
    </motion.button>
  )
}
