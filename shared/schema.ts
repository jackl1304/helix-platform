import { sql, relations } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  timestamp, 
  integer, 
  boolean, 
  jsonb,
  real,
  pgEnum,
  index,
  unique
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums for Helix Regulatory Intelligence system
export const statusEnum = pgEnum("status", ["active", "inactive", "pending", "archived"]);
export const updateTypeEnum = pgEnum("update_type", ["regulation", "guidance", "standard", "approval", "alert", "fda_drug", "fda_device", "fda_adverse", "pubmed", "clinical_trial"]);
export const chatMessageTypeEnum = pgEnum("chat_message_type", ["message", "feature_request", "bug_report", "question", "feedback"]);
export const chatMessageStatusEnum = pgEnum("chat_message_status", ["unread", "read", "resolved", "in_progress"]);
export const isoStandardTypeEnum = pgEnum("iso_standard_type", ["ISO", "IEC", "ASTM", "EN", "AAMI", "EU_Regulation"]);
export const summaryStatusEnum = pgEnum("summary_status", ["pending", "processing", "completed", "failed"]);
export const feedbackTypeEnum = pgEnum("feedback_type", ["bug", "feature", "improvement", "general", "error", "kritik", "verbesserung"]);
export const feedbackStatusEnum = pgEnum("feedback_status", ["new", "read", "in_progress", "resolved", "closed", "gelesen", "diskutiert", "umgesetzt"]);

// Tenants table for multi-tenant isolation
export const tenants = pgTable("tenants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  subdomain: varchar("subdomain").unique().notNull(),
  customDomain: varchar("custom_domain"),
  logo: varchar("logo"),
  colorScheme: varchar("color_scheme").default("blue"), // blue, purple, green
  settings: jsonb("settings"),
  subscriptionTier: varchar("subscription_tier").default("standard"), // standard, premium, enterprise
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_tenants_subdomain").on(table.subdomain),
  index("idx_tenants_active").on(table.isActive),
]);

// User roles enum with strict tenant isolation
export const userRoleEnum = pgEnum("user_role", ["tenant_admin", "tenant_user", "super_admin"]);

// Users table for authentication and management with tenant isolation
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  email: varchar("email").notNull(),
  name: varchar("name"),
  role: userRoleEnum("role").default("tenant_user"),
  passwordHash: varchar("password_hash"),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_users_email_tenant").on(table.email, table.tenantId),
  index("idx_users_tenant").on(table.tenantId),
]);

// Sessions table for authentication
export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire", { mode: "date" }).notNull(),
}, (table) => [
  index("idx_sessions_expire").on(table.expire),
]);

// Comprehensive data sources table for 70+ regulatory intelligence sources
export const dataSources = pgTable("data_sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  url: varchar("url"),
  apiEndpoint: varchar("api_endpoint"),
  country: varchar("country"),
  region: varchar("region"),
  type: varchar("type").notNull(), // "official_api", "web_scraping", "rss_feed"
  category: varchar("category"), // "regulatory", "standards", "clinical", "safety"
  language: varchar("language").default("en"),
  priority: varchar("priority").default("medium"), // high, medium, low
  dataFormat: varchar("data_format").default("json"), // json, xml, html, pdf
  isActive: boolean("is_active").default(true),
  isHistorical: boolean("is_historical").default(false),
  lastSync: timestamp("last_sync"),
  lastSuccessfulSync: timestamp("last_successful_sync"),
  syncFrequency: varchar("sync_frequency").default("daily"),
  retryCount: integer("retry_count").default(0),
  maxRetries: integer("max_retries").default(3),
  authRequired: boolean("auth_required").default(false),
  apiKey: varchar("api_key"),
  rateLimitPerHour: integer("rate_limit_per_hour").default(100),
  timeoutSeconds: integer("timeout_seconds").default(30),
  endpointsConfig: jsonb("endpoints_config"), // Multiple API endpoints per source
  scrapingConfig: jsonb("scraping_config"), // Selectors, pagination rules
  dataMapping: jsonb("data_mapping"), // Field transformations
  validationRules: jsonb("validation_rules"), // Data quality checks
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_data_sources_country").on(table.country),
  index("idx_data_sources_type").on(table.type),
  index("idx_data_sources_active").on(table.isActive),
  index("idx_data_sources_priority").on(table.priority),
  index("idx_data_sources_last_sync").on(table.lastSync),
]);

// Regulatory updates table with tenant isolation - ENHANCED for real regulatory data
export const regulatoryUpdates = pgTable("regulatory_updates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  sourceId: varchar("source_id").references(() => dataSources.id),
  
  // Core identification
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  type: updateTypeEnum("type").default("regulation"),
  category: varchar("category"),
  
  // Device/Product specific information
  deviceType: varchar("device_type"),
  deviceClass: varchar("device_class"), // Class I, II, III, etc.
  productCode: varchar("product_code"), // FDA product code
  deviceName: text("device_name"), // Actual device name
  manufacturer: text("manufacturer"), // Company name
  applicantName: text("applicant_name"), // Applicant/Sponsor name
  
  // Regulatory classification
  riskLevel: varchar("risk_level"), // Low, Medium, High, Critical
  therapeuticArea: varchar("therapeutic_area"), // Cardiology, Neurology, etc.
  medicalSpecialty: varchar("medical_specialty"), // Specific medical field
  indication: text("indication"), // Intended use/indication
  
  // Regulatory process information
  submissionType: varchar("submission_type"), // 510(k), PMA, De Novo, etc.
  decisionType: varchar("decision_type"), // Approved, Cleared, Rejected, etc.
  decisionDate: timestamp("decision_date"), // When decision was made
  reviewPanel: varchar("review_panel"), // FDA panel (e.g., Cardiovascular)
  
  // Document references
  documentUrl: varchar("document_url"),
  documentId: varchar("document_id"),
  fdaNumber: varchar("fda_number"), // 510(k) number, PMA number, etc.
  ceMarkNumber: varchar("ce_mark_number"), // CE mark number for EU
  registrationNumber: varchar("registration_number"), // Country-specific registration
  
  // Dates and timeline
  publishedDate: timestamp("published_date"),
  effectiveDate: timestamp("effective_date"),
  submissionDate: timestamp("submission_date"), // When submitted
  reviewStartDate: timestamp("review_start_date"), // Review period start
  
  // Geographic and legal
  jurisdiction: varchar("jurisdiction"),
  region: varchar("region"), // US, EU, Canada, etc.
  authority: varchar("authority"), // FDA, EMA, Health Canada, etc.
  language: varchar("language").default("en"),
  
  // Classification and tags
  tags: text("tags").array(),
  keywords: text("keywords").array(),
  deviceCategories: text("device_categories").array(), // Multiple categories
  
  // Processing and quality
  priority: integer("priority").default(1),
  isProcessed: boolean("is_processed").default(false),
  processingNotes: text("processing_notes"),
  dataQuality: varchar("data_quality"), // High, Medium, Low
  confidenceScore: real("confidence_score"), // 0.00-1.00
  
  // Cross-references and relationships
  relatedUpdates: text("related_updates").array(), // IDs of related updates
  crossReferences: jsonb("cross_references"), // Links to other regulatory databases
  
  // Enhanced metadata
  metadata: jsonb("metadata"),
  rawData: jsonb("raw_data"), // Original scraped data for debugging
  extractedFields: jsonb("extracted_fields"), // AI-extracted structured data
  
  // Audit trail
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastValidated: timestamp("last_validated"), // Last data validation
}, (table) => [
  index("idx_regulatory_updates_tenant").on(table.tenantId),
  index("idx_regulatory_updates_source").on(table.sourceId),
  index("idx_regulatory_updates_type").on(table.type),
  index("idx_regulatory_updates_published").on(table.publishedDate),
  index("idx_regulatory_updates_priority").on(table.priority),
  index("idx_regulatory_updates_device_class").on(table.deviceClass),
  index("idx_regulatory_updates_manufacturer").on(table.manufacturer),
  index("idx_regulatory_updates_authority").on(table.authority),
  index("idx_regulatory_updates_decision_date").on(table.decisionDate),
  index("idx_regulatory_updates_fda_number").on(table.fdaNumber),
  index("idx_regulatory_updates_ce_mark").on(table.ceMarkNumber),
]);

// Legal cases table with tenant isolation
export const legalCases = pgTable("legal_cases", {
  id: text("id").primaryKey(),
  tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  caseNumber: text("case_number"),
  title: text("title").notNull(),
  court: text("court").notNull(),
  jurisdiction: text("jurisdiction").notNull(),
  decisionDate: timestamp("decision_date", { mode: "date" }),
  summary: text("summary"),
  content: text("content"),
  verdict: text("verdict"), // Urteilsspruch - Full court ruling/judgment text
  damages: text("damages"), // Schadensersatz - Compensation/damages awarded
  documentUrl: text("document_url"),
  impactLevel: text("impact_level"),
  keywords: text("keywords").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_legal_cases_tenant").on(table.tenantId),
  index("idx_legal_cases_jurisdiction").on(table.jurisdiction),
  index("idx_legal_cases_court").on(table.court),
  index("idx_legal_cases_decision").on(table.decisionDate),
]);

// Knowledge base articles
export const knowledgeArticles = pgTable("knowledge_articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  summary: text("summary"),
  category: varchar("category"),
  tags: text("tags").array(),
  author: varchar("author"),
  status: statusEnum("status").default("active"),
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  lastReviewed: timestamp("last_reviewed"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_knowledge_articles_category").on(table.category),
  index("idx_knowledge_articles_status").on(table.status),
  index("idx_knowledge_articles_published").on(table.publishedAt),
]);

// Newsletter system
export const newsletters = pgTable("newsletters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subject: varchar("subject").notNull(),
  content: text("content").notNull(),
  htmlContent: text("html_content"),
  scheduledAt: timestamp("scheduled_at"),
  sentAt: timestamp("sent_at"),
  status: varchar("status").default("draft"), // draft, scheduled, sent, failed
  recipientCount: integer("recipient_count").default(0),
  openCount: integer("open_count").default(0),
  clickCount: integer("click_count").default(0),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_newsletters_status").on(table.status),
  index("idx_newsletters_scheduled").on(table.scheduledAt),
]);

// Newsletter subscribers
export const subscribers = pgTable("subscribers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  name: varchar("name"),
  organization: varchar("organization"),
  interests: text("interests").array(),
  isActive: boolean("is_active").default(true),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
  unsubscribedAt: timestamp("unsubscribed_at"),
  metadata: jsonb("metadata"),
}, (table) => [
  index("idx_subscribers_email").on(table.email),
  index("idx_subscribers_active").on(table.isActive),
]);

// Approval workflow
export const approvals = pgTable("approvals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemType: varchar("item_type").notNull(), // "newsletter", "article", "update"
  itemId: varchar("item_id").notNull(),
  status: varchar("status").default("pending"), // pending, approved, rejected
  requestedBy: varchar("requested_by").references(() => users.id),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  requestedAt: timestamp("requested_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  comments: text("comments"),
  metadata: jsonb("metadata"),
}, (table) => [
  index("idx_approvals_status").on(table.status),
  index("idx_approvals_type").on(table.itemType),
  index("idx_approvals_requested").on(table.requestedAt),
]);

// Chat Board für Tenant-Administrator-Kommunikation (Testphase)
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  senderId: varchar("sender_id").references(() => users.id),
  senderType: varchar("sender_type").notNull(), // "tenant", "admin"
  senderName: varchar("sender_name").notNull(),
  senderEmail: varchar("sender_email").notNull(),
  messageType: chatMessageTypeEnum("message_type").default("message"),
  subject: varchar("subject"),
  message: text("message").notNull(),
  status: chatMessageStatusEnum("status").default("unread"),
  priority: varchar("priority").default("normal"), // low, normal, high, urgent
  attachments: jsonb("attachments"), // URLs zu Anhängen
  metadata: jsonb("metadata"),
  readAt: timestamp("read_at"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_chat_messages_tenant").on(table.tenantId),
  index("idx_chat_messages_status").on(table.status),
  index("idx_chat_messages_type").on(table.messageType),
  index("idx_chat_messages_created").on(table.createdAt),
]);

// Chat Conversations für Thread-basierte Kommunikation
export const chatConversations = pgTable("chat_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  subject: varchar("subject").notNull(),
  status: varchar("status").default("open"), // open, closed, resolved
  priority: varchar("priority").default("normal"),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  messageCount: integer("message_count").default(0),
  participantIds: text("participant_ids").array(), // User IDs beteiligt
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_chat_conversations_tenant").on(table.tenantId),
  index("idx_chat_conversations_status").on(table.status),
  index("idx_chat_conversations_last_message").on(table.lastMessageAt),
]);

// Relations
export const dataSourcesRelations = relations(dataSources, ({ many }) => ({
  regulatoryUpdates: many(regulatoryUpdates),
}));

export const regulatoryUpdatesRelations = relations(regulatoryUpdates, ({ one }) => ({
  dataSource: one(dataSources, {
    fields: [regulatoryUpdates.sourceId],
    references: [dataSources.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  approvalsRequested: many(approvals, { relationName: "requestedApprovals" }),
  approvalsReviewed: many(approvals, { relationName: "reviewedApprovals" }),
}));

export const approvalsRelations = relations(approvals, ({ one }) => ({
  requestedBy: one(users, {
    fields: [approvals.requestedBy],
    references: [users.id],
    relationName: "requestedApprovals",
  }),
  reviewedBy: one(users, {
    fields: [approvals.reviewedBy],
    references: [users.id],
    relationName: "reviewedApprovals",
  }),
}));

// Chat relations
export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  tenant: one(tenants, {
    fields: [chatMessages.tenantId],
    references: [tenants.id],
  }),
  sender: one(users, {
    fields: [chatMessages.senderId],
    references: [users.id],
  }),
}));

export const chatConversationsRelations = relations(chatConversations, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [chatConversations.tenantId],
    references: [tenants.id],
  }),
  messages: many(chatMessages),
}));

// Removed duplicate tenantsRelations - already defined above

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Create tenant insert and select schemas
export const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type SelectTenant = typeof tenants.$inferSelect;

export const tenantUsers = pgTable("tenant_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  role: varchar("role", { 
    length: 50 
  }).$type<'admin' | 'compliance_officer' | 'analyst' | 'viewer'>().notNull().default('viewer'),
  permissions: jsonb("permissions").default(sql`'[]'`),
  dashboardConfig: jsonb("dashboard_config").default(sql`'{}'`),
  isActive: boolean("is_active").default(true),
  invitedAt: timestamp("invited_at").defaultNow(),
  joinedAt: timestamp("joined_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tenantDataAccess = pgTable("tenant_data_access", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  dataSourceId: varchar("data_source_id"),
  allowedRegions: jsonb("allowed_regions").default(sql`'["US", "EU"]'`),
  monthlyLimit: integer("monthly_limit").default(500),
  currentUsage: integer("current_usage").default(0),
  lastResetAt: timestamp("last_reset_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tenantDashboards = pgTable("tenant_dashboards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 500 }),
  layoutConfig: jsonb("layout_config").default(sql`'{}'`),
  widgets: jsonb("widgets").default(sql`'[]'`),
  isDefault: boolean("is_default").default(false),
  isShared: boolean("is_shared").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tenantInvitations = pgTable("tenant_invitations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  role: varchar("role", { 
    length: 50 
  }).$type<'admin' | 'compliance_officer' | 'analyst' | 'viewer'>().notNull(),
  invitedBy: varchar("invited_by").references(() => users.id).notNull(),
  token: varchar("token", { length: 255 }).unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations for Multi-Tenant Schema
export const tenantsRelations = relations(tenants, ({ many }) => ({
  tenantUsers: many(tenantUsers),
  dataAccess: many(tenantDataAccess),
  dashboards: many(tenantDashboards),
  invitations: many(tenantInvitations),
  users: many(users),
  chatMessages: many(chatMessages),
  chatConversations: many(chatConversations),
}));

export const tenantUsersRelations = relations(tenantUsers, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantUsers.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [tenantUsers.userId],
    references: [users.id],
  }),
}));

export const tenantDashboardsRelations = relations(tenantDashboards, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantDashboards.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [tenantDashboards.userId],
    references: [users.id],
  }),
}));

// Types for Multi-Tenant
export type Tenant = typeof tenants.$inferSelect;
export type TenantUser = typeof tenantUsers.$inferSelect;
export type InsertTenantUser = typeof tenantUsers.$inferInsert;
export type TenantDashboard = typeof tenantDashboards.$inferSelect;
export type InsertTenantDashboard = typeof tenantDashboards.$inferInsert;
export type TenantInvitation = typeof tenantInvitations.$inferSelect;
export type InsertTenantInvitation = typeof tenantInvitations.$inferInsert;

export const insertDataSourceSchema = createInsertSchema(dataSources).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertDataSource = z.infer<typeof insertDataSourceSchema>;
export type DataSource = typeof dataSources.$inferSelect;

// Comprehensive sync results tracking for all 70+ sources
export const syncResults = pgTable("sync_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dataSourceId: varchar("data_source_id").references(() => dataSources.id, { onDelete: "cascade" }).notNull(),
  syncType: varchar("sync_type").default("scheduled"), // startup, scheduled, manual
  status: varchar("status").notNull(), // success, partial, failed, timeout
  recordsProcessed: integer("records_processed").default(0),
  recordsAdded: integer("records_added").default(0),
  recordsUpdated: integer("records_updated").default(0),
  recordsSkipped: integer("records_skipped").default(0),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  duration: integer("duration_ms"), // milliseconds
  errorMessage: text("error_message"),
  warningMessages: text("warning_messages").array(),
  syncSummary: jsonb("sync_summary"),
  metadata: jsonb("metadata"),
}, (table) => [
  index("idx_sync_results_source").on(table.dataSourceId),
  index("idx_sync_results_status").on(table.status),
  index("idx_sync_results_started").on(table.startedAt),
  index("idx_sync_results_type").on(table.syncType),
]);

export type SyncResult = typeof syncResults.$inferSelect;
export type InsertSyncResult = typeof syncResults.$inferInsert;

export const insertRegulatoryUpdateSchema = createInsertSchema(regulatoryUpdates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertRegulatoryUpdate = z.infer<typeof insertRegulatoryUpdateSchema>;
export type RegulatoryUpdate = typeof regulatoryUpdates.$inferSelect;

export const insertLegalCaseSchema = createInsertSchema(legalCases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertLegalCase = z.infer<typeof insertLegalCaseSchema>;
export type LegalCase = typeof legalCases.$inferSelect;

export const insertKnowledgeArticleSchema = createInsertSchema(knowledgeArticles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertKnowledgeArticle = z.infer<typeof insertKnowledgeArticleSchema>;
export type KnowledgeArticle = typeof knowledgeArticles.$inferSelect;

export const insertNewsletterSchema = createInsertSchema(newsletters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertNewsletter = z.infer<typeof insertNewsletterSchema>;
export type Newsletter = typeof newsletters.$inferSelect;

export const insertSubscriberSchema = createInsertSchema(subscribers).omit({
  id: true,
});
export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;
export type Subscriber = typeof subscribers.$inferSelect;

export const insertApprovalSchema = createInsertSchema(approvals).omit({
  id: true,
});
export type InsertApproval = z.infer<typeof insertApprovalSchema>;
export type Approval = typeof approvals.$inferSelect;

// Chat message schemas
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

// Chat conversation schemas
export const insertChatConversationSchema = createInsertSchema(chatConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertChatConversation = z.infer<typeof insertChatConversationSchema>;
export type ChatConversation = typeof chatConversations.$inferSelect;

// FDA Drug Labels table for OpenFDA integration
export const fdaDrugLabels = pgTable("fda_drug_labels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  applicationNumber: varchar("application_number").notNull(),
  brandName: varchar("brand_name"),
  genericName: varchar("generic_name"),
  manufacturerName: varchar("manufacturer_name"),
  productType: varchar("product_type"),
  routeOfAdministration: text("route_of_administration").array(),
  activeIngredients: jsonb("active_ingredients"),
  indicationsAndUsage: text("indications_and_usage"),
  dosageAndAdministration: text("dosage_and_administration"),
  contraindications: text("contraindications"),
  warnings: text("warnings"),
  adverseReactions: text("adverse_reactions"),
  drugInteractions: text("drug_interactions"),
  pregnancyCategory: varchar("pregnancy_category"),
  ndc: text("ndc").array(), // National Drug Code
  labelingRevisionDate: timestamp("labeling_revision_date"),
  fdaApprovalDate: timestamp("fda_approval_date"),
  rawData: jsonb("raw_data"), // Full OpenFDA response
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_fda_drug_labels_tenant").on(table.tenantId),
  index("idx_fda_drug_labels_application").on(table.applicationNumber),
  index("idx_fda_drug_labels_brand").on(table.brandName),
  index("idx_fda_drug_labels_generic").on(table.genericName),
  // Unique constraint for application number per tenant
  unique("unique_fda_drug_labels_app_tenant").on(table.applicationNumber, table.tenantId),
]);

// FDA Adverse Events table
export const fdaAdverseEvents = pgTable("fda_adverse_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  safetyReportId: varchar("safety_report_id").notNull(),
  receiptDate: timestamp("receipt_date"),
  transmissionDate: timestamp("transmission_date"),
  patientAge: varchar("patient_age"),
  patientSex: varchar("patient_sex"),
  patientWeight: varchar("patient_weight"),
  drugs: jsonb("drugs"), // Array of drug information
  reactions: jsonb("reactions"), // Array of adverse reactions
  outcomes: text("outcomes").array(),
  seriousness: varchar("seriousness"),
  reportType: varchar("report_type"),
  qualification: varchar("qualification"),
  country: varchar("country"),
  rawData: jsonb("raw_data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_fda_adverse_events_tenant").on(table.tenantId),
  index("idx_fda_adverse_events_report_id").on(table.safetyReportId),
  index("idx_fda_adverse_events_receipt_date").on(table.receiptDate),
  // Unique constraint for safety report ID per tenant
  unique("unique_fda_adverse_events_report_tenant").on(table.safetyReportId, table.tenantId),
]);

// FDA Device Recalls table
export const fdaDeviceRecalls = pgTable("fda_device_recalls", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  recallNumber: varchar("recall_number").notNull(),
  deviceName: varchar("device_name"),
  manufacturer: varchar("manufacturer"),
  deviceClass: varchar("device_class"),
  productCode: varchar("product_code"),
  recallReason: text("recall_reason"),
  distributionPattern: text("distribution_pattern"),
  kNumber: varchar("k_number"),
  pmaNumber: varchar("pma_number"),
  recallInitiationDate: timestamp("recall_initiation_date"),
  reportDate: timestamp("report_date"),
  terminationDate: timestamp("termination_date"),
  recallStatus: varchar("recall_status"),
  recallClassification: varchar("recall_classification"),
  rawData: jsonb("raw_data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_fda_device_recalls_tenant").on(table.tenantId),
  index("idx_fda_device_recalls_number").on(table.recallNumber),
  index("idx_fda_device_recalls_manufacturer").on(table.manufacturer),
  index("idx_fda_device_recalls_class").on(table.deviceClass),
  // Unique constraint for recall number per tenant  
  unique("unique_fda_device_recalls_number_tenant").on(table.recallNumber, table.tenantId),
]);

// PubMed Articles table
export const pubmedArticles = pgTable("pubmed_articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  pmid: varchar("pmid").unique().notNull(), // PubMed ID
  title: text("title").notNull(),
  abstract: text("abstract"),
  authors: jsonb("authors"), // Array of author objects
  journal: varchar("journal"),
  publishedDate: timestamp("published_date"),
  doi: varchar("doi"),
  pmcId: varchar("pmc_id"),
  keywords: text("keywords").array(),
  meshTerms: text("mesh_terms").array(),
  publicationTypes: text("publication_types").array(),
  affiliations: text("affiliations").array(),
  grantsList: jsonb("grants_list"),
  citationCount: integer("citation_count").default(0),
  relevanceScore: integer("relevance_score").default(0),
  regulatoryRelevance: varchar("regulatory_relevance"), // AI-assessed relevance
  rawData: jsonb("raw_data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_pubmed_articles_tenant").on(table.tenantId),
  index("idx_pubmed_articles_pmid").on(table.pmid),
  index("idx_pubmed_articles_journal").on(table.journal),
  index("idx_pubmed_articles_published").on(table.publishedDate),
]);

// Clinical Trials table
export const clinicalTrials = pgTable("clinical_trials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  nctId: varchar("nct_id").unique().notNull(), // ClinicalTrials.gov ID
  title: text("title").notNull(),
  briefSummary: text("brief_summary"),
  detailedDescription: text("detailed_description"),
  studyType: varchar("study_type"),
  studyPhase: varchar("study_phase"),
  studyStatus: varchar("study_status"),
  conditions: text("conditions").array(),
  interventions: jsonb("interventions"),
  primaryOutcomes: jsonb("primary_outcomes"),
  secondaryOutcomes: jsonb("secondary_outcomes"),
  eligibilityCriteria: text("eligibility_criteria"),
  enrollmentCount: integer("enrollment_count"),
  sponsor: varchar("sponsor"),
  collaborators: text("collaborators").array(),
  locations: jsonb("locations"),
  startDate: timestamp("start_date"),
  completionDate: timestamp("completion_date"),
  lastUpdateDate: timestamp("last_update_date"),
  resultsAvailable: boolean("results_available").default(false),
  fdaRegulated: boolean("fda_regulated").default(false),
  deviceProduct: boolean("device_product").default(false),
  rawData: jsonb("raw_data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_clinical_trials_tenant").on(table.tenantId),
  index("idx_clinical_trials_nct_id").on(table.nctId),
  index("idx_clinical_trials_status").on(table.studyStatus),
  index("idx_clinical_trials_sponsor").on(table.sponsor),
]);

// ISO Standards table for comprehensive standards management
export const isoStandards = pgTable("iso_standards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  code: varchar("code").notNull(), // e.g., "ISO 14971:2019"
  title: text("title").notNull(),
  description: text("description"),
  fullContent: text("full_content"), // Full scraped content
  category: isoStandardTypeEnum("category").notNull(),
  year: varchar("year"),
  url: varchar("url").notNull(),
  scrapedAt: timestamp("scraped_at"),
  lastUpdated: timestamp("last_updated"),
  status: statusEnum("status").default("active"),
  version: varchar("version"),
  stage: varchar("stage"), // Draft, Published, Withdrawn, etc.
  technicalCommittee: varchar("technical_committee"),
  ics: varchar("ics"), // International Classification for Standards
  pages: integer("pages"),
  price: varchar("price"),
  relevanceScore: integer("relevance_score").default(0), // AI-calculated relevance
  tags: text("tags").array(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_iso_standards_tenant").on(table.tenantId),
  index("idx_iso_standards_category").on(table.category),
  index("idx_iso_standards_code").on(table.code),
  index("idx_iso_standards_status").on(table.status),
]);

// AI Summaries for ISO Standards and other content
export const aiSummaries = pgTable("ai_summaries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  sourceId: varchar("source_id").notNull(), // Reference to ISO standard, regulatory update, etc.
  sourceType: varchar("source_type").notNull(), // "iso_standard", "regulatory_update", "legal_case"
  summaryType: varchar("summary_type").notNull(), // "executive", "technical", "regulatory"
  title: varchar("title").notNull(),
  keyPoints: text("key_points").array(),
  impactAssessment: text("impact_assessment"),
  actionItems: text("action_items").array(),
  riskLevel: varchar("risk_level").notNull(), // "low", "medium", "high", "critical"
  confidence: integer("confidence").default(85), // AI confidence score 0-100
  wordCount: integer("word_count").default(0),
  readingTime: integer("reading_time").default(0), // minutes
  status: summaryStatusEnum("status").default("pending"),
  aiModel: varchar("ai_model").default("gpt-5"), // Track which AI model was used
  processingTime: integer("processing_time"), // milliseconds
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_ai_summaries_tenant").on(table.tenantId),
  index("idx_ai_summaries_source").on(table.sourceId, table.sourceType),
  index("idx_ai_summaries_type").on(table.summaryType),
  index("idx_ai_summaries_status").on(table.status),
]);

// Feedback table for user feedback and error reports
export const feedback = pgTable("feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  page: varchar("page").notNull(), // URL/page where feedback was submitted
  type: feedbackTypeEnum("type").default("general"),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  userEmail: varchar("user_email"), // Optional contact email
  userName: varchar("user_name"), // Optional contact name
  browserInfo: jsonb("browser_info"), // Browser, OS, etc.
  status: feedbackStatusEnum("status").default("new"),
  priority: varchar("priority").default("medium"), // low, medium, high, urgent
  assignedTo: varchar("assigned_to"), // Who is handling this
  resolution: text("resolution"), // Resolution notes
  resolvedAt: timestamp("resolved_at"),
  emailSent: boolean("email_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_feedback_tenant").on(table.tenantId),
  index("idx_feedback_status").on(table.status),
  index("idx_feedback_type").on(table.type),
  index("idx_feedback_page").on(table.page),
  index("idx_feedback_created").on(table.createdAt),
]);

// ISO Standards schemas
export const insertIsoStandardSchema = createInsertSchema(isoStandards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertIsoStandard = z.infer<typeof insertIsoStandardSchema>;
export type IsoStandard = typeof isoStandards.$inferSelect;

// AI Summary schemas
export const insertAiSummarySchema = createInsertSchema(aiSummaries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertAiSummary = z.infer<typeof insertAiSummarySchema>;
export type AiSummary = typeof aiSummaries.$inferSelect;

// Feedback schemas
export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  emailSent: true,
});
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;

// Website Analytics & Access Tracking
export const websiteAnalytics = pgTable("website_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  sessionId: varchar("session_id"),
  page: varchar("page").notNull(),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address"),
  country: varchar("country"),
  city: varchar("city"),
  device: varchar("device"),
  browser: varchar("browser"),
  os: varchar("os"),
  referrer: text("referrer"),
  utm_source: varchar("utm_source"),
  utm_medium: varchar("utm_medium"),
  utm_campaign: varchar("utm_campaign"),
  timeOnPage: integer("time_on_page"), // seconds
  exitPage: boolean("exit_page").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_analytics_tenant").on(table.tenantId),
  index("idx_analytics_page").on(table.page),
  index("idx_analytics_session").on(table.sessionId),
  index("idx_analytics_created").on(table.createdAt),
  index("idx_analytics_ip").on(table.ipAddress),
]);

// Analytics schemas  
export const insertWebsiteAnalyticsSchema = createInsertSchema(websiteAnalytics).omit({
  id: true,
  createdAt: true,
});
export type InsertWebsiteAnalytics = z.infer<typeof insertWebsiteAnalyticsSchema>;
export type WebsiteAnalytics = typeof websiteAnalytics.$inferSelect;