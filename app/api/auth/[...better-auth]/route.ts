import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Expose standard HTTP verbs to let Next.js handle incoming auth requests
export const { GET, POST } = toNextJsHandler(auth);