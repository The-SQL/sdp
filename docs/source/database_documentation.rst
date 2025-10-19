Database Documentation
======================

1. Overview
----------

The database for our learning and course management system is built using **PostgreSQL**, chosen for its reliability, advanced relational features, and JSONB support.
The schema follows a **normalized, modular, and relational design** that ensures data integrity, scalability, and flexibility for future system expansion.

The database is designed to support multiple application domains, including:

- Course creation and enrollment
- User progress and achievements
- Discussion forums and feedback
- Gamification features (streaks, goals, and rewards)
- Flashcards and quizzes for practice
- Notifications and collaborative editing

Each table has been carefully structured to ensure logical relationships, data consistency, and efficient querying.

2. Core Design Philosophy
------------------------

The schema adheres to **third normal form (3NF)**, reducing redundancy and ensuring that each table stores a single, well-defined entity.
It employs:

- **UUIDs** for primary keys to guarantee uniqueness across distributed systems.
- **Foreign key constraints** to maintain referential integrity between entities.
- **CHECK constraints** and **UNIQUE constraints** for data validation.
- **Timestamp fields** with timezone awareness for accurate temporal tracking.
- **JSONB columns** to allow flexible and semi-structured data where appropriate.

All these elements together result in a schema that is **clean, efficient, and future-proof**.

3. Entity Overview and Relationships
-----------------------------------

The database consists of several interconnected entities grouped into functional domains.

A. User Management
~~~~~~~~~~~~~~~~~

**Tables:** `users`, `user_streaks`, `login_days`, `learning_goals`, `notifications`, `user_achievements`

- **users** is the central identity table, linked to Clerk authentication (`clerk_id`) instead of storing passwords locally — ensuring strong security practices.
- **user_streaks** tracks each user’s active and longest streaks with validation (`CHECK` constraints ensure non-negative values).
- **login_days** logs daily user activity to calculate streaks.
- **learning_goals** lets users set personal milestones with completion tracking.
- **notifications** delivers system and user-based alerts with flexible metadata stored in JSONB.
- **user_achievements** connects users to achievements they have earned, enabling gamification.

Each table references `users(clerk_id)` to maintain consistent user identity across all modules.

B. Learning Content Structure
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Tables:** `courses`, `units`, `lessons`, `media`, `quizzes`

This set of tables represents the hierarchical structure of course content:

- **courses** defines the course metadata (title, author, difficulty, language, and publication status).
- **units** group lessons under a course.
- **lessons** represent individual content elements, constrained by valid `content_type` values (video, text, audio, exercise).
- **media** links files (audio, images, etc.) to specific lessons.
- **quizzes** store structured assessment questions tied to lessons.

**Relationships:**

- One **course** → many **units**
- One **unit** → many **lessons**
- One **lesson** → many **media** and **quizzes**

These relationships enable modular course building, structured sequencing, and reusability of components.

C. User Progress and Learning Data
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Tables:** `user_courses`, `user_progress`

This group tracks how users interact with and perform in courses.

- **user_courses** links each user to enrolled courses, with progress stored as a percentage (validated via `CHECK (0–100)`).
- **user_progress** stores per-lesson completion states (`not_started`, `in_progress`, `completed`).

These tables together form the analytics backbone of the learning system, allowing for performance tracking and progress visualization.

D. Community and Collaboration
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Tables:** `forum_posts`, `forum_replies`, `forum_post_likes`, `forum_reply_likes`, `collaborators`, `suggested_edits`, `course_feedback`, `feedback_upvotes`

This domain supports interactive and collaborative features:

- **forum_posts** and **forum_replies** enable threaded discussions. Each post can have multiple replies, and replies can nest recursively through `parent_reply_id`.
- **forum_post_likes** and **forum_reply_likes** implement social engagement tracking.
- **collaborators** allows multiple users to co-manage or contribute to a course.
- **suggested_edits** supports a collaborative workflow where users propose content changes, stored as JSONB payloads for flexibility.
- **course_feedback** and **feedback_upvotes** enable feedback collection and endorsement.

These structures mirror modern forum and collaborative editing systems, encouraging user engagement and quality contributions.

E. Gamification and Motivation
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Tables:** `achievements`, `user_achievements`, `learning_goals`, `user_streaks`

Gamification elements are embedded directly in the schema:

- **achievements** define the reward system, with flexible `requirement` criteria (JSONB format for adaptable conditions).
- **user_achievements** stores earned rewards, progress levels, and timestamps for achievement completion.
- **learning_goals** and **user_streaks** complement achievements by promoting continuous learning habits.

This approach makes the system inherently motivating, measurable, and personalized.

F. Flashcards and Memory Reinforcement
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Tables:** `flashcard_sets`, `flashcards`, `user_flashcard_progress`

Flashcards are designed for adaptive learning:

- **flashcards** hold front and back content.

G. Tagging and Metadata
~~~~~~~~~~~~~~~~~~~~~~

**Tables:** `tags`, `course_tags`, `languages`

- **tags** and **course_tags** establish a many-to-many relationship between courses and topics.
- **languages** defines available languages for multilingual support and filtering.

These tables enhance discoverability, filtering, and personalization of course content.

4. Referential Integrity and Constraints
---------------------------------------

Every relationship in the schema is **strictly enforced** with `FOREIGN KEY` constraints:

- Prevent orphan records (e.g., lessons cannot exist without a unit, and feedback cannot exist without a user or course).
- Maintain consistency and traceability throughout the system.

**CHECK constraints** are widely used to validate data ranges (e.g., ratings between 1–5, progress between 0–100, mastery levels 0–5).
**UNIQUE constraints** prevent duplicate entries such as email addresses, language names, and tag names.

This approach ensures high data reliability and eliminates the need for excessive validation logic in the application layer.

5. Use of UUIDs and Timestamps
-----------------------------

Each entity uses:

- `id uuid DEFAULT gen_random_uuid()` — ensuring globally unique identifiers.
- `created_at` and `updated_at` columns — ensuring accurate time tracking across time zones using `timestamp with time zone`.

This design:

- Enables horizontal scaling (no sequence dependency).
- Maintains accurate audit trails.
- Supports distributed operations and event replay in the future.

6. JSONB and Flexible Schema Design
----------------------------------

The use of `jsonb` provides schema flexibility where rigid columns would be limiting:

- `lessons.content` allows storing structured lesson material (e.g., multimedia, text, exercises).
- `achievements.requirement` defines dynamic conditions for earning badges.
- `notifications.metadata` can hold diverse notification details.
- `suggested_edits.payload` captures structured change requests.

This combination of relational and document-oriented modeling reflects modern PostgreSQL best practices for hybrid systems.

7. Scalability and Indexing
--------------------------

- Every primary key and foreign key automatically generates indexes, optimizing joins and lookups.
- The database can efficiently handle high read/write traffic, typical in e-learning platforms.
- Partitioning or sharding can be added in the future due to the UUID-based design.

The schema’s modularity allows new features (like additional content types or gamification rules) to be introduced without disrupting the core structure.

8. Security and Compliance
-------------------------

- User authentication and identity management rely on external providers (Clerk), ensuring no sensitive credentials are stored in the database.
- The schema avoids storing any personally identifiable information (PII) beyond necessary attributes like name and email.
- Role management and access control can easily be added via relationships to `users` or an additional `roles` table if needed.

This design aligns with modern privacy and security standards such as **GDPR** and **OWASP** recommendations.

9. Best Practice Compliance Summary
----------------------------------

- **Primary Keys**: UUID on all tables — Unique, scalable IDs
- **Referential Integrity**: Foreign key constraints — Prevents orphaned data
- **Normalization**: Up to 3NF — Reduces redundancy
- **Data Validation**: CHECK & UNIQUE constraints — Prevents invalid entries
- **Timestamps**: Timezone-aware — Accurate time tracking
- **Security**: Third-party auth (Clerk) — No passwords stored
- **Scalability**: UUID + modular schema — Future-proof architecture
- **Extensibility**: JSONB fields — Flexible structure
- **Indexing**: Auto-indexed FK/PK — Fast lookups and joins

10. Summary
-----------

This database schema exemplifies **well-engineered relational design** — combining normalization, referential integrity, and extensibility with a hybrid approach using JSONB.
It supports all critical features of a learning platform — from course creation and tracking to community interaction and gamified motivation — while maintaining high standards for performance, security, and scalability.

Overall, the database is **robust, logically structured, and aligned with PostgreSQL best practices**, making it an ideal backbone for a production-grade, user-centric learning system.
