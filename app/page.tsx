"use client"; // use client component because need of user interaction and state management

import { useState, useEffect } from "react";

// Update interface to use MongoDB's default string ID structure
interface Todo {
  id: string;
  task: string;
  completed: boolean;
  dateString: string;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [timeString, setTimeString] = useState<string>("");

  // Live Timer
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setTimeString(
        now
          .toLocaleString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          })
          .toUpperCase(),
      );
    };
    updateDateTime();
    const intervalId = setInterval(updateDateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  // HOOK to Load only today's tasks from DB when page boots up
  useEffect(() => {
    async function loadTodayTodos() {
      try {
        const response = await fetch("/api/todos");
        const data = await response.json();
        if (response.ok) {
          setTodos(data);
        }
      } catch (error) {
        console.error("Error fetching tasks from DB:", error);
      }
    }
    loadTodayTodos();
  }, []);

  // Add Task
  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: input }),
      });
      const newTodo = await response.json();

      if (response.ok) {
        setTodos([newTodo, ...todos]); // Add newly created DB task straight to UI array
        setInput("");
      }
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  // Toggle status
  const toggleComplete = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !currentStatus }),
      });

      if (response.ok) {
        setTodos(
          todos.map((todo) =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo,
          ),
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Delete Task
  const deleteTodo = async (id: string) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTodos(todos.filter((todo) => todo.id !== id));
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <main className="relative min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6">
      {/* DATETIME BOX */}
      {timeString && (
        <div className="absolute top-6 right-6 bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-md shadow-md text-right">
          <p className="text-xs font-mono font-bold tracking-tight text-neutral-300">
            {timeString}
          </p>
        </div>
      )}

      {/* TODO BOX */}
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 p-6 rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold font-mono tracking-tight mb-6 text-center">
          Tasks Today
        </h1>

        <form onSubmit={addTodo} className="flex gap-2 mb-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 bg-neutral-950 border border-neutral-700 px-4 py-2 rounded focus:outline-none focus:border-white font-mono text-sm"
          />
          <button
            type="submit"
            className="bg-white text-black px-4 py-2 rounded text-sm font-bold hover:bg-neutral-200 transition-colors"
          >
            Add
          </button>
        </form>

        <ul className="space-y-3">
          {todos.length === 0 ? (
            <p className="text-neutral-500 text-sm text-center font-mono py-4">
              No tasks yet. Get to work!
            </p>
          ) : (
            todos.map((todo) => (
              <li
                key={todo.id} // Using MongoDB generated ID fields
                className={`flex items-center justify-between p-3 rounded border transition-all duration-200 ${
                  todo.completed
                    ? "bg-neutral-950/40 border-emerald-950 text-neutral-400"
                    : "bg-neutral-950 border-neutral-800 text-neutral-200"
                }`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleComplete(todo.id, todo.completed)} // Pass state down to API trigger
                    className="accent-white h-4 w-4 rounded shrink-0"
                  />

                  <span
                    className={`text-sm font-mono truncate ${
                      todo.completed ? "line-through text-neutral-500" : ""
                    }`}
                  >
                    {todo.task}
                  </span>

                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider text-[10px] ${
                      todo.completed
                        ? "text-emerald-500 bg-emerald-950/30"
                        : "text-red-400 bg-red-950/20"
                    }`}
                  >
                    {todo.completed ? "Completed" : "Pending"}
                  </span>
                </div>

                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-neutral-500 hover:text-red-400 text-xs font-mono uppercase tracking-wider ml-4 shrink-0"
                >
                  Delete
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </main>
  );
}
