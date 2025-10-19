Testing Documentation
====================

This documentation outlines what each test file does, the functionality it tests, and its purpose in the overall testing strategy.

1. check-middleware.test.ts
--------------------------

**Purpose**: Tests the Next.js middleware wrapper for Clerk authentication

- **What it tests**: Verifies that the custom middleware properly wraps Clerk's authentication middleware and exports the correct configuration.
- **Key functionality**:
  - Ensures the default middleware handler is properly defined and exported.
  - Validates that the configuration object contains a matcher array for route matching.
  - Mocks Clerk's `clerkMiddleware` and `createRouteMatcher` to isolate testing of the wrapper logic.
- **Importance**: Critical for ensuring authentication middleware works correctly without making actual API calls to Clerk.

2. client.test.ts
-----------------

**Purpose**: Comprehensive testing of client-side database operations

- **What it tests**: Covers all client-facing database operations including course management, user interactions, favorites, enrollments, and progress tracking.
- **Key functionality**:
  - User existence checks and profile operations.
  - Course creation, updating, and retrieval.
  - Favorite management (adding/removing courses).
  - Enrollment functionality and progress tracking.
  - Image upload to Supabase storage.
  - Learning goals and achievements.
  - Personalized course recommendations.
- **Error handling**: Tests both success and failure scenarios for robust error handling.
- **Importance**: Ensures all user-facing database operations work reliably and handle errors gracefully.

3. cn.test.ts
-------------

**Purpose**: Tests utility function for CSS class merging

- **What it tests**: The `cn` helper function that combines `clsx` and `tailwind-merge` functionality.
- **Key functionality**:
  - Basic class merging.
  - Conditional class application.
  - Conflict resolution between Tailwind classes.
  - Handling of arrays and null/undefined values.
- **Importance**: Ensures consistent and predictable CSS class generation throughout the application.

4. collab.test.ts
-----------------

**Purpose**: Tests collaboration functionality for course development

- **What it tests**: Database operations related to course collaboration features.
- **Key functionality**:
  - Managing course collaborators (adding, removing, updating status).
  - Collaboration request handling.
  - Status updates and cancellation.
- **Error handling**: Comprehensive error scenarios for all collaboration operations.
- **Importance**: Ensures multiple authors can collaborate on courses effectively with proper permission handling.

5. courses.test.ts
------------------

**Purpose**: Tests core course database operations

- **What it tests**: Basic CRUD operations for courses.
- **Key functionality**:
  - Course insertion with proper data return.
  - Course updates and error handling.
- **Importance**: Foundation for all course management functionality.

6. create-client.test.ts
------------------------

**Purpose**: Tests Supabase client creation

- **What it tests**: Environment-based client initialization for Supabase.
- **Key functionality**:
  - Proper environment variable usage.
  - Client instance creation and return.
  - Error handling for missing environment variables.
- **Importance**: Ensures database connectivity is properly configured.

7. flashcards.test.ts
---------------------

**Purpose**: Tests flashcard system functionality

- **What it tests**: Complete flashcard management system.
- **Key functionality**:
  - Flashcard set creation and retrieval.
  - Individual flashcard operations.
  - Author-based and public set filtering.
  - Search functionality within flashcard sets.
- **Importance**: Supports the learning features with reliable flashcard operations.

8. forum-db.test.ts
-------------------

**Purpose**: Tests forum/discussion system database operations

- **What it tests**: Comprehensive forum functionality including posts, replies, likes, and notifications.
- **Key functionality**:
  - Post creation with profanity filtering.
  - Reply system with nested replies.
  - Like/unlike functionality for posts and replies.
  - Notification system for user interactions.
  - User activity tracking and trending topics.
  - Pagination and search in forums.
- **Error handling**: Extensive error scenarios for all forum operations.
- **Importance**: Ensures community features work reliably and handle high user interaction.

9. forums-id.test.tsx & forums.test.tsx
---------------------------------------

**Purpose**: Integration tests for forum UI components

- **What it tests**: React components for forum functionality with user interactions.
- **Key functionality**:
  - Forum page rendering and post display.
  - Post creation with form validation.
  - Reply functionality and threading.
  - Like interactions and real-time updates.
  - User authentication states.
  - Error handling and loading states.
- **Importance**: Ensures the forum UI works correctly with actual user interactions and API integrations.

10. languages.test.ts
---------------------

**Purpose**: Tests language management operations

- **What it tests**: Database operations for language creation and management.
- **Key functionality**:
  - Language creation and insertion.
  - Error handling for language operations.
- **Importance**: Supports the multi-language functionality of the learning platform.

11. learn.test.ts
-----------------

**Purpose**: Tests learning progress and course content functionality

- **What it tests**: Core learning system operations including progress tracking and content management.
- **Key functionality**:
  - Course content retrieval with proper sorting.
  - User progress tracking and updates.
  - Enrollment status checking.
  - Lesson completion tracking.
- **Importance**: Critical for the core learning experience and progress tracking.

12. lessons.test.ts
-------------------

**Purpose**: Tests lesson management operations

- **What it tests**: Database operations for lesson creation and management.
- **Key functionality**:
  - Individual lesson insertion.
  - Bulk lesson operations.
  - Lesson updates and modifications.
- **Importance**: Supports the content creation and management system.

13. profile-endpoints.test.ts & profile.test.tsx
-----------------------------------------------

**Purpose**: Tests user profile functionality

- **What it tests**: Complete user profile system including data fetching, display, and editing.
- **Key functionality**:
  - Profile data retrieval and display.
  - User statistics and achievements.
  - Course progress and history.
  - Profile editing and updates.
  - Tab-based navigation between profile sections.
- **Error handling**: Comprehensive error scenarios for profile operations.
- **Importance**: Ensures user profiles work correctly and display accurate learning data.

14. prompts.test.ts
-------------------

**Purpose**: Tests AI prompt system

- **What it tests**: AI system prompts for instructional content generation.
- **Key functionality**:
  - Prompt content validation.
  - Required instructional sections.
  - Formatting rules for AI responses.
- **Importance**: Ensures AI-generated content follows consistent formatting and instructional guidelines.

15. reviews.test.ts
-------------------

**Purpose**: Tests course review system

- **What it tests**: Database operations for course reviews and ratings.
- **Key functionality**:
  - Review insertion.
  - Error handling for review operations.
- **Importance**: Supports the course rating and feedback system.

16. server.test.ts
------------------

**Purpose**: Tests server-side database operations

- **What it tests**: Comprehensive server-side functionality including user management, course operations, and collaboration features.
- **Key functionality**:
  - User creation and initialization.
  - Author-based course management.
  - Course change request system.
  - Collaboration workflow.
  - Complex query operations with multiple joins.
- **Error handling**: Extensive error scenarios for server operations.
- **Importance**: Ensures server-side operations work correctly and handle complex data relationships.

17. sug-edit.test.ts
--------------------

**Purpose**: Tests suggested edits functionality

- **What it tests**: Database operations for suggested course edits.
- **Key functionality**:
  - Edit suggestion creation.
  - Edit retrieval and status updates.
  - Error handling for edit operations.
- **Importance**: Supports the collaborative editing features for course content.

18. tags.test.ts
----------------

**Purpose**: Tests tag management system

- **What it tests**: Database operations for tag creation and course tagging.
- **Key functionality**:
  - Tag creation.
  - Course-tag relationship management.
  - Bulk tagging operations.
- **Importance**: Supports content categorization and search functionality.

Overall Testing Strategy
-----------------------

This test suite demonstrates a comprehensive testing approach that covers:

1. **Unit Tests**: Isolated function testing (cn, prompts, individual DB operations).
2. **Integration Tests**: Component testing with mocked dependencies (forum UI, profile components).
3. **Database Tests**: Complete coverage of all Supabase operations with proper mocking.
4. **Error Handling**: Consistent testing of both success and failure scenarios.
5. **User Flows**: End-to-end testing of critical user interactions.

The tests are organized by feature domain, making it easy to understand what functionality is being tested and ensuring that all critical paths are covered for a reliable learning platform.