# Software-Anforderungsspezifikation (SRS)

---

**Produktname:** `[Software-Produktname]`
**Produktversion:** `[Version]`
**Dokumenten-Version:** `1.0`
**Datum:** `[Datum]`

---

## 1. Einleitung

### 1.1. Zweck

Dieses Dokument beschreibt die funktionalen und nicht-funktionalen Anforderungen für die Software **[Software-Produktname]**. Es dient als Grundlage für Design, Entwicklung, Test und Validierung der Software.

### 1.2. Geltungsbereich

*   **Software:** `[Name der Software und kurze Beschreibung]`
*   **Zweckbestimmung:** `[Beschreibung der medizinischen Zweckbestimmung, z.B. "Diagnoseunterstützung bei der Analyse von EKG-Daten zur Erkennung von Vorhofflimmern."]`
*   **Zielgruppe:** `[Anwender (z.B. Kardiologen, medizinisches Fachpersonal) und Patientengruppen]`

### 1.3. Definitionen, Akronyme und Abkürzungen

| Begriff | Definition |
| :--- | :--- |
| SaMD | Software as a Medical Device |
| UI | User Interface (Benutzerschnittstelle) |
| `[...]` | `[...]` |

---

## 2. Gesamtbeschreibung

### 2.1. Produktperspektive

*   **System-Schnittstellen:** `[Beschreibung, wie die Software in bestehende Systeme (z.B. KIS, PACS) integriert wird.]`
*   **Benutzerschnittstellen:** `[Beschreibung der Hauptansichten und Interaktionselemente der UI.]`
*   **Hardware-Schnittstellen:** `[Falls zutreffend, Beschreibung der Interaktion mit Hardware (z.B. Sensoren, medizinische Geräte).]`

### 2.2. Produktfunktionen

*   `[Liste der Hauptfunktionen der Software, z.B. EKG-Daten-Import, KI-Analyse, Befunderstellung, etc.]`

### 2.3. Anwendermerkmale

| Anwendergruppe | Ausbildung / Kenntnisse | Verantwortlichkeiten |
| :--- | :--- | :--- |
| `[z.B. Arzt]` | `[Medizinstudium, Facharztausbildung]` | `[Diagnosestellung, Therapieentscheidung]` |
| `[z.B. Patient]` | `[Keine spezifischen Kenntnisse]` | `[Datenerfassung, Befolgung von Anweisungen]` |

### 2.4. Allgemeine Einschränkungen

*   **Regulatorische Anforderungen:** `[z.B. MDR (EU) 2017/745, FDA 21 CFR Part 820]`
*   **Normen:** `[z.B. IEC 62304, ISO 14971, IEC 62366-1]`
*   **Programmiersprache:** `[z.B. TypeScript, Python]`
*   **Betriebssystem:** `[z.B. Webbasiert, Windows 10, iOS 15+]`

---

## 3. Spezifische Anforderungen

### 3.1. Funktionale Anforderungen

**FR-001: Benutzerauthentifizierung**
*   **Beschreibung:** Benutzer müssen sich mit E-Mail und Passwort sicher anmelden können.
*   **Priorität:** Hoch

**FR-002: Datenimport**
*   **Beschreibung:** Die Software muss in der Lage sein, Daten im Format `[z.B. DICOM, HL7]` zu importieren.
*   **Priorität:** Hoch

`[...Weitere funktionale Anforderungen...]`

### 3.2. Nicht-funktionale Anforderungen

#### 3.2.1. Leistungsanforderungen

**NFR-001: Antwortzeit**
*   **Beschreibung:** Die Analyse eines Datensatzes darf maximal `[z.B. 5 Sekunden]` dauern.
*   **Priorität:** Hoch

#### 3.2.2. Sicherheitsanforderungen

**NFR-002: Datenverschlüsselung**
*   **Beschreibung:** Alle patientenbezogenen Daten müssen sowohl bei der Übertragung (TLS 1.2+) als auch im Ruhezustand (AES-256) verschlüsselt sein.
*   **Priorität:** Kritisch

#### 3.2.3. Gebrauchstauglichkeit (Usability)

**NFR-003: Intuitivität**
*   **Beschreibung:** Ein neuer Benutzer sollte in der Lage sein, die Kernfunktionen ohne Schulung innerhalb von `[z.B. 10 Minuten]` zu nutzen.
*   **Priorität:** Mittel

#### 3.2.4. Regulatorische Anforderungen

**NFR-004: Audit-Trail**
*   **Beschreibung:** Alle sicherheitsrelevanten Aktionen (z.B. Login, Datenänderung, Befunderstellung) müssen in einem unveränderlichen Audit-Trail protokolliert werden.
*   **Priorität:** Kritisch

`[...Weitere nicht-funktionale Anforderungen...]`

### 3.3. Schnittstellenanforderungen

**IF-001: REST-API**
*   **Beschreibung:** Die Software muss eine REST-API zur Integration mit Drittsystemen bereitstellen. Die API muss über `[z.B. OAuth2]` gesichert sein.
*   **Endpunkt:** `/api/v1/`

---

## 4. Rückverfolgbarkeit (Traceability)

Alle Anforderungen in diesem Dokument müssen zu Design-, Implementierungs- und Testartefakten rückverfolgbar sein.

*Verweis auf die Traceability-Matrix: `[Link zur Traceability-Matrix]`*

| Anforderungs-ID | Design-Spezifikation | Code-Modul | Testfall-ID |
| :--- | :--- | :--- | :--- |
| `[z.B. FR-001]` | `[Link zu Design-Doc]` | `[auth.service.ts]` | `[TC-AUTH-01]` |
| `[...]` | `[...]` | `[...]` | `[...]` |

---

## Anhang A: Genehmigungen

| Rolle | Name | Unterschrift | Datum |
| :--- | :--- | :--- | :--- |
| Product Owner | `[Name]` | | |
| Quality Manager | `[Name]` | | |
| Regulatory Affairs | `[Name]` | | |
