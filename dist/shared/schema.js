import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb, pgEnum, index, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
export const statusEnum = pgEnum("status", ["active", "inactive", "pending", "archived"]);
export const updateTypeEnum = pgEnum("update_type", ["regulation", "guidance", "standard", "approval", "alert", "fda_drug", "fda_device", "fda_adverse", "pubmed", "clinical_trial"]);
export const chatMessageTypeEnum = pgEnum("chat_message_type", ["message", "feature_request", "bug_report", "question", "feedback"]);
export const chatMessageStatusEnum = pgEnum("chat_message_status", ["unread", "read", "resolved", "in_progress"]);
export const isoStandardTypeEnum = pgEnum("iso_standard_type", ["ISO", "IEC", "ASTM", "EN", "AAMI", "EU_Regulation"]);
export const summaryStatusEnum = pgEnum("summary_status", ["pending", "processing", "completed", "failed"]);
export const feedbackTypeEnum = pgEnum("feedback_type", ["bug", "feature", "improvement", "general", "error", "kritik", "verbesserung"]);
export const feedbackStatusEnum = pgEnum("feedback_status", ["new", "read", "in_progress", "resolved", "closed", "gelesen", "diskutiert", "umgesetzt"]);
export const tenants = pgTable("tenants", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    name: varchar("name").notNull(),
    subdomain: varchar("subdomain").unique().notNull(),
    customDomain: varchar("custom_domain"),
    logo: varchar("logo"),
    colorScheme: varchar("color_scheme").default("blue"),
    settings: jsonb("settings"),
    subscriptionTier: varchar("subscription_tier").default("standard"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
    index("idx_tenants_subdomain").on(table.subdomain),
    index("idx_tenants_active").on(table.isActive),
]);
export const userRoleEnum = pgEnum("user_role", ["tenant_admin", "tenant_user", "super_admin"]);
export const users = pgTable("users", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
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
export const sessions = pgTable("sessions", {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire", { mode: "date" }).notNull(),
}, (table) => [
    index("idx_sessions_expire").on(table.expire),
]);
export const dataSources = pgTable("data_sources", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    name: varchar("name").notNull(),
    description: text("description"),
    url: varchar("url"),
    apiEndpoint: varchar("api_endpoint"),
    country: varchar("country"),
    region: varchar("region"),
    type: varchar("type").notNull(),
    category: varchar("category"),
    language: varchar("language").default("en"),
    priority: varchar("priority").default("medium"),
    dataFormat: varchar("data_format").default("json"),
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
    endpointsConfig: jsonb("endpoints_config"),
    scrapingConfig: jsonb("scraping_config"),
    dataMapping: jsonb("data_mapping"),
    validationRules: jsonb("validation_rules"),
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
export const regulatoryUpdates = pgTable("regulatory_updates", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
    sourceId: varchar("source_id").references(() => dataSources.id),
    title: text("title").notNull(),
    description: text("description"),
    content: text("content"),
    type: updateTypeEnum("type").default("regulation"),
    category: varchar("category"),
    deviceType: varchar("device_type"),
    riskLevel: varchar("risk_level"),
    therapeuticArea: varchar("therapeutic_area"),
    documentUrl: varchar("document_url"),
    documentId: varchar("document_id"),
    publishedDate: timestamp("published_date"),
    effectiveDate: timestamp("effective_date"),
    jurisdiction: varchar("jurisdiction"),
    language: varchar("language").default("en"),
    tags: text("tags").array(),
    priority: integer("priority").default(1),
    isProcessed: boolean("is_processed").default(false),
    processingNotes: text("processing_notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
    index("idx_regulatory_updates_tenant").on(table.tenantId),
    index("idx_regulatory_updates_source").on(table.sourceId),
    index("idx_regulatory_updates_type").on(table.type),
    index("idx_regulatory_updates_published").on(table.publishedDate),
    index("idx_regulatory_updates_priority").on(table.priority),
]);
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
    verdict: text("verdict"),
    damages: text("damages"),
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
export const knowledgeArticles = pgTable("knowledge_articles", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
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
export const newsletters = pgTable("newsletters", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    subject: varchar("subject").notNull(),
    content: text("content").notNull(),
    htmlContent: text("html_content"),
    scheduledAt: timestamp("scheduled_at"),
    sentAt: timestamp("sent_at"),
    status: varchar("status").default("draft"),
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
export const subscribers = pgTable("subscribers", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
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
export const approvals = pgTable("approvals", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    itemType: varchar("item_type").notNull(),
    itemId: varchar("item_id").notNull(),
    status: varchar("status").default("pending"),
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
export const chatMessages = pgTable("chat_messages", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
    senderId: varchar("sender_id").references(() => users.id),
    senderType: varchar("sender_type").notNull(),
    senderName: varchar("sender_name").notNull(),
    senderEmail: varchar("sender_email").notNull(),
    messageType: chatMessageTypeEnum("message_type").default("message"),
    subject: varchar("subject"),
    message: text("message").notNull(),
    status: chatMessageStatusEnum("status").default("unread"),
    priority: varchar("priority").default("normal"),
    attachments: jsonb("attachments"),
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
export const chatConversations = pgTable("chat_conversations", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
    subject: varchar("subject").notNull(),
    status: varchar("status").default("open"),
    priority: varchar("priority").default("normal"),
    lastMessageAt: timestamp("last_message_at").defaultNow(),
    messageCount: integer("message_count").default(0),
    participantIds: text("participant_ids").array(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
    index("idx_chat_conversations_tenant").on(table.tenantId),
    index("idx_chat_conversations_status").on(table.status),
    index("idx_chat_conversations_last_message").on(table.lastMessageAt),
]);
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
export const insertUserSchema = createInsertSchema(users).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertTenantSchema = createInsertSchema(tenants).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const tenantUsers = pgTable("tenant_users", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
    userId: varchar("user_id").references(() => users.id).notNull(),
    role: varchar("role", {
        length: 50
    }).$type().notNull().default('viewer'),
    permissions: jsonb("permissions").default(sql `'[]'`),
    dashboardConfig: jsonb("dashboard_config").default(sql `'{}'`),
    isActive: boolean("is_active").default(true),
    invitedAt: timestamp("invited_at").defaultNow(),
    joinedAt: timestamp("joined_at"),
    createdAt: timestamp("created_at").defaultNow(),
});
export const tenantDataAccess = pgTable("tenant_data_access", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
    dataSourceId: varchar("data_source_id"),
    allowedRegions: jsonb("allowed_regions").default(sql `'["US", "EU"]'`),
    monthlyLimit: integer("monthly_limit").default(500),
    currentUsage: integer("current_usage").default(0),
    lastResetAt: timestamp("last_reset_at").defaultNow(),
    createdAt: timestamp("created_at").defaultNow(),
});
export const tenantDashboards = pgTable("tenant_dashboards", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
    userId: varchar("user_id").references(() => users.id).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: varchar("description", { length: 500 }),
    layoutConfig: jsonb("layout_config").default(sql `'{}'`),
    widgets: jsonb("widgets").default(sql `'[]'`),
    isDefault: boolean("is_default").default(false),
    isShared: boolean("is_shared").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
export const tenantInvitations = pgTable("tenant_invitations", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    role: varchar("role", {
        length: 50
    }).$type().notNull(),
    invitedBy: varchar("invited_by").references(() => users.id).notNull(),
    token: varchar("token", { length: 255 }).unique().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    acceptedAt: timestamp("accepted_at"),
    createdAt: timestamp("created_at").defaultNow(),
});
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
export const insertDataSourceSchema = createInsertSchema(dataSources).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const syncResults = pgTable("sync_results", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    dataSourceId: varchar("data_source_id").references(() => dataSources.id, { onDelete: "cascade" }).notNull(),
    syncType: varchar("sync_type").default("scheduled"),
    status: varchar("status").notNull(),
    recordsProcessed: integer("records_processed").default(0),
    recordsAdded: integer("records_added").default(0),
    recordsUpdated: integer("records_updated").default(0),
    recordsSkipped: integer("records_skipped").default(0),
    startedAt: timestamp("started_at").defaultNow(),
    completedAt: timestamp("completed_at"),
    duration: integer("duration_ms"),
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
export const insertRegulatoryUpdateSchema = createInsertSchema(regulatoryUpdates).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertLegalCaseSchema = createInsertSchema(legalCases).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertKnowledgeArticleSchema = createInsertSchema(knowledgeArticles).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertNewsletterSchema = createInsertSchema(newsletters).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertSubscriberSchema = createInsertSchema(subscribers).omit({
    id: true,
});
export const insertApprovalSchema = createInsertSchema(approvals).omit({
    id: true,
});
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertChatConversationSchema = createInsertSchema(chatConversations).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const fdaDrugLabels = pgTable("fda_drug_labels", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
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
    ndc: text("ndc").array(),
    labelingRevisionDate: timestamp("labeling_revision_date"),
    fdaApprovalDate: timestamp("fda_approval_date"),
    rawData: jsonb("raw_data"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
    index("idx_fda_drug_labels_tenant").on(table.tenantId),
    index("idx_fda_drug_labels_application").on(table.applicationNumber),
    index("idx_fda_drug_labels_brand").on(table.brandName),
    index("idx_fda_drug_labels_generic").on(table.genericName),
    unique("unique_fda_drug_labels_app_tenant").on(table.applicationNumber, table.tenantId),
]);
export const fdaAdverseEvents = pgTable("fda_adverse_events", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
    safetyReportId: varchar("safety_report_id").notNull(),
    receiptDate: timestamp("receipt_date"),
    transmissionDate: timestamp("transmission_date"),
    patientAge: varchar("patient_age"),
    patientSex: varchar("patient_sex"),
    patientWeight: varchar("patient_weight"),
    drugs: jsonb("drugs"),
    reactions: jsonb("reactions"),
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
    unique("unique_fda_adverse_events_report_tenant").on(table.safetyReportId, table.tenantId),
]);
export const fdaDeviceRecalls = pgTable("fda_device_recalls", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
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
    unique("unique_fda_device_recalls_number_tenant").on(table.recallNumber, table.tenantId),
]);
export const pubmedArticles = pgTable("pubmed_articles", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
    pmid: varchar("pmid").unique().notNull(),
    title: text("title").notNull(),
    abstract: text("abstract"),
    authors: jsonb("authors"),
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
    regulatoryRelevance: varchar("regulatory_relevance"),
    rawData: jsonb("raw_data"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
    index("idx_pubmed_articles_tenant").on(table.tenantId),
    index("idx_pubmed_articles_pmid").on(table.pmid),
    index("idx_pubmed_articles_journal").on(table.journal),
    index("idx_pubmed_articles_published").on(table.publishedDate),
]);
export const clinicalTrials = pgTable("clinical_trials", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
    nctId: varchar("nct_id").unique().notNull(),
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
export const isoStandards = pgTable("iso_standards", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
    code: varchar("code").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    fullContent: text("full_content"),
    category: isoStandardTypeEnum("category").notNull(),
    year: varchar("year"),
    url: varchar("url").notNull(),
    scrapedAt: timestamp("scraped_at"),
    lastUpdated: timestamp("last_updated"),
    status: statusEnum("status").default("active"),
    version: varchar("version"),
    stage: varchar("stage"),
    technicalCommittee: varchar("technical_committee"),
    ics: varchar("ics"),
    pages: integer("pages"),
    price: varchar("price"),
    relevanceScore: integer("relevance_score").default(0),
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
export const aiSummaries = pgTable("ai_summaries", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
    sourceId: varchar("source_id").notNull(),
    sourceType: varchar("source_type").notNull(),
    summaryType: varchar("summary_type").notNull(),
    title: varchar("title").notNull(),
    keyPoints: text("key_points").array(),
    impactAssessment: text("impact_assessment"),
    actionItems: text("action_items").array(),
    riskLevel: varchar("risk_level").notNull(),
    confidence: integer("confidence").default(85),
    wordCount: integer("word_count").default(0),
    readingTime: integer("reading_time").default(0),
    status: summaryStatusEnum("status").default("pending"),
    aiModel: varchar("ai_model").default("gpt-5"),
    processingTime: integer("processing_time"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
    index("idx_ai_summaries_tenant").on(table.tenantId),
    index("idx_ai_summaries_source").on(table.sourceId, table.sourceType),
    index("idx_ai_summaries_type").on(table.summaryType),
    index("idx_ai_summaries_status").on(table.status),
]);
export const feedback = pgTable("feedback", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    tenantId: varchar("tenant_id").references(() => tenants.id, { onDelete: "cascade" }),
    userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
    page: varchar("page").notNull(),
    type: feedbackTypeEnum("type").default("general"),
    title: varchar("title").notNull(),
    message: text("message").notNull(),
    userEmail: varchar("user_email"),
    userName: varchar("user_name"),
    browserInfo: jsonb("browser_info"),
    status: feedbackStatusEnum("status").default("new"),
    priority: varchar("priority").default("medium"),
    assignedTo: varchar("assigned_to"),
    resolution: text("resolution"),
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
export const insertIsoStandardSchema = createInsertSchema(isoStandards).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertAiSummarySchema = createInsertSchema(aiSummaries).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertFeedbackSchema = createInsertSchema(feedback).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    emailSent: true,
});
export const websiteAnalytics = pgTable("website_analytics", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
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
    timeOnPage: integer("time_on_page"),
    exitPage: boolean("exit_page").default(false),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
    index("idx_analytics_tenant").on(table.tenantId),
    index("idx_analytics_page").on(table.page),
    index("idx_analytics_session").on(table.sessionId),
    index("idx_analytics_created").on(table.createdAt),
    index("idx_analytics_ip").on(table.ipAddress),
]);
export const insertWebsiteAnalyticsSchema = createInsertSchema(websiteAnalytics).omit({
    id: true,
    createdAt: true,
});
//# sourceMappingURL=schema.js.map