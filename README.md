# 📊 Omnichannel E-Commerce & Google Ads 360° Intelligence Engine

[![Google Ads](https://img.shields.io/badge/Google%20Ads-Script%20(V8)-34A853?logo=google-ads&logoColor=white)](https://developers.google.com/google-ads/scripts)
[![Google Analytics 4](https://img.shields.io/badge/GA4-Data%20API%20(v1beta)-F9AB00?logo=google-analytics&logoColor=white)](https://developers.google.com/analytics/devguides/reporting/data/v1)
[![Merchant API](https://img.shields.io/badge/Google%20Merchant%20API-v1%20REST-4285F4?logo=google&logoColor=white)](https://developers.google.com/merchant/api)
[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-Microservice-EA4335?logo=google&logoColor=white)](https://developers.google.com/apps-script)
[![Architecture](https://img.shields.io/badge/Architecture-Asynchronous%20Event--Driven-black)](https://en.wikipedia.org/wiki/Event-driven_architecture)

An enterprise-grade, asynchronous MarTech microservice that unifies **Google Ads (Performance Max & Shopping)**, the modern **Google Merchant API (v1)**, and **Google Analytics 4 (GA4 Data API)** into an executive decision-support system and direct ROAS dashboard.

---

## 🎯 The Problem

Standard Google Ads reporting suffers from critical blind spots:
1. **The Performance Max Black Box:** Ads-reported conversion data does not explain *why* non-converting products fail (e.g., landing page rejection vs. checkout abandonment).
2. **Execution Timeouts:** Native Google Ads Scripts hit runtime limits when processing mid-to-large catalogs (10,000 to 90,000+ SKUs).
3. **API Silos & Attribution Gaps:** Paid advertising data is isolated from on-site e-commerce behavior and multi-channel "Halo Effect" assisted sales.
4. **Environment Sandboxing:** Recent Google Ads Scripts updates restrict direct OAuth tokens for external Google services like GA4.

---

## 🏗️ System Architecture

To process up to **90,000+ SKUs without timeouts**, the system is decoupled into an **Asynchronous Fire-and-Forget / Message Queue** architecture:

```text
┌────────────────────────────────────────────────────────┐
│  CLIENT: Google Ads Script (ES6 Modularized)           │
│  - Collects shopping_performance_view metrics via GAQL │
│  - Packages aggregated cost/clicks per Product Item ID │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP POST (Asynchronous Webhook)
                            ▼
┌────────────────────────────────────────────────────────┐
│  SERVER: Google Sheets Apps Script (Web App Endpoint)  │
│  - Ingests payload & writes to raw queue: [Sys_Queue]  │
│  - Returns immediate HTTP 200 OK (Zero Client Timeout) │
│  - Spawns a background worker trigger (after 1000ms)   │
└───────────────────────────┬────────────────────────────┘
                            │ Asynchronous Trigger
                            ▼
┌────────────────────────────────────────────────────────┐
│  BACKGROUND WORKER ENGINE (Big Data Pipeline)          │
│  ├──▶ Google Merchant API (v1 REST)                    │
│  │    └─ Extracts productAttributes (Title & Live Price)│
│  ├──▶ GA4 Data API (Advanced Service)                  │
│  │    ├─ Query 1: Total 5-Stage E-Commerce Funnel      │
│  │    └─ Query 2: Isolated google/cpc Direct Sales     │
│  └──▶ Analyzer & Decision Engine                       │
│       └─ Evaluates Strict ROAS vs. Omnichannel Halo    │
└───────────────────────────┬────────────────────────────┘
                            │ Formats & Renders
                            ▼
┌────────────────────────────────────────────────────────┐
│  EXECUTIVE DASHBOARD (Google Sheets Presentation)      │
│  - Metadata Header Banner & C-Suite Context Card       │
│  - 18 Columns: On-Site Funnel + Strict ROAS + Action   │
│  - Dynamic Tab Naming: [YYYY-MM-DD HH:mm - AccountName]│
│  - Live Diagnostic Logging: [Sys_Logs]                 │
└────────────────────────────────────────────────────────┘
```

---

## ⚡ Key Features

* **5-Stage Full E-Commerce Funnel:** Inspects the progression:
  $$\text{Items Viewed} \longrightarrow \text{Items Added to Cart} \longrightarrow \text{Cart-to-View Rate (\%)} \longrightarrow \text{Items Purchased} \longrightarrow \text{Item Revenue}$$
* **Strict Direct ROAS vs. Holistic Halo Effect:**
  $$\text{Direct Product ROAS} = \frac{\text{GA4 Revenue } (google / cpc)}{\text{Google Ads Spend}}$$
  Flags products with low direct ROAS that drive high store-wide assisted revenue, preventing accidental budget cuts on discovery drivers.
* **Modern Google Merchant API (v1) Compliant:** Replaces deprecated *Content API for Shopping* with the new modular REST endpoint, supporting nested `productAttributes`.
* **Zero-Timeout Resilience:** Decoupled payload ingestion ensures Google Ads client scripts complete in under 5 seconds regardless of catalog size.
* **Live In-Sheet Auditing (`Sys_Logs`):** Dedicated status log captures HTTP response codes, OAuth rejections, and SKU match rates in real time.
* **Separation of Concerns (SoC):** Fully modular codebase on both Client and Server layers.

---

## 📊 Executive Decision Matrix

The built-in rule engine (`ServiceAnalyzer.gs`) categorizes products based on quantitative thresholds:

| AI Status Flag | Condition | Recommended Strategy |
| :--- | :--- | :--- |
| 🟢 **STAR: High Profitability** | Direct ROAS $\ge 4.0\times$ | Increase budget; isolate SKU into an exclusive hero campaign. |
| 🟢 **PROFITABLE: Target Met** | $1.5\times \le \text{Direct ROAS} < 4.0\times$ | Maintain current bid strategy; monitor pacing. |
| 🟡 **WARNING: Halo Effect** | Direct ROAS $< 1.0\times$ **AND** Total Revenue $\ge 3\times$ Ads Cost | **Do not pause.** Product acts as a discovery gateway. Lower Max CPC / Target ROAS. |
| 🟡 **WARNING: Cart Abandoned** | Items Added to Cart $> 0$ **AND** Purchases $= 0$ | Friction at checkout. Audit shipping fees, payment gateways, and guest checkout options. |
| 🔴 **DANGER: Zero Cart Adds** | Views $> 0$ **AND** Add to Cart Rate $= 0\%$ | Offer or pricing rejection. Landing page or price uncompetitive. |
| 🔴 **DANGER: Pure Bleeder** | Spend $>$ Threshold, ROAS $< 1.0\times$, No Halo Revenue | Negative exclude or pause from PMax / Shopping feeds immediately. |

---

## 📁 Repository Structure

```bash
├── client/                      # Google Ads Scripts Environment (Client Layer)
│   ├── Config.gs                # Target webhook URL, query periods, click thresholds
│   ├── Main.gs                  # Client orchestrator entry point
│   ├── AdsDataService.gs        # GAQL engine for shopping_performance_view
│   └── ApiClient.gs             # HTTP client with retry logic & error handling
│
└── server/                      # Google Apps Script Environment (Server Layer)
    ├── Config.gs                # System IDs (GA4 Property, GMC ID, Sheet names, CPA targets)
    ├── Setup.gs                 # GCP project validation & GMC Developer Registration
    ├── Main.gs                  # Webhook receiver (doPost) & Queue scheduler
    ├── Worker.gs                # Background worker managing batch processing & execution limits
    ├── ApiGmc.gs                # Google Merchant API v1 REST integration module
    ├── ApiGa4.gs                # GA4 Data API multi-report query engine
    ├── ServiceAnalyzer.gs       # Business rules & decision-support heuristics
    ├── ServiceSheets.gs         # Presentation layer, number formatting, dynamic tabs
    ├── ServiceLogger.gs         # In-sheet auditing logger (Sys_Logs)
    └── Utils.gs                 # Standardized API response envelopes & helpers
```

---

## 🛠️ Installation & Setup

### Phase 1: Server Configuration (Google Sheets Apps Script)

1. Open your designated Google Spreadsheet and navigate to **Extensions > Apps Script**.
2. Add all files from the `server/` directory into your project.
3. In the left sidebar, click **Services (+)** and enable:
   * **Google Analytics Data API** (Identifier: `AnalyticsData`)
   * **Merchant API** (Identifier: `MerchantApi`)
4. Open **Project Settings (⚙️)**, check **Show "appsscript.json" manifest file in editor**, and paste the configuration:
   ```json
   {
     "timeZone": "Europe/Istanbul",
     "exceptionLogging": "STACKDRIVER",
     "runtimeVersion": "V8",
     "dependencies": {
       "enabledAdvancedServices": [
         {
           "userSymbol": "AnalyticsData",
           "serviceId": "analyticsdata",
           "version": "v1beta"
         },
         {
           "userSymbol": "MerchantApi",
           "serviceId": "merchantapi",
           "version": "products_v1"
         }
       ]
     },
     "oauthScopes": [
       "https://www.googleapis.com/auth/analytics.readonly",
       "https://www.googleapis.com/auth/analytics",
       "https://www.googleapis.com/auth/content",
       "https://www.googleapis.com/auth/script.external_request",
       "https://www.googleapis.com/auth/spreadsheets",
       "https://www.googleapis.com/auth/script.scriptapp"
     ],
     "webapp": {
       "executeAs": "USER_DEPLOYING",
       "access": "ANYONE_ANONYMOUS"
     }
   }
   ```
5. Open `Setup.gs`:
   * Run `setupAuth()` once to grant project trigger permissions.
   * Run `registerMerchantGcp()` once to pair your Google Cloud Project Number with your Merchant Center account. *(Allow 5 minutes for Google's backend propagation).*
6. Click **Deploy > New Deployment**:
   * Select **Web app**.
   * Execute as: **Me**.
   * Who has access: **Anyone**.
   * Copy the resulting **Web App URL** (`.../exec`).

### Phase 2: Client Configuration (Google Ads)

1. Navigate to **Google Ads > Tools & Settings > Scripts**.
2. Create a new script, use the `+` button in the editor to create the 4 files found in `client/`.
3. In `Config.gs`, assign your copied endpoint:
   ```javascript
   const CONFIG = {
     WEB_APP_URL: "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec",
     PERIOD: "LAST_90_DAYS",
     MIN_CLICKS: 2
   };
   ```
4. Authorize and test-run the script.
5. Schedule the client script to run periodically (e.g., Weekly on Mondays).

---

## 🔐 Security & Data Privacy

* When contributing or publishing this code publicly, **never commit real Merchant Center IDs, GA4 Property IDs, or live `/exec` Web App URLs**.
* Maintain sanitized placeholders (`YOUR_MERCHANT_ID`, `YOUR_GA4_PROPERTY_ID`) across all version-controlled files.

---

## 👨‍💻 Author & Acknowledgements

* **Architecture & Development:** Khan-Prismoon MarTech Engineering
* Built on Google Cloud Platform, Google Ads Scripts V8 runtime, and Google Apps Script Microservice framework.
