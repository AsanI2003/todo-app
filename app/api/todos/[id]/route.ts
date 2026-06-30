import { NextResponse } from "next/server";
import { db } from "@/db";
import { todos } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Change status
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await request.json();
    const resolvedParams = await params;
    const targetId = resolvedParams.id;

   
    const [updatedTodo] = await db
      .update(todos)
      .set({ completed: body.completed })
      .where(
        and(
           eq(todos.id, targetId),
            eq(todos.userId, session.user.id)
        )
      )
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

      const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const resolvedParams = await params;
    const targetId = resolvedParams.id;

    const [deletedTodo] = await db
      .delete(todos)
      .where(
        and(
          eq(todos.id, targetId),
          eq(todos.userId, session.user.id)
        )
      )
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