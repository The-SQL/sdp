Developer Guide
==============

Developer Guides
---------------

This is an overview developer guide for the OSLearn codebase. It covers how to run, test, and work on the project, plus where key code lives. The project is built using **Next.js (App Router)** as its framework, written in **TypeScript**, styled with **Tailwind CSS**, and uses **Clerk** for authentication. The **database** is powered by **Supabase**, tests are handled with **Jest**, and hosting is managed via **Vercel**. The platform uses **Resend** for emailing, and various **Node scripts** can be found under package.json (including dev, build, start, lint, and test).

For the **first setup**, clone the repository and install dependencies using:

``git clone https://github.com/The-SQL/sdp.git``, then ``cd sdp`` and ``npm install``.

Next, create a .env.local file in the project root and add the following environment variables:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- RESEND_API_KEY
- OPENAI_API_KEY
- QUIZ_ENGINE_API_KEY_PUBLIC
- CONTENT_MODERATION_API_KEY

For a **new team member**, these keys are available under **Vercel → Project Settings → Environment Variables**. For an **external viewer**, set up your own API keys using the links listed in the Quick Facts section. To start the local server, run ``npm run dev``.

The **project structure (high level)** is organized as follows:

- src/ — Application code
- src/app/ — Page routes and colocated project files
- src/components/ — UI components
- src/lib/ and src/utils/ — Helpers, small utilities, and integrations
- src/middleware.ts — App middleware using Clerk
- public/ — Static assets
- __tests__/ — Jest tests
- package.json — Scripts and dependencies
- tsconfig.json — TypeScript configuration
- next.config.ts — Next.js settings

Architecture Overview (high level)
---------------------------------

This project is a **Next.js (App Router)** full-stack web application with a small number of clearly separated concerns. At a high level, the system is composed of distinct modules that interact seamlessly to deliver a cohesive user experience. The **Next.js app (src/app/)** handles routing, server and client components, page-level data fetching, and layout composition. Server components are primarily used for data-heavy rendering to improve performance and reduce client-side overhead, while client components are positioned in the component tree wherever interactivity is required. The **UI components (src/components/)** consist of presentational and composable React elements such as buttons, lists, forms, and layout structures. The design philosophy emphasizes small, focused components with colocated styles when necessary to maintain modularity, reusability, and clarity across the codebase.

Feature Summary
---------------

The **OSLearn platform** is organized into several key functional modules. **Courses** represent authored learning paths consisting of courses, units, and lessons. **Flashcards** implement a spaced-repetition system to aid long-term retention, managed through entities such as flashcard_sets and user_flashcard_progress. The **Forum** enables community interaction via posts, replies, and likes, stored under forum_posts and forum_replies. **Quizzes** provide lesson-based assessments tracked in the quizzes and quiz_attempts tables. The **User System** manages learner progress, streaks, and achievements using users and user_progress tables. **Collaboration** features allow multiple course contributors to co-author and refine learning content through collaborators and suggested_edits. Finally, **Notifications and Feedback** handle in-app updates, user reviews, and engagement prompts to ensure an interactive and responsive learning experience.

Database Seeding Guide
---------------------

Use the Supabase SQL editor to create tables in the correct order.

```sql
CREATE TABLE public.achievements (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    type text NOT NULL,
    description text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    name text NOT NULL DEFAULT ''::text,
    icon_url text,
    requirement jsonb,
    CONSTRAINT achievements_pkey PRIMARY KEY (id)
);

CREATE TABLE public.collaborators (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    course_id uuid NOT NULL,
    status text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT collaborators_pkey PRIMARY KEY (id),
    CONSTRAINT fk_collab_user FOREIGN KEY (user_id) REFERENCES public.users(clerk_id),
    CONSTRAINT fk_collab_course FOREIGN KEY (course_id) REFERENCES public.courses(id)
);

CREATE TABLE public.course_feedback (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    course_id uuid NOT NULL,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT course_feedback_pkey PRIMARY KEY (id),
    CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES public.users(clerk_id),
    CONSTRAINT fk_feedback_course FOREIGN KEY (course_id) REFERENCES public.courses(id)
);

CREATE TABLE public.course_tags (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    course_id uuid NOT NULL,
    tag_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT course_tags_pkey PRIMARY KEY (id),
    CONSTRAINT fk_ct_course FOREIGN KEY (course_id) REFERENCES public.courses(id),
    CONSTRAINT fk_ct_tag FOREIGN KEY (tag_id) REFERENCES public.tags(id)
);

CREATE TABLE public.courses (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    author_id text NOT NULL,
    title text NOT NULL,
    description text,
    difficulty text,
    estimated_duration text,
    learning_objectives text,
    profile_url text,
    is_public boolean NOT NULL DEFAULT false,
    is_published boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    language_id uuid NOT NULL,
    open_to_collab boolean NOT NULL DEFAULT true,
    language_name text,
    CONSTRAINT courses_pkey PRIMARY KEY (id),
    CONSTRAINT courses_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(clerk_id),
    CONSTRAINT courses_language_id_fkey FOREIGN KEY (language_id) REFERENCES public.languages(id)
);

CREATE TABLE public.feedback_upvotes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    feedback_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT feedback_upvotes_pkey PRIMARY KEY (id),
    CONSTRAINT fk_upvote_user FOREIGN KEY (user_id) REFERENCES public.users(clerk_id),
    CONSTRAINT fk_upvote_feedback FOREIGN KEY (feedback_id) REFERENCES public.course_feedback(id)
);

CREATE TABLE public.flashcard_sets (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    author_id text,
    title text,
    language_id uuid,
    language_name text,
    visibility text,
    description text,
    CONSTRAINT flashcard_sets_pkey PRIMARY KEY (id),
    CONSTRAINT flashcard_sets_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(clerk_id),
    CONSTRAINT flashcard_sets_language_id_fkey FOREIGN KEY (language_id) REFERENCES public.languages(id)
);

CREATE TABLE public.flashcards (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    front text NOT NULL,
    back text NOT NULL,
    flashcard_set_id uuid,
    created_at timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text),
    CONSTRAINT flashcards_pkey PRIMARY KEY (id),
    CONSTRAINT flashcards_flashcard_set_id_fkey FOREIGN KEY (flashcard_set_id) REFERENCES public.flashcard_sets(id)
);

CREATE TABLE public.forum_post_likes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    post_id uuid NOT NULL,
    user_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT forum_post_likes_pkey PRIMARY KEY (id),
    CONSTRAINT forum_post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.forum_posts(id),
    CONSTRAINT forum_post_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(clerk_id)
);

CREATE TABLE public.forum_posts (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    title text NOT NULL,
    content text NOT NULL,
    author_id text NOT NULL,
    category text NOT NULL,
    language text NOT NULL,
    tags ARRAY DEFAULT '{}'::text[],
    view_count integer DEFAULT 0,
    like_count integer DEFAULT 0,
    reply_count integer DEFAULT 0,
    is_pinned boolean DEFAULT false,
    is_locked boolean DEFAULT false,
    is_hot boolean DEFAULT false,
    last_reply_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT forum_posts_pkey PRIMARY KEY (id),
    CONSTRAINT forum_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(clerk_id)
);

CREATE TABLE public.forum_replies (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    post_id uuid NOT NULL,
    author_id text NOT NULL,
    content text NOT NULL,
    like_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    parent_reply_id uuid,
    CONSTRAINT forum_replies_pkey PRIMARY KEY (id),
    CONSTRAINT forum_replies_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.forum_posts(id),
    CONSTRAINT forum_replies_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(clerk_id),
    CONSTRAINT forum_replies_parent_reply_id_fkey FOREIGN KEY (parent_reply_id) REFERENCES public.forum_replies(id)
);

CREATE TABLE public.forum_reply_likes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    reply_id uuid NOT NULL,
    user_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT forum_reply_likes_pkey PRIMARY KEY (id),
    CONSTRAINT forum_reply_likes_reply_id_fkey FOREIGN KEY (reply_id) REFERENCES public.forum_replies(id),
    CONSTRAINT forum_reply_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(clerk_id)
);

CREATE TABLE public.languages (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    CONSTRAINT languages_pkey PRIMARY KEY (id)
);

CREATE TABLE public.learning_goals (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id text,
    description text NOT NULL,
    target_date date NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    completed boolean DEFAULT false,
    CONSTRAINT learning_goals_pkey PRIMARY KEY (id),
    CONSTRAINT learning_goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(clerk_id)
);

CREATE TABLE public.lessons (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    unit_id uuid NOT NULL,
    title text NOT NULL,
    content_type text NOT NULL CHECK (content_type = ANY (ARRAY['video'::text, 'text'::text, 'audio'::text, 'exercise'::text])),
    content jsonb NOT NULL,
    order_index integer NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    duration smallint NOT NULL CHECK (duration > 0),
    description text,
    CONSTRAINT lessons_pkey PRIMARY KEY (id),
    CONSTRAINT fk_lesson_unit FOREIGN KEY (unit_id) REFERENCES public.units(id)
);

CREATE TABLE public.login_days (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    login_date date NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT login_days_pkey PRIMARY KEY (id),
    CONSTRAINT fk_login_user FOREIGN KEY (user_id) REFERENCES public.users(clerk_id)
);

CREATE TABLE public.media (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    lesson_id uuid NOT NULL,
    type text NOT NULL CHECK (type = ANY (ARRAY['audio'::text, 'image'::text, 'file'::text])),
    url text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT media_pkey PRIMARY KEY (id),
    CONSTRAINT fk_media_lesson FOREIGN KEY (lesson_id) REFERENCES public.lessons(id)
);

CREATE TABLE public.notifications (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    type text NOT NULL CHECK (type = ANY (ARRAY['reply'::text, 'mention'::text, 'like'::text, 'system'::text])),
    source_id uuid NOT NULL,
    source_type text NOT NULL CHECK (source_type = ANY (ARRAY['post'::text, 'reply'::text, 'system'::text])),
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT notifications_pkey PRIMARY KEY (id),
    CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(clerk_id)
);

CREATE TABLE public.quiz_attempts (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    quiz_id uuid NOT NULL,
    score integer,
    attempt_date timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT quiz_attempts_pkey PRIMARY KEY (id),
    CONSTRAINT fk_attempt_user FOREIGN KEY (user_id) REFERENCES public.users(clerk_id),
    CONSTRAINT fk_attempt_quiz FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id)
);

CREATE TABLE public.quizzes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    lesson_id uuid NOT NULL,
    question text NOT NULL,
    question_type text NOT NULL CHECK (question_type = ANY (ARRAY['mcq'::text, 'flashcard'::text, 'fill_blank'::text])),
    options jsonb,
    correct_answer jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT quizzes_pkey PRIMARY KEY (id),
    CONSTRAINT fk_quiz_lesson FOREIGN KEY (lesson_id) REFERENCES public.lessons(id)
);

CREATE TABLE public.suggested_edits (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    collaborator_id text NOT NULL,
    course_id uuid NOT NULL,
    payload jsonb NOT NULL,
    status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    summary text NOT NULL,
    reviewed_by text,
    reviewed_at timestamp with time zone,
    CONSTRAINT suggested_edits_pkey PRIMARY KEY (id),
    CONSTRAINT fk_sedit_course FOREIGN KEY (course_id) REFERENCES public.courses(id),
    CONSTRAINT suggested_edits_collaborator_id_fkey FOREIGN KEY (collaborator_id) REFERENCES public.users(clerk_id),
    CONSTRAINT suggested_edits_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(clerk_id)
);

CREATE TABLE public.tags (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    CONSTRAINT tags_pkey PRIMARY KEY (id)
);

CREATE TABLE public.units (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    course_id uuid NOT NULL,
    title text NOT NULL,
    order_index integer NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    description text,
    CONSTRAINT units_pkey PRIMARY KEY (id),
    CONSTRAINT fk_unit_course FOREIGN KEY (course_id) REFERENCES public.courses(id)
);

CREATE TABLE public.user_achievements (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    achievement_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    progress integer DEFAULT 0,
    earned boolean NOT NULL DEFAULT false,
    earned_at timestamp with time zone,
    CONSTRAINT user_achievements_pkey PRIMARY KEY (id),
    CONSTRAINT fk_user_achievements_user FOREIGN KEY (user_id) REFERENCES public.users(clerk_id),
    CONSTRAINT fk_user_achievements_achievement FOREIGN KEY (achievement_id) REFERENCES public.achievements(id)
);

CREATE TABLE public.user_courses (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    course_id uuid NOT NULL,
    enrolled_at timestamp with time zone NOT NULL DEFAULT now(),
    completed_at timestamp with time zone,
    overall_progress numeric DEFAULT 0 CHECK (overall_progress >= 0::numeric AND overall_progress <= 100::numeric),
    CONSTRAINT user_courses_pkey PRIMARY KEY (id),
    CONSTRAINT fk_uc_user FOREIGN KEY (user_id) REFERENCES public.users(clerk_id),
    CONSTRAINT fk_uc_course FOREIGN KEY (course_id) REFERENCES public.courses(id)
);

CREATE TABLE public.user_favorite_courses (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    course_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT user_favorite_courses_pkey PRIMARY KEY (id),
    CONSTRAINT fk_favorite_user FOREIGN KEY (user_id) REFERENCES public.users(clerk_id),
    CONSTRAINT fk_favorite_course FOREIGN KEY (course_id) REFERENCES public.courses(id)
);

CREATE TABLE public.user_flashcard_progress (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    flashcard_id uuid NOT NULL,
    next_review_date date,
    interval integer NOT NULL DEFAULT 1 CHECK ("interval" >= 0),
    efactor numeric NOT NULL DEFAULT 2.50,
    last_reviewed date,
    mastery_level integer DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 5),
    CONSTRAINT user_flashcard_progress_pkey PRIMARY KEY (id),
    CONSTRAINT fk_ufp_user FOREIGN KEY (user_id) REFERENCES public.users(clerk_id),
    CONSTRAINT fk_ufp_flashcard FOREIGN KEY (flashcard_id) REFERENCES public.flashcards(id)
);

CREATE TABLE public.user_progress (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    lesson_id uuid NOT NULL,
    status text NOT NULL CHECK (status = ANY (ARRAY['not_started'::text, 'in_progress'::text, 'completed'::text])),
    score integer,
    last_accessed timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT user_progress_pkey PRIMARY KEY (id),
    CONSTRAINT fk_progress_user FOREIGN KEY (user_id) REFERENCES public.users(clerk_id),
    CONSTRAINT fk_progress_lesson FOREIGN KEY (lesson_id) REFERENCES public.lessons(id)
);

CREATE TABLE public.user_streaks (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id text NOT NULL UNIQUE,
    current_streak integer NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
    longest_streak integer NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT user_streaks_pkey PRIMARY KEY (id),
    CONSTRAINT fk_streaks_user FOREIGN KEY (user_id) REFERENCES public.users(clerk_id)
);

CREATE TABLE public.users (
    clerk_id text NOT NULL UNIQUE,
    email text NOT NULL UNIQUE,
    name text NOT NULL,
    profile_url text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    bio text,
    CONSTRAINT users_pkey PRIMARY KEY (clerk_id)
);


Interaction flow (high level)
----------------------------

The **interaction flow** of the OSLearn platform follows a clear and modular architecture that ensures maintainability and predictable behavior during both development and testing. At a high level, the process begins when the **client requests a page or triggers an interaction**. For server-rendered pages, **Next.js server components** or **API routes** invoke helper functions located in src/utils/, which then communicate with **Supabase** or other **external APIs** to retrieve or modify data. The resulting data is returned to the component layer, where it is rendered and displayed to the user. For **client-side interactions**, the system calls client-side helpers or Next.js API routes to handle secure operations without exposing sensitive logic to the frontend. This architecture maintains a clear separation between the **UI layer**, **business logic**, and **infrastructure concerns**, ensuring a scalable structure that supports consistent testing practices and predictable local development workflows.

Environment Variables (keys explained)
-------------------------------------

The **environment configuration** for the OSLearn platform defines a set of required variables that enable integration with external services and secure handling of data across client and server environments. These variables should be declared in a .env.local file during local development. The key variables and their purposes are as follows:

- **NEXT_PUBLIC_SUPABASE_URL (public)**: Specifies the Supabase project’s API endpoint. It is safe to expose to the browser since it only identifies the project URL.
- **NEXT_PUBLIC_SUPABASE_ANON_KEY (public)**: The Supabase anonymous key used by client-side code with limited permissions configured in Supabase, making it safe for public exposure.
- **SUPABASE_SERVICE_ROLE_KEY (secret)**: The service role key that grants elevated privileges and must be used **only server-side** for migrations, privileged operations, and background processes.
- **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (public)**: The Clerk publishable key utilized for client-side authentication flows and is safe to expose.
- **RESEND_API_KEY (secret)**: Used to authenticate with the Resend email service and should be used exclusively on the server side for sending emails or verifying webhooks.
- **OPENAI_API_KEY (secret)**: Enables communication with OpenAI or other large language model providers and must remain confidential, accessed only via server-side code or secure proxies.
- **QUIZ_ENGINE_API_KEY_PUBLIC (public)**: Used if the quiz engine provides a client-safe public key; otherwise, it should be treated as a secret.
- **CONTENT_MODERATION_API_KEY (secret)**: Authenticates access to external content moderation services and must be kept server-side to prevent misuse.

In summary, **variables prefixed with NEXT_PUBLIC are safe for client-side exposure**, while all others must be treated as **confidential** and restricted to server-side execution or build-time contexts to maintain system security and data integrity.

Development Standards
--------------------

The **development standards** for the OSLearn platform are designed to ensure that the codebase remains consistent, readable, and maintainable as the project evolves. These standards define conventions for naming, folder structure, and design patterns to promote uniformity across contributors and simplify collaboration.

**Naming conventions** are as follows:

- Files and folders use *kebab-case* (e.g., app-sidebar.tsx, use-mobile.ts).
- **React components** use *PascalCase* for filenames and exported names (e.g., AppSidebar, NotificationBell).
- **Hooks** are prefixed with use and written in *camelCase* (e.g., useMobile).
- **Types and interfaces** follow *PascalCase* and may include descriptive suffixes for clarity (e.g., UserProfile, CourseItemProps).
- **Utility functions** use *camelCase* (e.g., formatDate).

For **folder structure**:

- All route files are placed under src/app/ where Next.js expects them.
- Reusable UI components are stored in src/components/, with feature-specific components grouped within relevant subfolders (e.g., components/courses/).
- Database helpers and third-party integrations reside in src/utils/, with a clear separation between client and server helpers (e.g., client.ts vs. server.ts).
- Tests are maintained in the __tests__/ directory.

The **preferred development patterns** emphasize separation of concerns and maintainability:

- Server components are preferred for data fetching to improve performance, while client components are reserved for interactive UI and must include "use client" at the top of the file.
- All database calls are centralized in src/utils/ to keep components pure and easily testable.
- Errors should be returned as structured objects and handled gracefully at the boundary level (API route or component), avoiding silent failures.
- Side effects such as email sends or external API calls should be restricted to server-only code paths.
- Developers are encouraged to build **small, composable components** that each serve a single purpose, and to use **explicit types or interfaces** for all exported functions and component props to maintain strong type safety and code clarity.

Deployment
----------

Deployments for the OSLearn platform are managed through Vercel, which serves as the hosting platform configured specifically for Next.js applications. The deployment process follows a straightforward Git-based workflow, where pushes to branches such as main, dev, or individual feature branches automatically trigger corresponding Vercel preview or production deployments. For continuous integration (CI) gating, the repository can optionally integrate with GitHub Actions to execute automated tests and linting routines before merge approval, ensuring that only verified changes are deployed.

To add environment variables on Vercel, navigate to the project’s dashboard and open Settings → Environment Variables. Each variable should be added by name, selecting the correct environment—Development, Preview, or Production—for deployment. Sensitive variables (those without the NEXT_PUBLIC prefix) must only be defined in environments where they are strictly required and should never be exposed to the client side. Once variables are added or updated, redeploy the project or allow Vercel to automatically apply the changes during the next deployment cycle.

For local development, developers should create a .env.local file in the project root directory containing the same environment variables used in production. This file allows for seamless replication of the production environment locally. Importantly, the .env.local file must never be committed to version control, preserving the confidentiality of secret keys and ensuring secure development practices.

Testing Practices
----------------

**Testing Practices** for the OSLearn platform are designed to maintain reliability, prevent regressions, and ensure that both client-side and server-side logic function as intended. The project employs a combination of **unit tests** and **integration tests**, each serving a distinct purpose within the testing strategy.

- **Unit tests** are fast, isolated tests that verify the behavior of single functions or components. They mock all external dependencies such as Supabase, network calls, and Clerk authentication to ensure predictable results. Unit tests are typically colocated with their corresponding implementation files or placed within the __tests__/ directory.
- **Integration tests** evaluate how multiple modules interact when combined. These tests validate the coordination between components such as server helpers, the Supabase client, and API routes. They may use lightweight integration setups or employ test doubles for external services when necessary to simulate realistic interactions without relying on live infrastructure.

The **distinction** between the two testing levels is as follows:

- **Unit tests** focus on verifying a single function or component in complete isolation.
- **Integration tests** assess the correctness of multiple layers working together, such as database access, API routes, and middleware integration.

In terms of **coverage and pull request (PR) requirements**, the project aims for **meaningful test coverage** that prioritizes critical paths such as authentication, database operations, and business logic. A minimum coverage threshold of **80%** is maintained across the codebase, with higher targets encouraged for core modules and reusable components. Every pull request should include tests for any new or modified functionality and must maintain or improve the coverage of affected files. The **Continuous Integration (CI)** pipeline is configured to run ``npm test`` and ``npm run lint`` automatically for all PRs, ensuring that all code merges adhere to established quality and consistency standards.

Contribution Workflow
--------------------

The **contribution workflow** is straightforward: **branch from feat/dev** and use **short, descriptive branch names** so the intent is obvious, for example, feat/flashcards, fix/login-error, or chore/deps. Commit messages follow a **conventional** format: <type>(<scope>): <subject>, where type is one of feat, fix, docs, chore, refactor, or test. For instance: feat(auth): add email verification step. This convention keeps history readable, improves reviewability, and enables lightweight automation and changelog generation.

Adding a feature (recommended small steps)
-----------------------------------------

Start by **creating a new branch from feat/dev** to keep the new work isolated. Then **add or update components** inside src/components/ and adjust related route files under src/app/ as needed. Place any **database access code** in src/utils/db to maintain structure and separation of concerns. Add **unit tests** in the __tests__/ folder to confirm the feature behaves correctly. Run ``npm test`` and ``npm run lint``, fixing any issues that appear. When the feature is ready, **open a pull request** to merge into dev. Once approved, changes from dev are merged into main, completing the addition.

Running and Building
-------------------

**Dev:**

``npm run dev`` starts the local Next.js server with hot reload for rapid iteration.

**Build:**

``npm run build`` creates an optimized production build (checks types, bundles assets).

**Prod:**

``npm run start`` serves the previously built app in production mode.

**Testing:**

``npm test`` or ``npm run test:coverage`` runs unit/integration tests; the latter also reports coverage.

**Linting:**

``npm run lint`` runs ESLint to catch style and common code issues before commits/PRs.

**Troubleshooting:**

- **Build errors:** run ``npm run build`` locally to reproduce and read the full stack trace.
- **Lint errors:** fix issues surfaced by ``npm run lint`` (or use --fix where safe).
- **Test issues:** ``npx jest path-to-test`` to isolate failing specs and iterate faster.
- **Dev issues:** delete the .next/ directory and restart the dev server to clear stale caches.
