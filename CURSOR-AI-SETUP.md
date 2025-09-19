# HELIX REGULATORY INTELLIGENCE - CURSOR.AI SETUP

## 🚀 **Schnellstart für Cursor.AI**

### **1. Projekt Setup**
```bash
# In Cursor.ai Terminal
npm install
cp .env.example .env
# .env mit Ihren Datenbank-Credentials bearbeiten
```

### **2. Datenbank Setup**
```bash
npm run db:push
```

### **3. Entwicklung starten**
```bash
npm run dev
# Öffnet auf http://localhost:5000
```

---

## 📂 **Projektstruktur**

```
helix-regulatory-platform/
├── client/               # React Frontend (TypeScript)
│   ├── src/
│   │   ├── components/   # UI Komponenten
│   │   ├── pages/        # Seiten
│   │   ├── contexts/     # React Contexts
│   │   └── lib/          # Utilities
├── server/               # Express Backend (TypeScript)
│   ├── routes.ts         # API Routes
│   ├── storage.ts        # Database Layer
│   └── services/         # Business Logic
├── shared/               # Geteilte Types & Schema
│   └── schema.ts         # Drizzle Database Schema
└── Config Files
```

---

## ⚡ **Features**

### **Admin Dashboard**
- **URL**: `/`
- Regulatory Updates Management
- Data Collection & Analytics
- Email Newsletter System
- User & Tenant Management

### **Feedback System**
- **URL**: `/erweiterungen` (Sidebar → ERWEITERT → Feedback & Anmerkungen)
- Interne Workflow-Status (Neu → Gelesen → Diskutiert → Umgesetzt)
- Floating Feedback Button auf allen Seiten
- Typ-basierte Kategorisierung (Verbesserung, Kritik, Bug, Feature)

### **Customer Portal**
- **URL**: `/customer` (mit Demo-Login)
- Multi-Tenant Architektur
- Abonnement-basierte Features
- AI-gestützte Regulatory Insights

---

## 🔧 **Tech Stack**

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Build**: Vite + ESBuild
- **Email**: Gmail SMTP + SendGrid Fallback

---

## 📝 **Wichtige Befehle**

```bash
npm run dev          # Development Server
npm run build        # Production Build
npm run db:push      # Database Schema Sync
npm run type-check   # TypeScript Validation
```

---

## 🗄️ **Database Setup**

### **PostgreSQL erforderlich**
- Lokale Installation oder Cloud (Neon, Supabase, etc.)
- Connection String in `.env`: `DATABASE_URL=postgresql://...`

### **Schema Deployment**
```bash
npm run db:push
# Bei Problemen: npm run db:push --force
```

---

## 🔐 **Environment Variables**

```bash
# Erforderlich
DATABASE_URL=postgresql://user:pass@host:port/dbname

# Optional (für Email-Features)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
SENDGRID_API_KEY=your-sendgrid-key

# Development
NODE_ENV=development
PORT=5000
```

---

## ✅ **Status: Produktionsreif**

- ✅ Vollständig funktionsfähig
- ✅ TypeScript strict mode
- ✅ Multi-Tenant Architektur
- ✅ Responsive Design
- ✅ Security Best Practices
- ✅ Performance optimiert

**Bereit für Cursor.AI Development & Deployment!**