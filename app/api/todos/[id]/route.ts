import { NextResponse } from "next/server";
import { db } from "@/db";
import { todos } from "@/db/schema";
import { eq } from "drizzle-orm";

// Change status
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const resolvedParams = await params;
    const targetId = resolvedParams.id;

   
    const [updatedTodo] = await db
      .update(todos)
      .set({ completed: body.completed })
      .where(eq(todos.id, targetId))
      .returning();

    if (!updatedTodo) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(updatedTodo, { status: 200 });
  } catch (error) {
    console.error("PUT API Error:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}

// Remove task
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const targetId = resolvedParams.id;

    const [deletedTodo] = await db
      .delete(todos)
      .where(eq(todos.id, targetId))
      .returning();

    if (!deletedTodo) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Task deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("DELETE API Error:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}