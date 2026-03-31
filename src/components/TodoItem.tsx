import { useState } from "react";
import type { Todo } from "../types/todo";

type Props = {
  todo: Todo;
  onToggle: (id: number, isCompleted: boolean) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, title: string) => void;
};

export default function TodoItem({ todo, onToggle, onDelete, onEdit }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(todo.title);

  const handleEdit = () => {
    if (!editValue.trim()) return;
    onEdit(todo.id, editValue.trim());
    setIsEditing(false);
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      padding: "0.85rem 1rem",
      borderRadius: "10px",
      background: "#fff",
      boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
      marginBottom: "0.75rem",
      border: "1px solid #eee",
    }}>
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={todo.isCompleted}
        onChange={() => onToggle(todo.id, !todo.isCompleted)}
        style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#f0c040" }}
      />

      {/* Title or Edit Input */}
      {isEditing ? (
        <input
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleEdit()}
          autoFocus
          style={{
            flex: 1, padding: "0.4rem 0.75rem",
            borderRadius: "6px", border: "1px solid #f0c040",
            fontSize: "1rem", outline: "none",
          }}
        />
      ) : (
        <span style={{
          flex: 1,
          fontSize: "1rem",
          textDecoration: todo.isCompleted ? "line-through" : "none",
          opacity: todo.isCompleted ? 0.5 : 1,
          transition: "all 0.2s",
        }}>
          {todo.title}
        </span>
      )}

      {/* Action Buttons */}
      {isEditing ? (
        <>
          <button onClick={handleEdit} style={btnStyle("#2ecc71", "#fff")}>Save</button>
          <button onClick={() => setIsEditing(false)} style={btnStyle("#95a5a6", "#fff")}>Cancel</button>
        </>
      ) : (
        <>
          <button onClick={() => setIsEditing(true)} style={btnStyle("#f0c040", "#111")}>Edit</button>
          <button onClick={() => onDelete(todo.id)} style={btnStyle("#e74c3c", "#fff")}>Delete</button>
        </>
      )}
    </div>
  );
}

const btnStyle = (bg: string, color: string): React.CSSProperties => ({
  padding: "0.4rem 0.85rem",
  background: bg,
  color,
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "0.85rem",
});