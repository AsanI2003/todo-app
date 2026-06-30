"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface Todo {
  id: string;
  task: string;
  completed: boolean;
  dateString: string;
}

export default function DashboardPage() {
  const router = useRouter();
  
  
  const { data: session, isPending: isAuthLoading } = authClient.useSession();

  
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [timeString, setTimeString] = useState<string>("");
  
  
  const [isTasksLoading, setIsTasksLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);
  const [togglingIds, setTogglingIds] = useState<string[]>([]);

  // Protect route from unauthenticated intrusions
  useEffect(() => {
    if (!isAuthLoading && !session) {
      router.push("/");
    }
  }, [session, isAuthLoading, router]);

  // Live Clock
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

  // load today tasks
  useEffect(() => {
    if (!session) return;

    async function loadTodayTodos() {
      try {
        setIsTasksLoading(true);
        const response = await fetch("/api/todos");
        const data = await response.json();
        if (response.ok) {
          setTodos(data);
        }
      } catch (error) {
        console.error("Error fetching tasks from DB:", error);
      } finally {
        setIsTasksLoading(false);
      }
    }
    loadTodayTodos();
  }, [session]);

  // Terminal Sign Out Action Sequence
  const handleSignOut = async () => {
    setIsSigningOut(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
        onError: () => {
          setIsSigningOut(false);
        }
      }
    });
  };

  // Add Task 
  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isAddingTask) return;

    try {
      setIsAddingTask(true);
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: input }),
      });
      const newTodo = await response.json();

      if (response.ok) {
        setTodos([newTodo, ...todos]);
        setInput("");
      }
    } catch (error) {
      console.error("Error saving task:", error);
    } finally {
      setIsAddingTask(false);
    }
  };

  // status toggle action
  const toggleComplete = async (id: string, currentStatus: boolean) => {
    try {
      setTogglingIds((prev) => [...prev, id]);
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
    } finally {
      setTogglingIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Delete Task
  const deleteTodo = async (id: string) => {
    try {
      setDeletingIds((prev) => [...prev, id]);
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTodos(todos.filter((todo) => todo.id !== id));
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setDeletingIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Guard Loader
  if (isAuthLoading || !session) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center font-mono text-xs tracking-widest uppercase animate-pulse">
        Verifying Security Credentials...
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6">
      {/* Live clock */}
      {timeString && (
        <div className="absolute top-6 right-6 bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-md shadow-md text-right hidden sm:block">
          <p className="text-xs font-mono font-bold tracking-tight text-neutral-300">
            {timeString}
          </p>
        </div>
      )}

      {/* main box */}
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 p-6 rounded-lg shadow-xl">
        
        {/* top control nav */}
        <div className="flex justify-between items-center border-b border-neutral-800 pb-4 mb-6">
          <div className="min-w-0">
            <p className="text-[10px] font-mono text-neutral-500 tracking-wider uppercase">User</p>
            <p className="text-sm font-mono font-bold truncate text-neutral-200">{session.user.name}</p>
          </div>
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="border border-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed hover:border-red-900 text-neutral-400 hover:text-red-400 font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded transition-colors flex items-center gap-1.5"
          >
            {isSigningOut && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}
            {isSigningOut ? "LOGGING OUT..." : "Sign Out"}
          </button>
        </div>

        <h1 className="text-2xl font-bold font-mono tracking-tight mb-6 text-center uppercase">
          Tasks Today
        </h1>

        {/* task inputs */}
        <form onSubmit={addTodo} className="flex gap-2 mb-6">
          <input
            type="text"
            value={input}
            disabled={isAddingTask}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isAddingTask ? "PROCESSING REQ..." : "Add a new task..."}
            className="flex-1 bg-neutral-950 border border-neutral-700 px-4 py-2 rounded focus:outline-none focus:border-white font-mono text-sm text-white disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isAddingTask || !input.trim()}
            className="bg-white text-black px-4 py-2 rounded text-sm font-bold hover:bg-neutral-200 transition-colors font-mono uppercase min-w-[70px] flex items-center justify-center disabled:bg-neutral-700 disabled:text-neutral-400"
          >
            {isAddingTask ? (
              <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              "Add"
            )}
          </button>
        </form>

        {/* task view */}
        <ul className="space-y-3">
          {isTasksLoading ? (
            /* initial boot animation */
            <>
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-[46px] w-full bg-neutral-950 border border-neutral-800 rounded animate-pulse flex items-center p-3 gap-4">
                  <div className="w-4 h-4 bg-neutral-800 rounded"></div>
                  <div className="h-3 bg-neutral-800 rounded w-1/2"></div>
                  <div className="h-4 bg-neutral-800 rounded w-16 ml-auto"></div>
                </div>
              ))}
            </>
          ) : todos.length === 0 ? (
            <p className="text-neutral-500 text-sm text-center font-mono py-4">
              No tasks yet. Get to work!
            </p>
          ) : (
            todos.map((todo) => {
              const isDeleting = deletingIds.includes(todo.id);
              const isToggling = togglingIds.includes(todo.id);

              return (
                <li
                  key={todo.id}
                  className={`flex items-center justify-between p-3 rounded border transition-all duration-200 ${
                    isDeleting ? "opacity-30 scale-[0.98] border-red-950" : ""
                  } ${
                    todo.completed
                      ? "bg-neutral-950/40 border-emerald-950 text-neutral-400"
                      : "bg-neutral-950 border-neutral-800 text-neutral-200"
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* status changer */}
                    <div className="relative flex items-center justify-center shrink-0 h-4 w-4">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        disabled={isToggling || isDeleting}
                        onChange={() => toggleComplete(todo.id, todo.completed)}
                        className={`accent-white h-4 w-4 rounded shrink-0 cursor-pointer transition-opacity ${
                          isToggling ? "opacity-20 cursor-not-allowed" : "opacity-100"
                        }`}
                      />
                      {isToggling && (
                        <span className="absolute inset-0 border border-white border-t-transparent rounded-full animate-spin p-0.5" />
                      )}
                    </div>

                    <span
                      className={`text-sm font-mono truncate transition-all duration-200 ${
                        todo.completed ? "line-through text-neutral-500" : ""
                      } ${isToggling ? "opacity-60" : ""}`}
                    >
                      {todo.task}
                    </span>

                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider text-[10px] shrink-0 transition-colors duration-200 ${
                        isToggling 
                          ? "text-neutral-500 bg-neutral-950 border border-neutral-800" 
                          : todo.completed 
                            ? "text-emerald-500 bg-emerald-950/30" 
                            : "text-red-400 bg-red-950/20"
                      }`}
                    >
                      {isToggling ? "SAVING..." : todo.completed ? "Completed" : "Pending"}
                    </span>
                  </div>

                  {/* action remover */}
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    disabled={isDeleting || isToggling}
                    className="text-neutral-500 hover:text-red-400 disabled:text-neutral-700 disabled:cursor-not-allowed text-xs font-mono uppercase tracking-wider ml-4 shrink-0 transition-colors"
                  >
                    {isDeleting ? "WIPING..." : "Delete"}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </main>
  );
}