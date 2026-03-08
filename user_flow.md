# User Flows: Travel Itinerary Application

This document outlines the primary journeys a user will take when interacting with the travel itinerary application. This structural flow will guide the UI/UX design and component development.

---

## 1. Authentication Flow

**Goal:** Securely onboard users and authenticate returning users so they can access their private travel data.

*   **1.1 Landing Page**
    *   User arrives at `/`.
    *   **Action:** Clicks "Get Started" or "Login".
*   **1.2 Signup/Login Modal or Page (`/auth`)**
    *   User presented with Email/Password fields. (Future: Google/Social Auth buttons).
    *   **Action (New User):** Enters email and password. Clicks "Sign Up".
    *   **Action (Returning User):** Enters email and password. Clicks "Log In".
*   **1.3 Authentication Processing**
    *   *System action:* Supabase validates credentials.
    *   *Failure:* Show inline error (e.g., "Invalid credentials", "Email already in use").
    *   *Success:* Generate session token.
*   **1.4 Redirection**
    *   User is redirected to their personal `/dashboard`.

---

## 2. Dashboard Flow

**Goal:** Provide an overview of all upcoming/past trips and a clear entry point to create new ones.

*   **2.1 Dashboard View (`/dashboard`)**
    *   User sees a grid/list of existing "Card" components representing their trips.
    *   **Action (View):** User clicks an existing trip card -> Redirects to `3. Trip Detail Flow`.
    *   **Action (Create):** User clicks a prominent "Create New Trip" button.
*   **2.2 Create Trip Modal**
    *   A modal appears asking for basic trip metadata.
    *   *Fields:* Trip Title (Required), Start Date, End Date, Optional Cover Image Upload.
    *   **Action (Cancel):** Modal closes.
    *   **Action (Save):** Clicks "Create". 
    *   *System action:* Insert new Trip record into Supabase.
*   **2.3 Redirection**
    *   Modal closes, user is immediately redirected to the newly created `/trip/[trip-id]`.

---

## 3. Trip Detail & Itinerary Builder Flow

**Goal:** The core workspace where a user plans their specific trip, adds destinations, and manages logistics.

*   **3.1 Trip Overview View (`/trip/[trip-id]`)**
    *   User sees the Trip Header (Title, Dates, Cover Image). Below is the main workspace, likely a timeline or day-by-day column view.
    *   **Action Navigation:** User can switch between "Itinerary" (timeline), "Logistics" (Transport/Accommodation lists), and "Settings" (Delete trip, edit title).

*   **3.2 Adding a Destination (The Core Loop)**
    *   **Action:** User clicks "Add Destination" on a specific day in the timeline.
    *   **3.2.1 Destination Detail Slide-over/Modal**
        *   User fills out details for that specific stop.
        *   *Fields:* Name (e.g., "Louvre"), City/Town ("Paris"), Date/Time, estimated cost, rich text notes.
    *   **3.2.2 Attachments (Inside Destination Modal)**
        *   **Action:** User drags and drops PDF tickets or image references into an "Attachments" zone.
        *   *System action:* File uploads directly to Supabase Storage; URL is saved to the Attachment database table linked to this Destination ID.
    *   **Action (Save):** User clicks "Save Destination". Modal closes.
    *   **Result:** The destination block now appears on the timeline view. User can drag and drop it to reorder.

*   **3.3 Adding Logistics (Transport/Accommodation)**
    *   **Action:** User switches to the "Logistics" tab and clicks "Add Flight" or "Add Hotel".
    *   **3.3.1 Logistics Modal**
        *   User enters details (Booking Ref, Dates/Times, Provider).
        *   Can optionally attach booking confirmation PDFs as in step 3.2.2.
    *   **Action (Save):** Clicks Save. The item is added to the Logistics list.

---

## 4. Settings & Account Management Flow

**Goal:** Allow users to manage their profiles and handle destructive actions.

*   **4.1 Profile Menu (`/profile`)**
    *   **Action:** User clicks avatar in top-right nav.
    *   **Options:** Update password, View active sessions, Log Out.
*   **4.2 Deleting a Trip**
    *   **Action:** Inside the Trip Settings view (from 3.1), user clicks "Delete Trip".
    *   **Action (Confirmation):** A highly visible modal warns the user this is irreversible. User must type the trip name to confirm.
    *   *System action:* Supabase cascades deletions (removes Trip, and automatically deletes child Destinations, child Logistics, and associated File Attachments in Storage). Redirects user back to `/dashboard`.
