import { useState } from "react";

type Props = {
  onAdd: (title: string) => void;
};

export default function TodoForm({ onAdd }: Props) {
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim());
    setTitle("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Add a new task..."
        style={{
          flex: 1,
          padding: "0.75rem 1rem",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontSize: "1rem",
          outline: "none",
        }}
      />
      <button
        type="submit"
        style={{
          padding: "0.75rem 1.5rem",
          background: "linear-gradient(135deg, #f0c040, #e67e22)",
          color: "#111",
          fontWeight: 700,
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "1rem",
        }}
      >
        + Add
      </button>
    </form>
  );
}