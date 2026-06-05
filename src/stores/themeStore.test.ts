import { describe, it, expect, beforeEach, vi } from "vitest"

describe("themeStore default", () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute("data-theme")
    vi.resetModules()
  })

  // Default stays dark (Cutting Room) until app screens are rebuilt to be
  // light-ready; light is opt-in via the toggle and persisted preference.
  it("defaults a brand-new visitor (no saved pref) to dark", async () => {
    const mod = await import("./themeStore")
    expect(mod.useThemeStore.getState().theme).toBe("dark")
  })

  it("respects a saved light preference", async () => {
    localStorage.setItem("theme", "light")
    const mod = await import("./themeStore")
    expect(mod.useThemeStore.getState().theme).toBe("light")
  })
})
