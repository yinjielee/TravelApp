# Systems Architecture: Travel Itinerary Application

This document describes the high-level architecture of the travel application, detailing how the React frontend interacts with the Supabase Backend-as-a-Service (BaaS) and potentially external services.

## High-Level Architecture Diagram (Conceptual)

```mermaid
graph TD
    Client[Client Browser (React SPA)] <--> |HTTPS / WebSocket| Vercel[Vercel/Netlify Hosting / CDN]
    Vercel <--> |Supabase Client JS| SupabaseAPI[Supabase API Gateway]
    
    subgraph Supabase BaaS
        SupabaseAPI <--> GoTrue[GoTrue Auth Service]
        SupabaseAPI <--> PostgREST[PostgREST Auto-generated REST API]
        SupabaseAPI <--> Realtime[Realtime Service (WebSockets)]
        SupabaseAPI <--> StorageAPI[Supabase Storage API]
        
        GoTrue --> DB[(PostgreSQL Database)]
        PostgREST --> DB
        Realtime --> DB
        
        StorageAPI --> S3[(Managed S3 Storage Bucket)]
    end
    
    Client -.-> |Direct External API Calls| MapAPI[Google Maps / Mapbox API]
    Client -.-> |Direct External API Calls| ImageAPI[Unsplash / Third-party Image APIs]
```

## Component Details

### 1. Frontend Client (React SPA)
-   **Framework:** Built with React via Vite for fast build times and local development.
-   **Hosting & Delivery:** Served via an Edge CDN (like Vercel or Netlify). The static bundle (HTML/CSS/JS) is delivered directly to the user's browser.
-   **State & Data Fetching:** 
    -   Uses `@supabase/supabase-js` client library as the primary mechanism for interacting with the backend.
    -   Data fetched via the `<Supabase Client>.from('tableName').select(...)` syntax directly against the database logic.
    -   React Context or Zustand manages global UI state (like active user session, UI theme).
    -   React Query can be layered over Supabase clients for advanced caching and optimistic UI updates if needed.

### 2. Backend (Supabase Platform)
Rather than a traditional custom Node.js/Express REST API, the application relies on Supabase, which wraps a robust PostgreSQL database with several purpose-built services:

-   **API Gateway:** Routes incoming requests from the client to the appropriate internal Supabase service.
-   **Authentication (GoTrue):** Handles user signup, login, password resets, and issues secure JWTs (Jason Web Tokens). The client SDK manages securely storing these tokens in `localStorage` or session cookies.
-   **Database Access (PostgREST):** Supabase instantly generates a REST API from the PostgreSQL schema. The React client queries this API almost identically to writing a SQL query in JS (e.g., filtering, joins, pagination).
-   **File Storage (Supabase Storage):** A wrapper around an S3-compatible backend. Handles uploads (like user attachments or cover images) securely, tied directly to the Auth system for granular file policies.
-   **Database (PostgreSQL 15+):** The core source of truth. Contains tables for Users, Trips, Destinations, Transportation, Accommodations, and file References.

### 3. Security & Access Control (Row Level Security)
The defining security feature of this architecture is **PostgreSQL Row Level Security (RLS)**.

-   Instead of writing authorization logic in a custom Node.js server wrapper (e.g., `if (req.user.id !== destination.userId) throw Error`), rules are defined directly in the database.
-   *Example Policy:* `CREATE POLICY "Users can only read their own trips" ON trips FOR SELECT USING (auth.uid() = owner_id);`
-   When the React client makes a request using its JWT, Supabase processes the query in Postgres under the context of that specific user, automatically filtering out rows they don't own.

### 4. External Integrations (Future/Potential)
To keep the backend minimal and reduce serverless function timeouts/costs, many external APIs can be called directly from the React Client, granted the API keys used are either:
A.) Safe to expose (e.g., publicly available Mapbox read-only keys restricted by domain).
B.) Proxied through a lightweight Supabase Edge Function if hiding the key is strictly necessary (e.g., payment gateways).

-   **Mapping/Location:** Google Places API or Mapbox for searching destinations and rendering interactive maps.
-   **Images:** Unsplash API for searching stock cover images for trips.

## Data Flow Example: Loading a Trip Detail Page

1.  **Request:** User navigates to `/trip/123`.
2.  **Auth Check:** React router checks for a valid local Supabase session.
3.  **Fetch (Client):** The component mounts and calls `supabase.from('trips').select('*, destinations(*), transport(*)').eq('id', '123')`.
4.  **Network:** Request hits Supabase PostgREST layer via HTTPS.
5.  **Security (DB):** PostgreSQL verifies the attached JWT and evaluates the RLS policy: *Does `auth.uid()` match this Trip's `ownerId`?*
6.  **Response:** The DB resolves the complex join and returns clean JSON directly to the client.
7.  **Render:** The React components mount the returned data onto the timeline UI.
