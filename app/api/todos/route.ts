import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Todo from "@/models/Todo";

// Utility helper to get today's date format cleanly in local time zone
function getTodayDateString() {
  const d = new Date();
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

// Fetch only tasks matching today's date string
export async function GET() {
  try {
    await connectDB();
    const todayStr = getTodayDateString();
    
    // Query MongoDB find items where dateString strictly matches today's date configuration
    const todos = await Todo.find({ dateString: todayStr }).sort({ createdAt: -1 });
    
    return NextResponse.json(todos, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

// Save a new task with automatic current date string assignment
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const todayStr = getTodayDateString();

    const newTodo = await Todo.create({
      task: body.task,
      completed: false,
      dateString: todayStr, // Binds this task to today permanently
    });

    return NextResponse.json(newTodo, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}