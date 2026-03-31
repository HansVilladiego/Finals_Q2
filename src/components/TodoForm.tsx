import { useState } from "react";

type Props = {
  onAdd: (title: string) => void;
  isDisabled?: boolean;
};

export default function TodoForm({ onAdd, isDisabled = false }: Props) {
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isDisabled) return;
    onAdd(title.trim());
    setTitle("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder={isDisabled ? "Capacity reached (5/5)" : "Add a new task..."}
        disabled={isDisabled}
        style={{
          flex: 1,
          padding: "0.75rem 1rem",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontSize: "1rem",
          outline: "none",
          opacity: isDisabled ? 0.5 : 1,
          cursor: isDisabled ? "not-allowed" : "text",
        }}
      />
      <button
        type="submit"
        disabled={isDisabled}
        style={{
          padding: "0.75rem 1.5rem",
          background: isDisabled
            ? "#999"
            : "linear-gradient(135deg, #f0c040, #e67e22)",
          color: isDisabled ? "#eee" : "#111",
          fontWeight: 700,
          border: "none",
          borderRadius: "8px",
          cursor: isDisabled ? "not-allowed" : "pointer",
          fontSize: "1rem",
          opacity: isDisabled ? 0.6 : 1,
        }}
      >
        + Add
      </button>
    </form>
  );
}