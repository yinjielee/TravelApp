# Travel Itinerary Application Implementation Plan

This plan outlines the architecture, tech stack, and development phases for a responsive web-based travel itinerary application. The app allows users to create multi-user accounts, plan trips, add destinations, upload attachments, and manage transportation/accommodation details. It is designed to be easily extensible for future mobile app support and offline capabilities.

## Proposed Tech Stack

### Frontend (Web)
*   **Framework:** React (Vite) - A lightweight foundation for Single Page Applications (SPAs).
*   **Styling:** Tailwind CSS - For rapid, utility-first UI development.
*   **State Management:** React Context API or Zustand (lightweight and scalable).
*   **Data Fetching:** React Query or Supabase's built-in hooks.

### Backend as a Service (BaaS) & Infrastructure
*   **Platform:** Supabase - Mapped closely to Postgres to reduce overhead, providing Database, Auth, and Storage natively.
*   **Database:** PostgreSQL (managed by Supabase).
*   **Authentication:** Supabase Auth - Handles user registration, login, and secure sessions natively.
*   **File Storage:** Supabase Storage - For storing attachments and images tied directly to user sessions.
*   **Hosting:** Netlify or Vercel (for the React Frontend).

## Core Data Models Recommendations

### Trip
*   `id` (UUID)
*   `ownerId` (UUID, Ref: User)
*   `title` (String)
*   `startDate` (Date)
*   `endDate` (Date)
*   `coverImage` (String, URL)

### Destination (Within a Trip)
*   `id` (UUID)
*   `tripId` (UUID, Ref: Trip)
*   `name` (String, e.g., "Louvre Museum")
*   `city` / `town` (String, e.g., "Paris")
*   `location` (String or GeoJSON/Lat-Lon payload)
*   `arrivalDate` / `arrivalTime`
*   `departureDate` / `departureTime`
*   `notes` (Text)
*   `estimatedCost` (Decimal)

### Accommodation & Transportation
*   These can be modeled as distinct entities or Polymorphic entities linking to a Trip or specific Destination.
*   **Transportation Fields:** `type` (Flight, Train, Car), `provider` (Airline Name), `bookingReference`, `departureLocation`, `arrivalLocation`, `departureTime`, `arrivalTime`.
*   **Accommodation Fields:** `name` (Hotel Name), `address`, `checkIn`, `checkOut`, `bookingReference`, `contactInfo`.

### Attachment
*   `id` (UUID)
*   `fileUrl` (String, S3 URL)
*   `entityType` (Enum: Destination, Trip, Accommodation)
*   `entityId` (UUID)

## Security & Cost Control Strategy

1.  **Row Level Security (RLS):** Leverage Supabase's native PostgreSQL Row Level Security to ensure users can only access and modify their own trips, destinations, and files.
2.  **Storage Policies:** Implement Supabase Storage bucket policies to restrict upload sizes (e.g., max 5MB per image) and ensure only authenticated users can upload.
3.  **Cost Controls:** Utilize Supabase's built-in spend caps to strictly prevent unexpected billing spikes if the tier limits are reached.
4.  **Environment Variables:** Strictly manage the Supabase URL and Anon Key via environment variables. Ensure the Service Role key is NEVER exposed to the frontend client.

## Implementation Phases

### Phase 1: Foundation & Authentication
*   Initialize React app (Vite).
*   Create Supabase project and define initial database schema with RLS policies.
*   Integrate Supabase Auth for User Registration and Login.

### Phase 2: Core Trip Management
*   Implement CRUD operations for Trips (Create, Read, Update, Delete).
*   Build the UI for the Trip Dashboard (listing all user trips).

### Phase 3: Destinations & Itinerary Details
*   Implement CRUD for Destinations within a Trip.
*   Implement CRUD for Transportation and Accommodations.
*   Build the drag-and-drop or timeline UI to assemble the itinerary.

### Phase 4: Media & Attachments
*   Set up Supabase Storage buckets for media.
*   Configure bucket policies for secure uploads from authenticated users.
*   Build UI components for drag-and-drop file uploads directly to Supabase.

### Phase 5: Polish & Final Security Audit
*   Thorough testing (Unit Tests for backend logic, E2E tests for core flows).
*   Final review of database indexes for performance.
*   Load testing to ensure rate limits and costs are behaving as expected.
