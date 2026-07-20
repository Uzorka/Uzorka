import { Component, type ErrorInfo, type ReactNode } from "react";
import { C, SERIF, SANS } from "./theme";

type Props = { children: ReactNode };
type State = { error: Error | null };

/** Catches render errors anywhere below and shows a recoverable fallback. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[Bible Explained] render error:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.bg,
          color: C.ink,
          fontFamily: SANS,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <div style={{ fontFamily: SERIF, fontSize: 28, marginBottom: 10 }}>
            Something went wrong
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: C.muted, marginTop: 0 }}>
            The app hit an unexpected error. Reloading usually fixes it — your saved verses
            and notes are stored safely on this device.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 8,
              border: "none",
              background: C.navy,
              color: C.cream,
              fontSize: 15,
              fontWeight: 600,
              padding: "13px 26px",
              borderRadius: 999,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
