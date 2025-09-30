Testing Documentation
=====================

1. `check-middleware.test.ts` - Clerk Middleware Configuration Test
-------------------------------------------------------------------

**What it is:** This is a unit test for the Next.js middleware configuration file. It ensures the middleware is properly set up to integrate with Clerk for authentication.

**What it tests:**

- **Existence of Middleware:** Verifies that the middleware file exports a default function, confirming the basic structure is correct.
- **Configuration Matcher:** Checks that the middleware configuration object contains a ``matcher`` array. This array defines which application routes should be protected by Clerk's authentication, ensuring security rules are technically enforceable.

**Purpose:** This test acts as a critical security checkpoint. It guarantees that the foundational layer of authentication is present and configured before the application runs, preventing unprotected access to sensitive routes.

2. `cn.test.ts` - CSS Class Name Utility Test
---------------------------------------------

**What it is:** This is a unit test for the ``cn`` utility function, a small but crucial helper that merges CSS class names using ``clsx`` and resolves conflicts with ``tailwind-merge``.

**What it tests:**

- **Basic Merging:** Confirms the function can merge multiple string arguments into a single, space-separated class string.
- **Conditional Classes:** Validates that it correctly handles conditional object syntax, including classes only if their value is truthy.
- **Conflict Resolution:** Ensures that when conflicting Tailwind classes are provided (e.g., ``p-4`` and ``p-2``), the function uses ``tailwind-merge`` to intelligently resolve them, applying the latter-defined class.
- **Edge Cases:** Tests that it properly handles arrays and filters out ``undefined`` or ``null`` values, preventing invalid classes from appearing in the DOM.

**Purpose:** This test ensures consistent and predictable styling across the entire application. A bug in this utility could break the UI of every component, so its reliability is paramount.

3. `create-client.test.ts` - Supabase Browser Client Test
---------------------------------------------------------

**What it is:** This is a unit test for the function that creates the Supabase client for browser-side usage.

**What it tests:**

- **Environment Variables:** Verifies the function correctly retrieves and uses the ``NEXT_PUBLIC_SUPABASE_URL`` and ``NEXT_PUBLIC_SUPABASE_ANON_KEY`` environment variables to initialize the client.
- **Client Creation:** Checks that the function calls the underlying ``createBrowserClient`` library with the correct parameters from the environment.
- **Error Handling:** Ensures the function throws a meaningful error if the required environment variables are missing, failing fast and explicitly during the build or startup process instead of causing cryptic runtime errors.
- **Return Value:** Confirms the function returns the client instance created by the Supabase library.

**Purpose:** This test validates the crucial connection between the frontend application and its database. It ensures the app can securely and correctly establish a connection to Supabase.

4. `forum-db.test.ts` - Forum Database Operations Test
------------------------------------------------------

**What it is:** This is a comprehensive **integration test suite** for all forum-related database operations, testing the complete data layer for the community features.

**What it tests:**

- **Post Management:** Tests fetching posts with pagination, creating new posts with content moderation, and retrieving individual posts with view counting.
- **Reply System:** Tests creating replies, handling nested replies, and proper notification triggering for post authors and parent reply authors.
- **Like/Unlike Functionality:** Tests the complete like/unlike flow for both posts and replies, including state management.
- **User Activity Tracking:** Tests calculation of user statistics including posts created, replies made, and likes received.
- **Notification System:** Tests creating notifications, marking them as read, and counting unread notifications.
- **Content Moderation:** Tests integration with profanity filtering for both posts and replies.
- **Error Handling:** Comprehensive error testing for all database operations, ensuring graceful failure handling.

**Purpose:** This test suite ensures the entire forum ecosystem works reliably, from basic CRUD operations to complex features like notifications and content moderation.

5. `forums.test.tsx` - Community Forums Frontend Test
-----------------------------------------------------

**What it is:** This is an **integration test** for the main Community Forums page component, testing the complete user interface and interactions.

**What it tests:**

- **Page Rendering:** Verifies the forum page loads with correct headings, descriptions, and initial content.
- **Post Creation:** Tests the complete flow of creating a new discussion post, including form validation, tag management, and category/language selection.
- **Content Moderation:** Tests profanity detection and blocking during post creation.
- **Search & Filtering:** Tests search functionality, category filtering, and language-based filtering.
- **Pagination:** Tests "Load More" functionality and proper handling of pagination states.
- **User Interactions:** Tests all user actions including liking posts, creating replies, and managing post content.
- **State Management:** Tests loading states, error states, empty states, and success states throughout the user journey.
- **Performance:** Tests efficient rendering of multiple posts and optimal user experience.

**Purpose:** This test ensures the community forums provide a smooth, reliable experience for users to discuss and share knowledge.

6. `forums-id.test.tsx` - Individual Discussion Page Test
---------------------------------------------------------

**What it is:** This is a **component integration test** for individual discussion thread pages, testing deep forum functionality.

**What it tests:**

- **Discussion Rendering:** Tests loading and displaying individual posts with all metadata (author, timestamps, tags, like counts).
- **Reply System:** Tests the complete reply functionality including replying to the main post and nested replies to other users.
- **Like Interactions:** Tests liking/unliking both the main post and individual replies.
- **User Authentication:** Tests different behaviors for logged-in vs logged-out users.
- **Content Moderation:** Tests profanity filtering specifically for replies.
- **Error Handling:** Tests graceful handling of missing posts, network errors, and failed operations.
- **UI States:** Tests loading states during reply submission, form validation, and cancellation flows.
- **Navigation:** Tests breadcrumb navigation and back-to-forums functionality.

**Purpose:** This test ensures that individual discussion threads work flawlessly, providing a rich interaction experience for community engagement.

7. `learn.test.tsx` - Course Learning Interface Test
----------------------------------------------------

**What it is:** This is a **comprehensive integration test** for the course learning page, testing the complete educational experience.

**What it tests:**

- **Course Navigation:** Tests lesson progression, sidebar navigation, and mobile-responsive layout.
- **Content Type Handling:** Tests all learning content types:
  - Video players with play/pause functionality
  - Audio lessons with playback controls
  - Text-based lessons with proper formatting
  - Interactive exercises (multiple choice, fill-in-blank)
- **Progress Tracking:** Tests lesson completion marking, automatic progress updates, and course enrollment.
- **User Progress:** Tests streak tracking, completion states, and progress persistence.
- **Error Handling:** Tests graceful handling of missing content, network errors, and invalid course data.
- **Mobile Experience:** Tests responsive design and mobile-specific interactions.
- **Discussion Integration:** Tests access to course discussion forums.

**Purpose:** This test ensures the core learning functionality works reliably across all content types and provides a seamless educational experience.

8. `learn-endpoints.test.ts` - Learning Progress API Test
---------------------------------------------------------

**What it is:** This is an **integration test suite** for the learning progress tracking and course enrollment APIs.

**What it tests:**

- **Course Content Fetching:** Tests retrieving course data with nested units and lessons.
- **Progress Management:** Tests the complete progress tracking system:
  - Creating new progress records
  - Updating existing progress
  - Calculating completion percentages
  - Handling course completion states
- **Enrollment System:** Tests course enrollment, enrollment checks, and error handling.
- **Complex Calculations:** Tests progress percentage calculations with various lesson counts and completion states.
- **Edge Cases:** Tests zero-lesson courses, 100% completion scenarios, and data consistency.
- **Error Scenarios:** Tests database failures, missing records, and invalid operations.

**Purpose:** This test ensures that student progress is accurately tracked and persisted, which is critical for the educational value of the platform.

9. `profile.test.tsx` - Comprehensive User Profile Test
-------------------------------------------------------

**What it is:** This is an extensive **integration test suite** for the user Profile page, covering all its tabs and functionalities.

**What it tests:**

- **Data Loading & Display:** Tests that the page correctly fetches and displays user profile data, statistics, enrolled courses, and achievements.
- **Tab Functionality:** Verifies that all tabs (Overview, Courses, Achievements, Settings) are present, clickable, and display the correct content when selected.
- **Edit Functionality:** Tests the full cycle of editing the user's profile:
  - Entering edit mode
  - Updating fields (name, bio, location, etc.)
  - Saving changes and verifying the UI updates
  - Ensuring certain fields (like email) are correctly disabled
- **Conditional Rendering & Edge Cases:**
  - Displaying placeholder text for empty fields
  - Showing empty states for users with no courses or achievements
  - Handling avatar fallbacks when no profile picture is set
  - Gracefully handling errors from failed API calls
- **Stats and Progress:** Validates that progress bars, streak counters, and completion metrics are calculated and displayed accurately.

**Purpose:** This test ensures the user's personal dashboard is fully functional, reliable, and provides a good user experience. It covers a wide range of states and interactions, making it critical for a part of the application that is central to user identity and progress tracking.

10. `profile-endpoints.test.ts` - User Profile Data API Test
------------------------------------------------------------

**What it is:** This is an **integration test suite** for user profile data management and statistics APIs.

**What it tests:**

- **Profile Data Retrieval:** Tests fetching user profile information from the database.
- **Course Management:** Tests retrieving user's enrolled courses with progress data.
- **Progress Tracking:** Tests fetching user learning progress across all courses.
- **Statistics Calculation:** Tests complex statistical calculations for:
  - Learning streaks (current and longest)
  - Course completion rates
  - Lesson completion counts
  - Language learning diversity
- **Achievement System:** Tests achievement tracking, progress updates, and earned status.
- **Error Handling:** Tests graceful degradation when database queries fail.
- **Data Transformation:** Tests proper formatting and structuring of user data for frontend consumption.

**Purpose:** This test ensures that all user-facing data is accurately calculated and reliably served to the profile interface.

11. `prompts.test.ts` - AI System Prompt Configuration Test
-----------------------------------------------------------

**What it is:** This is a unit test for the AI system prompt configuration used in quiz generation.

**What it tests:**

- **Prompt Structure:** Verifies that the system prompt is a non-empty string with proper instructional content.
- **Required Sections:** Checks that all necessary instructional sections are present (question types, formatting rules, hint guidelines).
- **Formatting Rules:** Validates that JSON output requirements and response structure rules are properly defined.
- **Content Guidelines:** Ensures rules for hints, explanations, and answer validation are correctly specified.

**Purpose:** This test guarantees that the AI quiz generation system receives proper instructions, ensuring consistent and high-quality exercise generation.

12. `server.test.ts` - Server-Side Database Helper Test
-------------------------------------------------------

**What it is:** This is a unit test for server-side database utility functions, specifically those related to user management during the authentication process.

**What it tests:**

- **``insertUser`` Function:** Tests the function that creates a new user in the database after they sign up with Clerk. It verifies the correct table is targeted, the correct user data (Clerk ID, name, email) is inserted, and the function handles both success and database errors appropriately.
- **``checkUserExists`` Function:** Tests the function that checks if a user already exists in the database based on their Clerk ID. It validates the query logic for both existing users (returns ``true``) and new users (returns ``false``) and ensures it throws errors on database failures.

**Purpose:** These tests secure the user onboarding process. They guarantee that the synchronization between Clerk (authentication provider) and the application's database (user profiles) works flawlessly, which is fundamental to the application's operation.

13. `client.test.ts` - Client-Side Database Operations Test
-----------------------------------------------------------

**What it is:** This is a comprehensive **integration test suite** that mocks Supabase to test the data access layer functions (``/utils/db/client.ts``). It tests the logic of client-side database operations without making real network calls.

**What it tests:**

- **Data Fetching (``getAllCourses``, ``getRecommendedCourses``):** Tests the complex query that joins multiple tables (courses, languages, users, tags, feedback) and verifies the function correctly transforms the raw database data into the simplified format expected by the frontend UI.
- **Data Manipulation (``addToFavorites``, ``removeFromFavorites``):** Tests the INSERT and DELETE operations on the junction table for user favorites, ensuring they succeed and handle errors gracefully.
- **Complex Query & Data Transformation (``getCourseById``):** Tests a deeply nested query that fetches all data for a course overview page, including author info, reviews, and the curriculum (units and lessons). It validates the complex transformation of this data into a frontend-ready object.
- **State Checks (``checkIfFavorited``, ``checkIfEnrolled``):** Tests queries that check for the existence of a record, ensuring they return the correct boolean value (``true``/``false``) and handle "not found" errors appropriately.
- **User Data Operations:** Tests user profile retrieval, progress tracking, achievement loading, and personalized course recommendations.
- **Error Handling:** Every test includes a case for simulating a database error, ensuring the functions do not crash but instead throw predictable, catchable errors.

**Purpose:** These tests are the backbone of the application's reliability. They guarantee that all the logic for reading and writing data to the database is sound, the data transformations are correct, and errors are handled properly, ensuring a stable backend for the frontend to rely on.

Test Categories Summary
-----------------------

Frontend Component Tests
~~~~~~~~~~~~~~~~~~~~~~~~

- **``forums.test.tsx``** - Main forums page with post creation and filtering
- **``forums-id.test.tsx``** - Individual discussion threads with replies
- **``learn.test.tsx``** - Course learning interface with all content types
- **``profile.test.tsx``** - User profile dashboard with multiple tabs

Backend API & Database Tests
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

- **``forum-db.test.ts``** - Complete forum data layer operations
- **``learn-endpoints.test.ts``** - Learning progress and enrollment APIs
- **``profile-endpoints.test.ts``** - User statistics and achievement APIs
- **``client.test.ts``** - Client-side database operations and transformations
- **``server.test.ts``** - Server-side user management utilities

Utility & Configuration Tests
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

- **``check-middleware.test.ts``** - Authentication middleware configuration
- **``cn.test.ts``** - CSS class name utility function
- **``create-client.test.ts``** - Database client initialization
- **``prompts.test.ts``** - AI system prompt configuration

Testing Strategy
----------------

The test suite employs a multi-layered approach:

1. **Unit Tests** - Isolated testing of pure functions and utilities
2. **Integration Tests** - Testing component interactions and data flow
3. **API Tests** - Backend endpoint and database operation testing
4. **End-to-End Coverage** - Complete user journey testing across features

This comprehensive testing strategy ensures application reliability across all layers, from UI interactions to database operations and third-party service integrations.