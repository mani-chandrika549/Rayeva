# Rayeva AI – Sustainable Commerce Platform

## Architecture Overview

This application is built as a full-stack system using **Express** (Backend) and **React** (Frontend), integrated with **Gemini AI** for intelligent automation.

### Core Modules Implemented

#### 1. AI Auto-Category & Tag Generator
- **Purpose**: Reduces manual catalog effort for sustainable products.
- **AI Logic**: Uses Gemini 3 Flash to analyze product names and descriptions. It maps products to a predefined taxonomy and generates SEO-optimized tags and sustainability filters.
- **Database**: Stores structured product data in SQLite for persistent catalog management.

#### 2. AI B2B Proposal Generator
- **Purpose**: Streamlines the creation of sustainable product mixes for corporate clients.
- **AI Logic**: Takes client requirements and budget constraints to suggest a balanced product mix, cost breakdown, and impact positioning.
- **Output**: Returns structured JSON that is rendered into a professional proposal view and stored for historical tracking.

### Architecture Outlines (Planned)

#### 3. AI Impact Reporting Generator
- **Logic**: Calculates environmental savings (plastic saved, carbon avoided) using LCA coefficients.
- **AI Role**: Translates raw metrics into human-readable narratives for customer engagement.
- **Storage**: Linked to Order IDs in the database for historical sustainability tracking.

#### 4. AI WhatsApp Support Bot
- **Interface**: Twilio/Meta WhatsApp API integration.
- **Intelligence**: RAG (Retrieval-Augmented Generation) grounded in the local database for order status and policies.
- **Safety**: Automated escalation logic based on sentiment analysis.

## AI Prompt Design

The system uses **Structured Output (JSON)** prompts to ensure consistency between the AI and the business logic.

- **Categorization Prompt**: Focuses on taxonomy alignment and sustainability attribute extraction.
- **Proposal Prompt**: Focuses on budget optimization and impact-first product selection.

## Technical Stack
- **Frontend**: React 19, Tailwind CSS 4, Motion, Lucide Icons.
- **Backend**: Node.js, Express, tsx.
- **Database**: SQLite (better-sqlite3).
- **AI**: @google/genai (Gemini 3 Flash).

## Setup
1. Define `GEMINI_API_KEY` in your environment.
2. Run `npm install`.
3. Run `npm run dev` to start the full-stack server.
