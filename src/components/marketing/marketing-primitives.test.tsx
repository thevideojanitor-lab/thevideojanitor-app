import { describe, it, expect, vi } from "vitest"
import { render } from "@testing-library/react"

// jsdom does not implement IntersectionObserver; motion's whileInView needs it.
vi.stubGlobal("IntersectionObserver", class {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return [] }
})
import Section from "./Section"
import BentoCard from "./BentoCard"
import EditorialHeading from "./EditorialHeading"
import Reveal from "./Reveal"

describe("marketing primitives", () => {
  it("Section renders children inside a <section> with an id", () => {
    const { container, getByText } = render(<Section id="pricing">hi</Section>)
    expect(container.querySelector("section#pricing")).toBeTruthy()
    expect(getByText("hi")).toBeTruthy()
  })

  it("BentoCard applies the primary variant classes", () => {
    const { getByTestId } = render(<BentoCard variant="primary" data-testid="c">x</BentoCard>)
    expect(getByTestId("c").className).toContain("bg-primary")
    expect(getByTestId("c").className).toContain("rounded-card-lg")
  })

  it("EditorialHeading renders an h1 when as=h1", () => {
    const { container } = render(<EditorialHeading as="h1">Big</EditorialHeading>)
    expect(container.querySelector("h1")).toBeTruthy()
  })

  it("Reveal renders its children", () => {
    const { getByText } = render(<Reveal>shown</Reveal>)
    expect(getByText("shown")).toBeTruthy()
  })
})
