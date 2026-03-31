import { useEffect, useState } from "react";
import type { Todo } from "./types/todo";
import * as todoService from "./services/todoService";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";

type Filter = "all" | "pending" | "completed";

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    todoService.getAll()
      .then(setTodos)
      .catch(() => setError("Could not connect to the server. Is the API running?"))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (title: string) => {
    try {
      const newTodo = await todoService.create(title);
      setTodos(prev => [...prev, newTodo]);
    } catch {
      setError("Failed to add task.");
    }
  };

  const handleToggle = async (id: number, isCompleted: boolean) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    try {
      const updated = await todoService.update(id, { ...todo, isCompleted });
      setTodos(prev => prev.map(t => t.id === id ? updated : t));
    } catch {
      setError("Failed to update task.");
    }
  };

  const handleEdit = async (id: number, title: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    try {
      const updated = await todoService.update(id, { ...todo, title });
      setTodos(prev => prev.map(t => t.id === id ? updated : t));
    } catch {
      setError("Failed to edit task.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await todoService.remove(id);
      setTodos(prev => prev.filter(t => t.id !== id));
    } catch {
      setError("Failed to delete task.");
    }
  };

  const completed = todos.filter(t => t.isCompleted).length;

  const filteredTodos = todos.filter(t => {
    if (filter === "pending") return !t.isCompleted;
    if (filter === "completed") return t.isCompleted;
    return true;
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a1a2e, #16213e)",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      padding: "3rem 1rem",
    }}>
      <div style={{ width: "100%", maxWidth: "620px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#f0c040", marginBottom: "0.25rem" }}>
            📝 Todo App
          </h1>
          <p style={{ color: "#aaa", fontSize: "1rem" }}>Stay organized. Get things done.</p>
        </div>

        {/* Stats Bar */}
        {todos.length > 0 && (
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            background: "rgba(255,255,255,0.05)",
            borderRadius: "10px",
            padding: "0.75rem 1.25rem",
            marginBottom: "1.25rem",
            color: "#ccc",
            fontSize: "0.9rem",
          }}>
            <span>Total: <strong style={{ color: "#f0c040" }}>{todos.length}</strong></span>
            <span>Pending: <strong style={{ color: "#e74c3c" }}>{todos.length - completed}</strong></span>
            <span>Completed: <strong style={{ color: "#2ecc71" }}>{completed}</strong></span>
          </div>
        )}

        {/* Filter Tabs */}
        <div style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1.25rem",
        }}>
          {(["all", "pending", "completed"] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                flex: 1,
                padding: "0.6rem",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.9rem",
                background: filter === f ? "#f0c040" : "rgba(255,255,255,0.07)",
                color: filter === f ? "#111" : "#aaa",
                transition: "all 0.2s",
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Error Banner */}
        {error && (
          <div style={{
            background: "#e74c3c",
            color: "white",
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            marginBottom: "1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "1.1rem" }}
            >✕</button>
          </div>
        )}

        {/* Main Card */}
        <div style={{
          background: "#f0f2f5",
          borderRadius: "16px",
          padding: "2rem",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}>
          <TodoForm onAdd={handleAdd} />

          {loading ? (
            <div style={{ textAlign: "center", padding: "3rem", opacity: 0.5 }}>
              <p style={{ fontSize: "1.1rem" }}>Loading tasks...</p>
            </div>
          ) : (
            <TodoList
              todos={filteredTodos}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          )}
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", marginTop: "1.5rem", color: "#555", fontSize: "0.85rem" }}>
          Finals_Q2 · React + TypeScript + .NET Core
        </p>
      </div>
    </div>
  );
}