--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (02a153c)
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO neondb_owner;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO neondb_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: neondb_owner
--

COMMENT ON SCHEMA public IS '';


--
-- Name: ai_task_status; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.ai_task_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed'
);


ALTER TYPE public.ai_task_status OWNER TO neondb_owner;

--
-- Name: conversation_status; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.conversation_status AS ENUM (
    'open',
    'closed',
    'resolved'
);


ALTER TYPE public.conversation_status OWNER TO neondb_owner;

--
-- Name: feedback_status; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.feedback_status AS ENUM (
    'new',
    'read',
    'in_progress',
    'resolved',
    'closed',
    'gelesen',
    'diskutiert',
    'umgesetzt'
);


ALTER TYPE public.feedback_status OWNER TO neondb_owner;

--
-- Name: feedback_type; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.feedback_type AS ENUM (
    'bug',
    'feature',
    'improvement',
    'general',
    'error',
    'kritik',
    'verbesserung'
);


ALTER TYPE public.feedback_type OWNER TO neondb_owner;

--
-- Name: message_sender_type; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.message_sender_type AS ENUM (
    'customer',
    'ai',
    'human'
);


ALTER TYPE public.message_sender_type OWNER TO neondb_owner;

--
-- Name: order_status; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.order_status AS ENUM (
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
);


ALTER TYPE public.order_status OWNER TO neondb_owner;

--
-- Name: payment_status; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'paid',
    'failed',
    'refunded'
);


ALTER TYPE public.payment_status OWNER TO neondb_owner;

--
-- Name: priority; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.priority AS ENUM (
    'low',
    'medium',
    'high',
    'urgent'
);


ALTER TYPE public.priority OWNER TO neondb_owner;

--
-- Name: product_status; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.product_status AS ENUM (
    'active',
    'inactive',
    'draft'
);


ALTER TYPE public.product_status OWNER TO neondb_owner;

--
-- Name: status; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE public.status OWNER TO neondb_owner;

--
-- Name: update_type; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.update_type AS ENUM (
    'guidance',
    'standard',
    'recall',
    'approval',
    'variation',
    'fda_drug',
    'fda_device',
    'fda_adverse',
    'pubmed',
    'clinical_trial'
);


ALTER TYPE public.update_type OWNER TO neondb_owner;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.user_role AS ENUM (
    'customer',
    'admin',
    'ai_assistant'
);


ALTER TYPE public.user_role OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: neondb_owner
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO neondb_owner;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: neondb_owner
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNER TO neondb_owner;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: neondb_owner
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: approvals; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.approvals (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    item_type character varying NOT NULL,
    item_id character varying NOT NULL,
    status public.status DEFAULT 'pending'::public.status,
    reviewer_id character varying,
    comments text,
    reviewed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.approvals OWNER TO neondb_owner;

--
-- Name: clinical_trials; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.clinical_trials (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    tenant_id character varying,
    nct_id character varying NOT NULL,
    title text NOT NULL,
    brief_summary text,
    detailed_description text,
    study_type character varying,
    study_phase character varying,
    study_status character varying,
    conditions text[],
    interventions jsonb,
    primary_outcomes jsonb,
    secondary_outcomes jsonb,
    eligibility_criteria text,
    enrollment_count integer,
    sponsor character varying,
    collaborators text[],
    locations jsonb,
    start_date timestamp without time zone,
    completion_date timestamp without time zone,
    last_update_date timestamp without time zone,
    results_available boolean DEFAULT false,
    fda_regulated boolean DEFAULT false,
    device_product boolean DEFAULT false,
    raw_data jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.clinical_trials OWNER TO neondb_owner;

--
-- Name: data_sources; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.data_sources (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    type character varying NOT NULL,
    endpoint text,
    is_active boolean DEFAULT true,
    last_sync_at timestamp without time zone,
    config_data jsonb,
    created_at timestamp without time zone DEFAULT now(),
    region character varying NOT NULL,
    country character varying,
    category character varying NOT NULL,
    language character varying DEFAULT 'en'::character varying,
    sync_frequency character varying DEFAULT 'daily'::character varying,
    metadata jsonb
);


ALTER TABLE public.data_sources OWNER TO neondb_owner;

--
-- Name: fda_adverse_events; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.fda_adverse_events (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    tenant_id character varying,
    safety_report_id character varying NOT NULL,
    receipt_date timestamp without time zone,
    transmission_date timestamp without time zone,
    patient_age character varying,
    patient_sex character varying,
    patient_weight character varying,
    drugs jsonb,
    reactions jsonb,
    outcomes text[],
    seriousness character varying,
    report_type character varying,
    qualification character varying,
    country character varying,
    raw_data jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.fda_adverse_events OWNER TO neondb_owner;

--
-- Name: fda_device_recalls; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.fda_device_recalls (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    tenant_id character varying,
    recall_number character varying NOT NULL,
    device_name character varying,
    manufacturer character varying,
    device_class character varying,
    product_code character varying,
    recall_reason text,
    distribution_pattern text,
    k_number character varying,
    pma_number character varying,
    recall_initiation_date timestamp without time zone,
    report_date timestamp without time zone,
    termination_date timestamp without time zone,
    recall_status character varying,
    recall_classification character varying,
    raw_data jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.fda_device_recalls OWNER TO neondb_owner;

--
-- Name: fda_drug_labels; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.fda_drug_labels (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    tenant_id character varying,
    application_number character varying NOT NULL,
    brand_name character varying,
    generic_name character varying,
    manufacturer_name character varying,
    product_type character varying,
    route_of_administration text[],
    active_ingredients jsonb,
    indications_and_usage text,
    dosage_and_administration text,
    contraindications text,
    warnings text,
    adverse_reactions text,
    drug_interactions text,
    pregnancy_category character varying,
    ndc text[],
    labeling_revision_date timestamp without time zone,
    fda_approval_date timestamp without time zone,
    raw_data jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.fda_drug_labels OWNER TO neondb_owner;

--
-- Name: feedback; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.feedback (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    tenant_id character varying,
    user_id character varying,
    page character varying NOT NULL,
    type public.feedback_type DEFAULT 'general'::public.feedback_type,
    title character varying NOT NULL,
    message text NOT NULL,
    user_email character varying,
    user_name character varying,
    browser_info jsonb,
    status public.feedback_status DEFAULT 'new'::public.feedback_status,
    priority character varying DEFAULT 'medium'::character varying,
    assigned_to character varying,
    resolution text,
    resolved_at timestamp without time zone,
    email_sent boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.feedback OWNER TO neondb_owner;

--
-- Name: knowledge_articles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.knowledge_articles (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title character varying NOT NULL,
    content text NOT NULL,
    summary text,
    category character varying NOT NULL,
    tags text[] DEFAULT '{}'::text[],
    author character varying,
    status character varying DEFAULT 'draft'::character varying,
    published_at timestamp without time zone,
    view_count integer DEFAULT 0,
    last_updated timestamp without time zone DEFAULT now(),
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.knowledge_articles OWNER TO neondb_owner;

--
-- Name: knowledge_base; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.knowledge_base (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title character varying NOT NULL,
    content text NOT NULL,
    category character varying,
    tags jsonb,
    created_by_id character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    is_published boolean DEFAULT false
);


ALTER TABLE public.knowledge_base OWNER TO neondb_owner;

--
-- Name: legal_cases; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.legal_cases (
    id text NOT NULL,
    case_number text NOT NULL,
    title text NOT NULL,
    court text NOT NULL,
    jurisdiction text NOT NULL,
    decision_date date,
    summary text,
    content text,
    document_url text,
    impact_level text DEFAULT 'medium'::text,
    keywords text[],
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    tenant_id character varying,
    verdict text,
    damages text
);


ALTER TABLE public.legal_cases OWNER TO neondb_owner;

--
-- Name: medical_device_standards; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.medical_device_standards (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    standard_number character varying NOT NULL,
    title text NOT NULL,
    publisher_id character varying,
    category_id character varying,
    published_date timestamp without time zone,
    last_revision timestamp without time zone,
    current_version character varying,
    status character varying DEFAULT 'active'::character varying,
    scope text,
    abstract text,
    keywords text[],
    applicable_device_classes text[],
    regulatory_references jsonb,
    official_url character varying,
    purchase_url character varying,
    preview_url character varying,
    pdf_path character varying,
    price character varying,
    currency character varying DEFAULT 'USD'::character varying,
    pages integer,
    language character varying DEFAULT 'EN'::character varying,
    available_languages text[],
    replaced_standards text[],
    related_standards text[],
    citation_count integer DEFAULT 0,
    download_count integer DEFAULT 0,
    view_count integer DEFAULT 0,
    is_free_access boolean DEFAULT false,
    is_premium boolean DEFAULT false,
    is_core boolean DEFAULT false,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.medical_device_standards OWNER TO neondb_owner;

--
-- Name: newsletter_sources; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.newsletter_sources (
    id character varying DEFAULT ('ns_'::text || substr(md5((random())::text), 1, 8)) NOT NULL,
    name character varying NOT NULL,
    source_url text NOT NULL,
    description text,
    frequency character varying DEFAULT 'weekly'::character varying,
    is_active boolean DEFAULT true,
    categories text[] DEFAULT ARRAY[]::text[],
    last_issue_date date,
    subscriber_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.newsletter_sources OWNER TO neondb_owner;

--
-- Name: newsletters; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.newsletters (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title character varying NOT NULL,
    content text,
    html_content text,
    status character varying,
    scheduled_for timestamp without time zone,
    sent_at timestamp without time zone,
    created_by_id character varying,
    subscriber_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.newsletters OWNER TO neondb_owner;

--
-- Name: pubmed_articles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.pubmed_articles (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    tenant_id character varying,
    pmid character varying NOT NULL,
    title text NOT NULL,
    abstract text,
    authors jsonb,
    journal character varying,
    published_date timestamp without time zone,
    doi character varying,
    pmc_id character varying,
    keywords text[],
    mesh_terms text[],
    publication_types text[],
    affiliations text[],
    grants_list jsonb,
    citation_count integer DEFAULT 0,
    relevance_score integer DEFAULT 0,
    regulatory_relevance character varying,
    raw_data jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.pubmed_articles OWNER TO neondb_owner;

--
-- Name: regulatory_updates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.regulatory_updates (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title character varying NOT NULL,
    description text,
    source_id character varying,
    source_url text,
    region character varying NOT NULL,
    update_type public.update_type NOT NULL,
    priority public.priority DEFAULT 'medium'::public.priority,
    device_classes jsonb,
    categories jsonb,
    raw_data jsonb,
    published_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.regulatory_updates OWNER TO neondb_owner;

--
-- Name: standards_categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.standards_categories (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    description text,
    parent_id character varying,
    color character varying DEFAULT '#3B82F6'::character varying,
    icon character varying,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.standards_categories OWNER TO neondb_owner;

--
-- Name: standards_publishers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.standards_publishers (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    full_name character varying,
    acronym character varying,
    country character varying,
    region character varying,
    website character varying,
    api_endpoint character varying,
    logo character varying,
    description text,
    standards_count integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.standards_publishers OWNER TO neondb_owner;

--
-- Name: subscribers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.subscribers (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email character varying NOT NULL,
    name character varying,
    is_active boolean DEFAULT true,
    preferences jsonb,
    subscribed_at timestamp without time zone DEFAULT now(),
    newsletter_ids text[]
);


ALTER TABLE public.subscribers OWNER TO neondb_owner;

--
-- Name: tenant_data_access; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.tenant_data_access (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    tenant_id character varying NOT NULL,
    data_source_id character varying,
    allowed_regions jsonb DEFAULT '["US", "EU"]'::jsonb,
    monthly_limit integer DEFAULT 500,
    current_usage integer DEFAULT 0,
    last_reset_at timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.tenant_data_access OWNER TO neondb_owner;

--
-- Name: tenant_users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.tenant_users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    tenant_id character varying NOT NULL,
    user_id character varying NOT NULL,
    role character varying(50) DEFAULT 'viewer'::character varying NOT NULL,
    permissions jsonb DEFAULT '[]'::jsonb,
    dashboard_config jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    invited_at timestamp without time zone DEFAULT now(),
    joined_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.tenant_users OWNER TO neondb_owner;

--
-- Name: tenants; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.tenants (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(100) NOT NULL,
    subscription_plan character varying(50) DEFAULT 'starter'::character varying NOT NULL,
    subscription_status character varying(50) DEFAULT 'trial'::character varying NOT NULL,
    settings jsonb DEFAULT '{}'::jsonb,
    billing_email character varying(255),
    max_users integer DEFAULT 5,
    max_data_sources integer DEFAULT 10,
    api_access_enabled boolean DEFAULT false,
    custom_branding_enabled boolean DEFAULT false,
    trial_ends_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    customer_permissions jsonb DEFAULT '{"reports": false, "analytics": false, "auditLogs": false, "dashboard": true, "aiInsights": false, "legalCases": true, "newsletters": true, "globalSources": false, "knowledgeBase": true, "administration": false, "dataCollection": false, "historicalData": false, "systemSettings": false, "userManagement": false, "advancedAnalytics": false, "regulatoryUpdates": true}'::jsonb
);


ALTER TABLE public.tenants OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email character varying NOT NULL,
    name character varying NOT NULL,
    role character varying DEFAULT 'viewer'::character varying NOT NULL,
    profile_image_url character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: website_analytics; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.website_analytics (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    tenant_id character varying,
    user_id character varying,
    session_id character varying,
    page character varying NOT NULL,
    user_agent text,
    ip_address character varying,
    country character varying,
    city character varying,
    device character varying,
    browser character varying,
    os character varying,
    referrer text,
    utm_source character varying,
    utm_medium character varying,
    utm_campaign character varying,
    time_on_page integer,
    exit_page boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.website_analytics OWNER TO neondb_owner;

--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: neondb_owner
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: neondb_owner
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: approvals approvals_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.approvals
    ADD CONSTRAINT approvals_pkey PRIMARY KEY (id);


--
-- Name: clinical_trials clinical_trials_nct_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.clinical_trials
    ADD CONSTRAINT clinical_trials_nct_id_key UNIQUE (nct_id);


--
-- Name: clinical_trials clinical_trials_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.clinical_trials
    ADD CONSTRAINT clinical_trials_pkey PRIMARY KEY (id);


--
-- Name: data_sources data_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.data_sources
    ADD CONSTRAINT data_sources_pkey PRIMARY KEY (id);


--
-- Name: fda_adverse_events fda_adverse_events_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.fda_adverse_events
    ADD CONSTRAINT fda_adverse_events_pkey PRIMARY KEY (id);


--
-- Name: fda_device_recalls fda_device_recalls_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.fda_device_recalls
    ADD CONSTRAINT fda_device_recalls_pkey PRIMARY KEY (id);


--
-- Name: fda_drug_labels fda_drug_labels_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.fda_drug_labels
    ADD CONSTRAINT fda_drug_labels_pkey PRIMARY KEY (id);


--
-- Name: feedback feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_pkey PRIMARY KEY (id);


--
-- Name: knowledge_articles knowledge_articles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.knowledge_articles
    ADD CONSTRAINT knowledge_articles_pkey PRIMARY KEY (id);


--
-- Name: knowledge_base knowledge_base_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.knowledge_base
    ADD CONSTRAINT knowledge_base_pkey PRIMARY KEY (id);


--
-- Name: legal_cases legal_cases_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.legal_cases
    ADD CONSTRAINT legal_cases_pkey PRIMARY KEY (id);


--
-- Name: medical_device_standards medical_device_standards_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medical_device_standards
    ADD CONSTRAINT medical_device_standards_pkey PRIMARY KEY (id);


--
-- Name: newsletter_sources newsletter_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.newsletter_sources
    ADD CONSTRAINT newsletter_sources_pkey PRIMARY KEY (id);


--
-- Name: newsletters newsletters_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.newsletters
    ADD CONSTRAINT newsletters_pkey PRIMARY KEY (id);


--
-- Name: pubmed_articles pubmed_articles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pubmed_articles
    ADD CONSTRAINT pubmed_articles_pkey PRIMARY KEY (id);


--
-- Name: pubmed_articles pubmed_articles_pmid_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pubmed_articles
    ADD CONSTRAINT pubmed_articles_pmid_key UNIQUE (pmid);


--
-- Name: regulatory_updates regulatory_updates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.regulatory_updates
    ADD CONSTRAINT regulatory_updates_pkey PRIMARY KEY (id);


--
-- Name: standards_categories standards_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.standards_categories
    ADD CONSTRAINT standards_categories_pkey PRIMARY KEY (id);


--
-- Name: standards_publishers standards_publishers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.standards_publishers
    ADD CONSTRAINT standards_publishers_pkey PRIMARY KEY (id);


--
-- Name: subscribers subscribers_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subscribers
    ADD CONSTRAINT subscribers_email_unique UNIQUE (email);


--
-- Name: subscribers subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subscribers
    ADD CONSTRAINT subscribers_pkey PRIMARY KEY (id);


--
-- Name: tenant_data_access tenant_data_access_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tenant_data_access
    ADD CONSTRAINT tenant_data_access_pkey PRIMARY KEY (id);


--
-- Name: tenant_users tenant_users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tenant_users
    ADD CONSTRAINT tenant_users_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_slug_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_slug_key UNIQUE (slug);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: website_analytics website_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.website_analytics
    ADD CONSTRAINT website_analytics_pkey PRIMARY KEY (id);


--
-- Name: idx_analytics_created; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_analytics_created ON public.website_analytics USING btree (created_at);


--
-- Name: idx_analytics_ip; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_analytics_ip ON public.website_analytics USING btree (ip_address);


--
-- Name: idx_analytics_page; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_analytics_page ON public.website_analytics USING btree (page);


--
-- Name: idx_analytics_session; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_analytics_session ON public.website_analytics USING btree (session_id);


--
-- Name: idx_analytics_tenant; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_analytics_tenant ON public.website_analytics USING btree (tenant_id);


--
-- Name: idx_clinical_trials_nct_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_clinical_trials_nct_id ON public.clinical_trials USING btree (nct_id);


--
-- Name: idx_clinical_trials_sponsor; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_clinical_trials_sponsor ON public.clinical_trials USING btree (sponsor);


--
-- Name: idx_clinical_trials_status; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_clinical_trials_status ON public.clinical_trials USING btree (study_status);


--
-- Name: idx_clinical_trials_tenant; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_clinical_trials_tenant ON public.clinical_trials USING btree (tenant_id);


--
-- Name: idx_fda_adverse_events_receipt_date; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_fda_adverse_events_receipt_date ON public.fda_adverse_events USING btree (receipt_date);


--
-- Name: idx_fda_adverse_events_report_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_fda_adverse_events_report_id ON public.fda_adverse_events USING btree (safety_report_id);


--
-- Name: idx_fda_adverse_events_tenant; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_fda_adverse_events_tenant ON public.fda_adverse_events USING btree (tenant_id);


--
-- Name: idx_fda_device_recalls_class; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_fda_device_recalls_class ON public.fda_device_recalls USING btree (device_class);


--
-- Name: idx_fda_device_recalls_manufacturer; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_fda_device_recalls_manufacturer ON public.fda_device_recalls USING btree (manufacturer);


--
-- Name: idx_fda_device_recalls_number; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_fda_device_recalls_number ON public.fda_device_recalls USING btree (recall_number);


--
-- Name: idx_fda_device_recalls_tenant; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_fda_device_recalls_tenant ON public.fda_device_recalls USING btree (tenant_id);


--
-- Name: idx_fda_drug_labels_application; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_fda_drug_labels_application ON public.fda_drug_labels USING btree (application_number);


--
-- Name: idx_fda_drug_labels_brand; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_fda_drug_labels_brand ON public.fda_drug_labels USING btree (brand_name);


--
-- Name: idx_fda_drug_labels_generic; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_fda_drug_labels_generic ON public.fda_drug_labels USING btree (generic_name);


--
-- Name: idx_fda_drug_labels_tenant; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_fda_drug_labels_tenant ON public.fda_drug_labels USING btree (tenant_id);


--
-- Name: idx_feedback_created; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_feedback_created ON public.feedback USING btree (created_at);


--
-- Name: idx_feedback_page; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_feedback_page ON public.feedback USING btree (page);


--
-- Name: idx_feedback_status; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_feedback_status ON public.feedback USING btree (status);


--
-- Name: idx_feedback_tenant; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_feedback_tenant ON public.feedback USING btree (tenant_id);


--
-- Name: idx_feedback_type; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_feedback_type ON public.feedback USING btree (type);


--
-- Name: idx_knowledge_articles_category; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_knowledge_articles_category ON public.knowledge_articles USING btree (category);


--
-- Name: idx_knowledge_articles_published; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_knowledge_articles_published ON public.knowledge_articles USING btree (published_at);


--
-- Name: idx_knowledge_articles_status; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_knowledge_articles_status ON public.knowledge_articles USING btree (status);


--
-- Name: idx_pubmed_articles_journal; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_pubmed_articles_journal ON public.pubmed_articles USING btree (journal);


--
-- Name: idx_pubmed_articles_pmid; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_pubmed_articles_pmid ON public.pubmed_articles USING btree (pmid);


--
-- Name: idx_pubmed_articles_published; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_pubmed_articles_published ON public.pubmed_articles USING btree (published_date);


--
-- Name: idx_pubmed_articles_tenant; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_pubmed_articles_tenant ON public.pubmed_articles USING btree (tenant_id);


--
-- Name: idx_regulatory_updates_priority; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_regulatory_updates_priority ON public.regulatory_updates USING btree (priority);


--
-- Name: idx_regulatory_updates_published; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_regulatory_updates_published ON public.regulatory_updates USING btree (published_at);


--
-- Name: idx_regulatory_updates_region; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_regulatory_updates_region ON public.regulatory_updates USING btree (region);


--
-- Name: approvals approvals_reviewer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.approvals
    ADD CONSTRAINT approvals_reviewer_id_users_id_fk FOREIGN KEY (reviewer_id) REFERENCES public.users(id);


--
-- Name: clinical_trials clinical_trials_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.clinical_trials
    ADD CONSTRAINT clinical_trials_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: fda_adverse_events fda_adverse_events_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.fda_adverse_events
    ADD CONSTRAINT fda_adverse_events_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: fda_device_recalls fda_device_recalls_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.fda_device_recalls
    ADD CONSTRAINT fda_device_recalls_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: fda_drug_labels fda_drug_labels_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.fda_drug_labels
    ADD CONSTRAINT fda_drug_labels_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: feedback feedback_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: feedback feedback_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: knowledge_base knowledge_base_created_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.knowledge_base
    ADD CONSTRAINT knowledge_base_created_by_id_users_id_fk FOREIGN KEY (created_by_id) REFERENCES public.users(id);


--
-- Name: medical_device_standards medical_device_standards_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medical_device_standards
    ADD CONSTRAINT medical_device_standards_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.standards_categories(id);


--
-- Name: medical_device_standards medical_device_standards_publisher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medical_device_standards
    ADD CONSTRAINT medical_device_standards_publisher_id_fkey FOREIGN KEY (publisher_id) REFERENCES public.standards_publishers(id);


--
-- Name: newsletters newsletters_created_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.newsletters
    ADD CONSTRAINT newsletters_created_by_id_users_id_fk FOREIGN KEY (created_by_id) REFERENCES public.users(id);


--
-- Name: pubmed_articles pubmed_articles_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pubmed_articles
    ADD CONSTRAINT pubmed_articles_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: regulatory_updates regulatory_updates_source_id_data_sources_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.regulatory_updates
    ADD CONSTRAINT regulatory_updates_source_id_data_sources_id_fk FOREIGN KEY (source_id) REFERENCES public.data_sources(id);


--
-- Name: tenant_data_access tenant_data_access_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tenant_data_access
    ADD CONSTRAINT tenant_data_access_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: tenant_users tenant_users_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tenant_users
    ADD CONSTRAINT tenant_users_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: website_analytics website_analytics_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.website_analytics
    ADD CONSTRAINT website_analytics_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: website_analytics website_analytics_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.website_analytics
    ADD CONSTRAINT website_analytics_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: neondb_owner
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

