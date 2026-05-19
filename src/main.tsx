import { StrictMode, Component, ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./index.css";

class RootErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: "100vh", background: "#121212", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", color: "#F9FAFB", padding: "2rem", textAlign: "center" }}>
          <div>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "#FF5F15", marginBottom: "0.5rem" }}>TheVideoJanitors</div>
            <div style={{ color: "#9CA3AF", marginBottom: "1rem" }}>Something went wrong. Please try refreshing the page.</div>
            <button onClick={() => window.location.reload()} style={{ background: "#FF5F15", color: "#121212", border: "none", borderRadius: "0.5rem", padding: "0.6rem 1.5rem", fontWeight: 600, cursor: "pointer" }}>
              Refresh
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootErrorBoundary>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </RootErrorBoundary>
  </StrictMode>
);