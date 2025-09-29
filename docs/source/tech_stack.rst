Tech Stack
==========

Overview
--------

- **Frontend**: HTML, Tailwind CSS, JavaScript (React with Next.js), ShadCN UI
- **Backend**: Node.js, Express.js
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (audio, images, files)
- **Testing**: Jest + Codecov
- **Deployment Platform**: Vercel
- **Database**: PostgreSQL (via Supabase)
- **AI Integration**: OpenAI API
- **Version Control**: Git & GitHub
- **Linting**: ESLint

Tech Stack Motivation
--------------------

Frontend: React (Next.js) + Tailwind CSS + ShadCN UI
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

- **Next.js**: Enables fast, SEO-friendly pages for course discoverability, with React Server Components (RSC) for dynamic content like quizzes and dashboards.
- **Tailwind CSS**: Facilitates rapid UI customization for diverse lesson formats (text, audio, flashcards) with a utility-first approach, simplifying styling for user-generated content (e.g., markdown-formatted lessons).
- **ShadCN UI**: Provides accessible, pre-built components (e.g., flashcards, progress trackers) that are open-source, avoiding licensing costs.
- The **Lesson Player** and **Course Builder** require reusable, performant components (e.g., drag-and-drop for lesson reordering).

Backend: Node.js + Express.js
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

- Lightweight and scalable for handling API requests (e.g., CRUD operations for courses, progress tracking).
- Seamlessly integrates with **Supabase Auth** and PostgreSQL for real-time updates (e.g., user progress syncing).
- Supports low-latency responses for the **Quiz Engine API** and **Community API** for spaced repetition and live feedback.

Authentication & Database: Supabase
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

- **Supabase Auth**: Provides built-in social login (essential for community contributions) and pre-built email/password with OAuth (e.g., Google).
- **PostgreSQL** (via Supabase): Manages relational data (e.g., courses ↔ lessons ↔ user progress) with full-text search for course discovery.
- Real-time capabilities enable live updates (e.g., upvotes on community feedback).
- **User Progress API** ensures relational integrity (e.g., tracking streaks across lessons).
- **Media Storage**: Leverages Supabase’s built-in file storage for audio/video lessons.

AI Integration: OpenAI API
~~~~~~~~~~~~~~~~~~~~~~~~~~

- Powers auto-generated quizzes and pronunciation feedback.
- Suggests personalized review content based on user weaknesses (via **User Dashboard**).

Testing: Jest
~~~~~~~~~~~~

- Offers fast snapshot and mocking support for frontend (React) and backend (Node).
- Integrates with Next.js/Vercel for CI/CD pipelines.
- Ensures reliable unit and integration testing to prevent regressions.