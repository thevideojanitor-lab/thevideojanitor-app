import { create } from "zustand"

type Theme = "dark" | "light"

interface ThemeStore {
  theme: Theme
  toggle: () => void
}

function applyTheme(t: Theme) {
  if (t === "light") {
    document.documentElement.setAttribute("data-theme", "light")
  } else {
    document.documentElement.removeAttribute("data-theme")
  }
}

const initial: Theme =
  (typeof localStorage !== "undefined" ? (localStorage.getItem("theme") as Theme) : null) ?? "light"

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: initial,
  toggle: () =>
    set((s) => {
      const next: Theme = s.theme === "dark" ? "light" : "dark"
      localStorage.setItem("theme", next)
      applyTheme(next)
      return { theme: next }
    }),
}))

applyTheme(initial)
