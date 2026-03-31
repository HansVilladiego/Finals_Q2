type Props = {
  status: "valid" | "tampered" | "checking" | "unknown";
};

export default function ChainStatus({ status }: Props) {
  if (status === "checking") return null;

  const config = {
    valid: {
      bg: "linear-gradient(135deg, #1a6b3a, #2ecc71)",
      icon: "🔗",
      text: "Chain Integrity Verified — All blocks valid.",
      border: "#2ecc71",
    },
    tampered: {
      bg: "linear-gradient(135deg, #7b0000, #e74c3c)",
      icon: "🚨",
      text: "REDACTED / TAMPERED — Blockchain integrity compromised!",
      border: "#e74c3c",
    },
    unknown: {
      bg: "linear-gradient(135deg, #555, #888)",
      icon: "⚠️",
      text: "Could not verify chain. Is the API running?",
      border: "#888",
    },
  };

  const c = config[status];

  return (
    <div style={{
      background: c.bg,
      border: `2px solid ${c.border}`,
      color: "white",
      padding: "0.85rem 1.25rem",
      borderRadius: "10px",
      marginBottom: "1rem",
      fontWeight: 700,
      fontSize: "0.95rem",
      textAlign: "center",
      boxShadow: status === "tampered"
        ? "0 0 24px rgba(231,76,60,0.7)"
        : "0 4px 15px rgba(0,0,0,0.3)",
      letterSpacing: status === "tampered" ? "0.05em" : "normal",
      animation: status === "tampered" ? "pulse 1.2s infinite" : "none",
    }}>
      {c.icon} {c.text}

      {/* Pulse animation for tampered state */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.75; }
        }
      `}</style>
    </div>
  );
}