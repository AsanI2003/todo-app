import mongoose, { Schema, model, models } from "mongoose";

// TypeScript interface for  database 
export interface ITodo {
  _id: string;
  task: string;
  completed: boolean;
  dateString: string; // format "YYYY-MM-DD" or "YYYY/M/D" 
}

const TodoSchema = new Schema<ITodo>(
  {
    task: { type: String, required: true },
    completed: { type: Boolean, default: false },
    dateString: { type: String, required: true }, // use to map current date
  },
  { timestamps: true } // Automatically records createdAt and updatedAt
);

// In serverless, we check if the model is already compiled to avoid re-compilation errors
const Todo = models.Todo || model<ITodo>("Todo", TodoSchema);

export default Todo;