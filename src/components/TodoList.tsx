import type { Todo } from "../types/todo";
import TodoItem from "./TodoItem";

type Props = {
  todos: Todo[];
  onToggle: (id: number, isCompleted: boolean) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, title: string) => void;
  oldestPendingId: number | null;
};

export default function TodoList({ todos, onToggle, onDelete, onEdit, oldestPendingId }: Props) {
  if (todos.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", opacity: 0.5 }}>
        <p style={{ fontSize: "1.2rem" }}>No tasks yet. Add one above! 👆</p>
      </div>
    );
  }

  const pending = todos.filter(t => !t.isCompleted);
  const completed = todos.filter(t => t.isCompleted);

  return (
    <div>
      {pending.length > 0 && (
        <>
          <p style={{ fontWeight: 700, marginBottom: "0.5rem", opacity: 0.6, fontSize: "0.85rem", textTransform: "uppercase" }}>
            Pending ({pending.length})
          </p>
          {pending.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={onEdit}
              isNext={todo.id === oldestPendingId}
            />
          ))}
        </>
      )}

      {completed.length > 0 && (
        <>
          <p style={{ fontWeight: 700, margin: "1rem 0 0.5rem", opacity: 0.6, fontSize: "0.85rem", textTransform: "uppercase" }}>
            Completed ({completed.length}) — vanishes in 15s
          </p>
          {completed.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={onEdit}
              isNext={false}
            />
          ))}
        </>
      )}
    </div>
  );
}