CREATE TYPE "public"."chat_message_status" AS ENUM('unread', 'read', 'resolved', 'in_progress');--> statement-breakpoint
CREATE TYPE "public"."chat_message_type" AS ENUM('message', 'feature_request', 'bug_report', 'question', 'feedback');--> statement-breakpoint
CREATE TYPE "public"."feedback_status" AS ENUM('new', 'read', 'in_progress', 'resolved', 'closed', 'gelesen', 'diskutiert', 'umgesetzt');--> statement-breakpoint
CREATE TYPE "public"."feedback_type" AS ENUM('bug', 'feature', 'improvement', 'general', 'error', 'kritik', 'verbesserung');--> statement-breakpoint
CREATE TYPE "public"."iso_standard_type" AS ENUM('ISO', 'IEC', 'ASTM', 'EN', 'AAMI', 'EU_Regulation');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('active', 'inactive', 'pending', 'archived');--> statement-breakpoint
CREATE TYPE "public"."summary_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."update_type" AS ENUM('regulation', 'guidance', 'standard', 'approval', 'alert', 'fda_drug', 'fda_device', 'fda_adverse', 'pubmed', 'clinical_trial');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('tenant_admin', 'tenant_user', 'super_admin');--> statement-breakpoint
CREATE TABLE "ai_summaries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar,
	"source_id" varchar NOT NULL,
	"source_type" varchar NOT NULL,
	"summary_type" varchar NOT NULL,
	"title" varchar NOT NULL,
	"key_points" text[],
	"impact_assessment" text,
	"action_items" text[],
	"risk_level" varchar NOT NULL,
	"confidence" integer DEFAULT 85,
	"word_count" integer DEFAULT 0,
	"reading_time" integer DEFAULT 0,
	"status" "summary_status" DEFAULT 'pending',
	"ai_model" varchar DEFAULT 'gpt-5',
	"processing_time" integer,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "approvals" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_type" varchar NOT NULL,
	"item_id" varchar NOT NULL,
	"status" varchar DEFAULT 'pending',
	"requested_by" varchar,
	"reviewed_by" varchar,
	"requested_at" timestamp DEFAULT now(),
	"reviewed_at" timestamp,
	"comments" text,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "chat_conversations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"subject" varchar NOT NULL,
	"status" varchar DEFAULT 'open',
	"priority" varchar DEFAULT 'normal',
	"last_message_at" timestamp DEFAULT now(),
	"message_count" integer DEFAULT 0,
	"participant_ids" text[],
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"sender_id" varchar,
	"sender_type" varchar NOT NULL,
	"sender_name" varchar NOT NULL,
	"sender_email" varchar NOT NULL,
	"message_type" "chat_message_type" DEFAULT 'message',
	"subject" varchar,
	"message" text NOT NULL,
	"status" "chat_message_status" DEFAULT 'unread',
	"priority" varchar DEFAULT 'normal',
	"attachments" jsonb,
	"metadata" jsonb,
	"read_at" timestamp,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "clinical_trials" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar,
	"nct_id" varchar NOT NULL,
	"title" text NOT NULL,
	"brief_summary" text,
	"detailed_description" text,
	"study_type" varchar,
	"study_phase" varchar,
	"study_status" varchar,
	"conditions" text[],
	"interventions" jsonb,
	"primary_outcomes" jsonb,
	"secondary_outcomes" jsonb,
	"eligibility_criteria" text,
	"enrollment_count" integer,
	"sponsor" varchar,
	"collaborators" text[],
	"locations" jsonb,
	"start_date" timestamp,
	"completion_date" timestamp,
	"last_update_date" timestamp,
	"results_available" boolean DEFAULT false,
	"fda_regulated" boolean DEFAULT false,
	"device_product" boolean DEFAULT false,
	"raw_data" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "clinical_trials_nct_id_unique" UNIQUE("nct_id")
);
--> statement-breakpoint
CREATE TABLE "data_sources" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"url" varchar,
	"api_endpoint" varchar,
	"country" varchar,
	"region" varchar,
	"type" varchar NOT NULL,
	"category" varchar,
	"language" varchar DEFAULT 'en',
	"is_active" boolean DEFAULT true,
	"is_historical" boolean DEFAULT false,
	"last_sync" timestamp,
	"sync_frequency" varchar DEFAULT 'daily',
	"auth_required" boolean DEFAULT false,
	"api_key" varchar,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fda_adverse_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar,
	"safety_report_id" varchar NOT NULL,
	"receipt_date" timestamp,
	"transmission_date" timestamp,
	"patient_age" varchar,
	"patient_sex" varchar,
	"patient_weight" varchar,
	"drugs" jsonb,
	"reactions" jsonb,
	"outcomes" text[],
	"seriousness" varchar,
	"report_type" varchar,
	"qualification" varchar,
	"country" varchar,
	"raw_data" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fda_device_recalls" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar,
	"recall_number" varchar NOT NULL,
	"device_name" varchar,
	"manufacturer" varchar,
	"device_class" varchar,
	"product_code" varchar,
	"recall_reason" text,
	"distribution_pattern" text,
	"k_number" varchar,
	"pma_number" varchar,
	"recall_initiation_date" timestamp,
	"report_date" timestamp,
	"termination_date" timestamp,
	"recall_status" varchar,
	"recall_classification" varchar,
	"raw_data" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fda_drug_labels" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar,
	"application_number" varchar NOT NULL,
	"brand_name" varchar,
	"generic_name" varchar,
	"manufacturer_name" varchar,
	"product_type" varchar,
	"route_of_administration" text[],
	"active_ingredients" jsonb,
	"indications_and_usage" text,
	"dosage_and_administration" text,
	"contraindications" text,
	"warnings" text,
	"adverse_reactions" text,
	"drug_interactions" text,
	"pregnancy_category" varchar,
	"ndc" text[],
	"labeling_revision_date" timestamp,
	"fda_approval_date" timestamp,
	"raw_data" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar,
	"user_id" varchar,
	"page" varchar NOT NULL,
	"type" "feedback_type" DEFAULT 'general',
	"title" varchar NOT NULL,
	"message" text NOT NULL,
	"user_email" varchar,
	"user_name" varchar,
	"browser_info" jsonb,
	"status" "feedback_status" DEFAULT 'new',
	"priority" varchar DEFAULT 'medium',
	"assigned_to" varchar,
	"resolution" text,
	"resolved_at" timestamp,
	"email_sent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "iso_standards" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar,
	"code" varchar NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"full_content" text,
	"category" "iso_standard_type" NOT NULL,
	"year" varchar,
	"url" varchar NOT NULL,
	"scraped_at" timestamp,
	"last_updated" timestamp,
	"status" "status" DEFAULT 'active',
	"version" varchar,
	"stage" varchar,
	"technical_committee" varchar,
	"ics" varchar,
	"pages" integer,
	"price" varchar,
	"relevance_score" integer DEFAULT 0,
	"tags" text[],
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "knowledge_articles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"content" text NOT NULL,
	"summary" text,
	"category" varchar,
	"tags" text[],
	"author" varchar,
	"status" "status" DEFAULT 'active',
	"is_published" boolean DEFAULT false,
	"published_at" timestamp,
	"last_reviewed" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "legal_cases" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" varchar,
	"case_number" text,
	"title" text NOT NULL,
	"court" text NOT NULL,
	"jurisdiction" text NOT NULL,
	"decision_date" timestamp,
	"summary" text,
	"content" text,
	"verdict" text,
	"damages" text,
	"document_url" text,
	"impact_level" text,
	"keywords" text[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "newsletters" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject" varchar NOT NULL,
	"content" text NOT NULL,
	"html_content" text,
	"scheduled_at" timestamp,
	"sent_at" timestamp,
	"status" varchar DEFAULT 'draft',
	"recipient_count" integer DEFAULT 0,
	"open_count" integer DEFAULT 0,
	"click_count" integer DEFAULT 0,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pubmed_articles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar,
	"pmid" varchar NOT NULL,
	"title" text NOT NULL,
	"abstract" text,
	"authors" jsonb,
	"journal" varchar,
	"published_date" timestamp,
	"doi" varchar,
	"pmc_id" varchar,
	"keywords" text[],
	"mesh_terms" text[],
	"publication_types" text[],
	"affiliations" text[],
	"grants_list" jsonb,
	"citation_count" integer DEFAULT 0,
	"relevance_score" integer DEFAULT 0,
	"regulatory_relevance" varchar,
	"raw_data" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "pubmed_articles_pmid_unique" UNIQUE("pmid")
);
--> statement-breakpoint
CREATE TABLE "regulatory_updates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar,
	"source_id" varchar,
	"title" text NOT NULL,
	"description" text,
	"content" text,
	"type" "update_type" DEFAULT 'regulation',
	"category" varchar,
	"device_type" varchar,
	"risk_level" varchar,
	"therapeutic_area" varchar,
	"document_url" varchar,
	"document_id" varchar,
	"published_date" timestamp,
	"effective_date" timestamp,
	"jurisdiction" varchar,
	"language" varchar DEFAULT 'en',
	"tags" text[],
	"priority" integer DEFAULT 1,
	"is_processed" boolean DEFAULT false,
	"processing_notes" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscribers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"name" varchar,
	"organization" varchar,
	"interests" text[],
	"is_active" boolean DEFAULT true,
	"subscribed_at" timestamp DEFAULT now(),
	"unsubscribed_at" timestamp,
	"metadata" jsonb,
	CONSTRAINT "subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "tenant_dashboards" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(500),
	"layout_config" jsonb DEFAULT '{}',
	"widgets" jsonb DEFAULT '[]',
	"is_default" boolean DEFAULT false,
	"is_shared" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tenant_data_access" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"data_source_id" varchar,
	"allowed_regions" jsonb DEFAULT '["US", "EU"]',
	"monthly_limit" integer DEFAULT 500,
	"current_usage" integer DEFAULT 0,
	"last_reset_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tenant_invitations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" varchar(50) NOT NULL,
	"invited_by" varchar NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"accepted_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "tenant_invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "tenant_users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"role" varchar(50) DEFAULT 'viewer' NOT NULL,
	"permissions" jsonb DEFAULT '[]',
	"dashboard_config" jsonb DEFAULT '{}',
	"is_active" boolean DEFAULT true,
	"invited_at" timestamp DEFAULT now(),
	"joined_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"subdomain" varchar NOT NULL,
	"custom_domain" varchar,
	"logo" varchar,
	"color_scheme" varchar DEFAULT 'blue',
	"settings" jsonb,
	"subscription_tier" varchar DEFAULT 'standard',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "tenants_subdomain_unique" UNIQUE("subdomain")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar,
	"email" varchar NOT NULL,
	"name" varchar,
	"role" "user_role" DEFAULT 'tenant_user',
	"password_hash" varchar,
	"is_active" boolean DEFAULT true,
	"last_login" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "website_analytics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar,
	"user_id" varchar,
	"session_id" varchar,
	"page" varchar NOT NULL,
	"user_agent" text,
	"ip_address" varchar,
	"country" varchar,
	"city" varchar,
	"device" varchar,
	"browser" varchar,
	"os" varchar,
	"referrer" text,
	"utm_source" varchar,
	"utm_medium" varchar,
	"utm_campaign" varchar,
	"time_on_page" integer,
	"exit_page" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "ai_summaries" ADD CONSTRAINT "ai_summaries_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_conversations" ADD CONSTRAINT "chat_conversations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical_trials" ADD CONSTRAINT "clinical_trials_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fda_adverse_events" ADD CONSTRAINT "fda_adverse_events_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fda_device_recalls" ADD CONSTRAINT "fda_device_recalls_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fda_drug_labels" ADD CONSTRAINT "fda_drug_labels_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iso_standards" ADD CONSTRAINT "iso_standards_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legal_cases" ADD CONSTRAINT "legal_cases_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pubmed_articles" ADD CONSTRAINT "pubmed_articles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "regulatory_updates" ADD CONSTRAINT "regulatory_updates_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "regulatory_updates" ADD CONSTRAINT "regulatory_updates_source_id_data_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."data_sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_dashboards" ADD CONSTRAINT "tenant_dashboards_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_dashboards" ADD CONSTRAINT "tenant_dashboards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_data_access" ADD CONSTRAINT "tenant_data_access_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_invitations" ADD CONSTRAINT "tenant_invitations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_invitations" ADD CONSTRAINT "tenant_invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_users" ADD CONSTRAINT "tenant_users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_users" ADD CONSTRAINT "tenant_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "website_analytics" ADD CONSTRAINT "website_analytics_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "website_analytics" ADD CONSTRAINT "website_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_ai_summaries_tenant" ON "ai_summaries" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_ai_summaries_source" ON "ai_summaries" USING btree ("source_id","source_type");--> statement-breakpoint
CREATE INDEX "idx_ai_summaries_type" ON "ai_summaries" USING btree ("summary_type");--> statement-breakpoint
CREATE INDEX "idx_ai_summaries_status" ON "ai_summaries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_approvals_status" ON "approvals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_approvals_type" ON "approvals" USING btree ("item_type");--> statement-breakpoint
CREATE INDEX "idx_approvals_requested" ON "approvals" USING btree ("requested_at");--> statement-breakpoint
CREATE INDEX "idx_chat_conversations_tenant" ON "chat_conversations" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_chat_conversations_status" ON "chat_conversations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_chat_conversations_last_message" ON "chat_conversations" USING btree ("last_message_at");--> statement-breakpoint
CREATE INDEX "idx_chat_messages_tenant" ON "chat_messages" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_chat_messages_status" ON "chat_messages" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_chat_messages_type" ON "chat_messages" USING btree ("message_type");--> statement-breakpoint
CREATE INDEX "idx_chat_messages_created" ON "chat_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_clinical_trials_tenant" ON "clinical_trials" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_clinical_trials_nct_id" ON "clinical_trials" USING btree ("nct_id");--> statement-breakpoint
CREATE INDEX "idx_clinical_trials_status" ON "clinical_trials" USING btree ("study_status");--> statement-breakpoint
CREATE INDEX "idx_clinical_trials_sponsor" ON "clinical_trials" USING btree ("sponsor");--> statement-breakpoint
CREATE INDEX "idx_data_sources_country" ON "data_sources" USING btree ("country");--> statement-breakpoint
CREATE INDEX "idx_data_sources_type" ON "data_sources" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_data_sources_active" ON "data_sources" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_fda_adverse_events_tenant" ON "fda_adverse_events" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_fda_adverse_events_report_id" ON "fda_adverse_events" USING btree ("safety_report_id");--> statement-breakpoint
CREATE INDEX "idx_fda_adverse_events_receipt_date" ON "fda_adverse_events" USING btree ("receipt_date");--> statement-breakpoint
CREATE INDEX "idx_fda_device_recalls_tenant" ON "fda_device_recalls" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_fda_device_recalls_number" ON "fda_device_recalls" USING btree ("recall_number");--> statement-breakpoint
CREATE INDEX "idx_fda_device_recalls_manufacturer" ON "fda_device_recalls" USING btree ("manufacturer");--> statement-breakpoint
CREATE INDEX "idx_fda_device_recalls_class" ON "fda_device_recalls" USING btree ("device_class");--> statement-breakpoint
CREATE INDEX "idx_fda_drug_labels_tenant" ON "fda_drug_labels" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_fda_drug_labels_application" ON "fda_drug_labels" USING btree ("application_number");--> statement-breakpoint
CREATE INDEX "idx_fda_drug_labels_brand" ON "fda_drug_labels" USING btree ("brand_name");--> statement-breakpoint
CREATE INDEX "idx_fda_drug_labels_generic" ON "fda_drug_labels" USING btree ("generic_name");--> statement-breakpoint
CREATE INDEX "idx_feedback_tenant" ON "feedback" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_feedback_status" ON "feedback" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_feedback_type" ON "feedback" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_feedback_page" ON "feedback" USING btree ("page");--> statement-breakpoint
CREATE INDEX "idx_feedback_created" ON "feedback" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_iso_standards_tenant" ON "iso_standards" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_iso_standards_category" ON "iso_standards" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_iso_standards_code" ON "iso_standards" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_iso_standards_status" ON "iso_standards" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_knowledge_articles_category" ON "knowledge_articles" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_knowledge_articles_status" ON "knowledge_articles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_knowledge_articles_published" ON "knowledge_articles" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "idx_legal_cases_tenant" ON "legal_cases" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_legal_cases_jurisdiction" ON "legal_cases" USING btree ("jurisdiction");--> statement-breakpoint
CREATE INDEX "idx_legal_cases_court" ON "legal_cases" USING btree ("court");--> statement-breakpoint
CREATE INDEX "idx_legal_cases_decision" ON "legal_cases" USING btree ("decision_date");--> statement-breakpoint
CREATE INDEX "idx_newsletters_status" ON "newsletters" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_newsletters_scheduled" ON "newsletters" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "idx_pubmed_articles_tenant" ON "pubmed_articles" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_pubmed_articles_pmid" ON "pubmed_articles" USING btree ("pmid");--> statement-breakpoint
CREATE INDEX "idx_pubmed_articles_journal" ON "pubmed_articles" USING btree ("journal");--> statement-breakpoint
CREATE INDEX "idx_pubmed_articles_published" ON "pubmed_articles" USING btree ("published_date");--> statement-breakpoint
CREATE INDEX "idx_regulatory_updates_tenant" ON "regulatory_updates" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_regulatory_updates_source" ON "regulatory_updates" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX "idx_regulatory_updates_type" ON "regulatory_updates" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_regulatory_updates_published" ON "regulatory_updates" USING btree ("published_date");--> statement-breakpoint
CREATE INDEX "idx_regulatory_updates_priority" ON "regulatory_updates" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "idx_sessions_expire" ON "sessions" USING btree ("expire");--> statement-breakpoint
CREATE INDEX "idx_subscribers_email" ON "subscribers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_subscribers_active" ON "subscribers" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_tenants_subdomain" ON "tenants" USING btree ("subdomain");--> statement-breakpoint
CREATE INDEX "idx_tenants_active" ON "tenants" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_users_email_tenant" ON "users" USING btree ("email","tenant_id");--> statement-breakpoint
CREATE INDEX "idx_users_tenant" ON "users" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_analytics_tenant" ON "website_analytics" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_analytics_page" ON "website_analytics" USING btree ("page");--> statement-breakpoint
CREATE INDEX "idx_analytics_session" ON "website_analytics" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_analytics_created" ON "website_analytics" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_analytics_ip" ON "website_analytics" USING btree ("ip_address");