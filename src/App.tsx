import { useEffect, useState, useRef } from "react";
import type { Todo } from "./types/todo";
import * as todoService from "./services/todoService";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";

type Filter = "all" | "pending" | "completed";
const MAX_ACTIVE = 5;

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const ghostTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    todoService.getAll()
      .then(setTodos)
      .catch(() => setError("Could not connect to the server. Is the API running?"))
      .finally(() => setLoading(false));
  }, []);

  // FIFO: the next task to complete is always the oldest pending one
  const oldestPendingId = todos
    .filter(t => !t.isCompleted)
    .sort((a, b) => a.id - b.id)[0]?.id ?? null;

  const activeTasks = todos.filter(t => !t.isCompleted).length;
  const isAtCapacity = activeTasks >= MAX_ACTIVE;

  const handleAdd = async (title: string) => {
    if (isAtCapacity) return;
    try {
      const newTodo = await todoService.create(title);
      setTodos(prev => [...prev, newTodo]);
    } catch {
      setError("Failed to add task.");
    }
  };

  const handleToggle = async (id: number, isCompleted: boolean) => {
    // FIFO: only allow completing the oldest pending task
    if (isCompleted && id !== oldestPendingId) {
      setError("⚠️ Sequential Integrity: You must complete tasks in order of creation.");
      return;
    }

    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    try {
      const updated = await todoService.update(id, { ...todo, isCompleted });
      setTodos(prev => prev.map(t => t.id === id ? updated : t));

      // Shadow Archive: remove from UI after 15 seconds
      if (isCompleted) {
        const timer = setTimeout(() => {
          setTodos(prev => prev.filter(t => t.id !== id));
          ghostTimers.current.delete(id);
        }, 15000);
        ghostTimers.current.set(id, timer);
      } else {
        // If unchecked before ghost, cancel the timer
        const existing = ghostTimers.current.get(id);
        if (existing) {
          clearTimeout(existing);
          ghostTimers.current.delete(id);
        }
      }
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
      const existing = ghostTimers.current.get(id);
      if (existing) {
        clearTimeout(existing);
        ghostTimers.current.delete(id);
      }
    } catch {
      setError("Failed to delete task.");
    }
  };

  const handleClearCompleted = async () => {
    const completedIds = todos.filter(t => t.isCompleted).map(t => t.id);
    try {
      await todoService.clearCompleted(completedIds);
      setTodos(prev => prev.filter(t => !t.isCompleted));
      completedIds.forEach(id => {
        const existing = ghostTimers.current.get(id);
        if (existing) { clearTimeout(existing); ghostTimers.current.delete(id); }
      });
    } catch {
      setError("Failed to clear completed tasks.");
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

        {/* Capacity Warning Banner */}
        {isAtCapacity && (
          <div style={{
            background: "linear-gradient(135deg, #e67e22, #e74c3c)",
            color: "white",
            padding: "0.85rem 1.25rem",
            borderRadius: "10px",
            marginBottom: "1rem",
            fontWeight: 700,
            fontSize: "0.95rem",
            textAlign: "center",
            boxShadow: "0 4px 15px rgba(231,76,60,0.4)",
          }}>
            🚫 Capacity Reached — Max {MAX_ACTIVE} active tasks allowed. Complete one first.
          </div>
        )}

        {/* Stats Bar */}
        {todos.length > 0 && (
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(255,255,255,0.05)",
            borderRadius: "10px",
            padding: "0.75rem 1.25rem",
            marginBottom: "1.25rem",
            color: "#ccc",
            fontSize: "0.9rem",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}>
            <span>Total: <strong style={{ color: "#f0c040" }}>{todos.length}</strong></span>
            <span>Active: <strong style={{ color: isAtCapacity ? "#e74c3c" : "#f0c040" }}>{activeTasks}/{MAX_ACTIVE}</strong></span>
            <span>Completed: <strong style={{ color: "#2ecc71" }}>{completed}</strong></span>
            {completed > 0 && (
              <button onClick={handleClearCompleted} style={{
                padding: "0.35rem 0.85rem",
                background: "#e74c3c",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.8rem",
              }}>
                🗑 Clear Completed ({completed})
              </button>
            )}
          </div>
        )}

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
          {(["all", "pending", "completed"] as Filter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
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
            }}>
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
            <button onClick={() => setError(null)} style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "1.1rem" }}>✕</button>
          </div>
        )}

        {/* Main Card */}
        <div style={{
          background: "#f0f2f5",
          borderRadius: "16px",
          padding: "2rem",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}>
          <TodoForm onAdd={handleAdd} isDisabled={isAtCapacity} />

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
              oldestPendingId={oldestPendingId}
            />
          )}
        </div>

        <p style={{ textAlign: "center", marginTop: "1.5rem", color: "#555", fontSize: "0.85rem" }}>
          Finals_Q2 · React + TypeScript + .NET Core
        </p>
      </div>
    </div>
  );
}