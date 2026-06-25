import { NextResponse } from "next/server";
import { db } from "@/db"; 
import { todos } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// Utility helper to get today's date format cleanly in local time zone
function getTodayDateString() {
  const d = new Date();
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

// Get only today's tasks
export async function GET() {
  try {
    const todayStr = getTodayDateString();

    // Query Postgres via Drizzle
    const data = await db
      .select()
      .from(todos)
      .where(eq(todos.dateString, todayStr))
      .orderBy(desc(todos.createdAt));

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("GET API Error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

//  Create a new task
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const todayStr = getTodayDateString();

    // Insert statement returning the newly created row array
    const [newTodo] = await db
      .insert(todos)
      .values({
        task: body.task,
        completed: false,
        dateString: todayStr,
      })
      .returning();

    return NextResponse.json(newTodo, { status: 201 });
  } catch (error) {
    console.error("POST API Error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}