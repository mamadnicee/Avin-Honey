CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer,
	"sku" text NOT NULL,
	"product_name" text NOT NULL,
	"variant_label" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" integer NOT NULL,
	"total_price" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_number" text NOT NULL,
	"customer_name" text NOT NULL,
	"phone" text NOT NULL,
	"province" text NOT NULL,
	"city" text NOT NULL,
	"address" text NOT NULL,
	"postal_code" text NOT NULL,
	"customer_note" text DEFAULT '' NOT NULL,
	"subtotal" integer NOT NULL,
	"shipping" integer NOT NULL,
	"total" integer NOT NULL,
	"status" text DEFAULT 'pending_payment' NOT NULL,
	"payment_status" text DEFAULT 'unpaid' NOT NULL,
	"payment_provider" text DEFAULT 'not_configured' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"sku" text NOT NULL,
	"label" text NOT NULL,
	"weight" text NOT NULL,
	"price" integer NOT NULL,
	"compare_at_price" integer,
	"stock" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_variants_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"subtitle" text NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"image" text NOT NULL,
	"origin" text NOT NULL,
	"harvest_season" text NOT NULL,
	"badge" text,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;