import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import StatusBadge, { resolveStatus } from "./StatusBadge"

describe("StatusBadge", () => {
  it("renders the human label for a status", () => {
    const { getByRole } = render(<StatusBadge status="approved" />)
    expect(getByRole("status").textContent).toContain("Approved")
  })

  // jsdom's CSSOM drops `var(...)` values from el.style, so we assert the
  // tone->variable wiring through the pure resolveStatus seam instead.
  it("wires each tone to its theme-aware CSS variables", () => {
    const s = resolveStatus("delivered")
    expect(s.tone).toBe("delivered")
    expect(s.backgroundColor).toBe("var(--status-delivered-bg)")
    expect(s.color).toBe("var(--status-delivered-fg)")
    expect(s.borderColor).toBe("var(--status-delivered-border)")
  })

  it("maps an unknown status to the pending tone (Finding Editor)", () => {
    const s = resolveStatus("weird_value")
    expect(s.tone).toBe("pending")
    expect(s.label).toBe("Finding Editor")
    expect(s.backgroundColor).toBe("var(--status-pending-bg)")
  })

  it("maps matched and pending_match to the same pending tone", () => {
    expect(resolveStatus("matched").tone).toBe("pending")
    expect(resolveStatus("pending_match").tone).toBe("pending")
  })
})
