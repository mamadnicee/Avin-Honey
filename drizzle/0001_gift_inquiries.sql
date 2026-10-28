CREATE TABLE "gift_inquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"reference" text NOT NULL,
	"customer_name" text NOT NULL,
	"phone" text NOT NULL,
	"occasion" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gift_inquiries_reference_unique" UNIQUE("reference")
);
