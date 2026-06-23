import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Todo from "@/models/Todo";

//Update status
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Explicitly type params as a Promise
) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Await the promise to extract the actual string ID
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    const updatedTodo = await Todo.findByIdAndUpdate(
      id,
      { completed: body.completed },
      { returnDocument: 'after' } // Clears out that Mongoose deprecation warning from your terminal log
    );

    if (!updatedTodo) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(updatedTodo, { status: 200 });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}

// DELETE task 
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Explicitly type params as a Promise
) {
  try {
    await connectDB();
    
    // Await the promise to extract the actual string ID
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    const deletedTodo = await Todo.findByIdAndDelete(id);

    if (!deletedTodo) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Task deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}