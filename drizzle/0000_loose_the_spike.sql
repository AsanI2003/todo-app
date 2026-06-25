CREATE TABLE "todos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task" text NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"date_string" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
