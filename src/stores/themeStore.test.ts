import { describe, it, expect, beforeEach, vi } from "vitest"

describe("themeStore default", () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute("data-theme")
    vi.resetModules()
  })

  it("defaults a brand-new visitor (no saved pref) to light", async () => {
    const mod = await import("./themeStore")
    expect(mod.useThemeStore.getState().theme).toBe("light")
  })

  it("respects a saved dark preference", async () => {
    localStorage.setItem("theme", "dark")
    const mod = await import("./themeStore")
    expect(mod.useThemeStore.getState().theme).toBe("dark")
  })
})
