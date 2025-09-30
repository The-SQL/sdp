Game Plan
=========

**Team Members:** Priyanka, Wilfred, Kamogelo, Emmanuel

**Guiding Principle:** Work is distributed based on a mix of initial skill sets and desired learning outcomes to ensure fairness, balance, and contribution to the professional growth of all team members. Roles are focused but not siloed; collaboration and peer review are required.

Primary Role Responsibilities
----------------------------

.. list-table::
   :header-rows: 1
   :widths: auto

   * - Name
     - Primary Role
     - Key Responsibilities
   * - Priyanka
     - Frontend Lead
     - - Architecting the main React application structure and components.
       - Implementing complex UI logic and state management (e.g., lesson player).
       - Establishing testing protocols (Jest, React Testing Library).
       - Ensuring UI consistency and responsiveness.
   * - Emmanuel
     - UI/UX Designer & Frontend Developer
     - - Creating and maintaining all Figma wireframes and prototypes.
       - Translating designs into functional React components.
       - Implementing CSS/styling (e.g., using Styled-Components or Tailwind).
       - Ensuring a seamless and intuitive user experience.
   * - Wilfred
     - Backend Lead & DevOps
     - - Designing and implementing the Node.js/Express API architecture.
       - Managing the MongoDB database: schema design, queries, and optimization.
       - Setting up the deployment pipeline and managing environments (Dev, Prod).
       - Integrating third-party APIs and ensuring backend security.
   * - Kamogelo
     - Full-Stack Developer & Product Owner Proxy
     - - Implementing key features that bridge frontend and backend (e.g., form handlers, API calls).
       - Managing the product backlog in Notion and facilitating sprint planning.
       - Being the main point of contact for client communications and requirement clarification.
       - Assisting both frontend and backend where needed to balance workload.

Sprint-by-Sprint Workload Distribution
-------------------------------------

This table outlines how feature development is distributed to ensure clear focus and balanced workload each sprint.

.. list-table::
   :header-rows: 1
   :widths: auto

   * - Sprint
     - Priyanka (Frontend)
     - Emmanuel (UI/UX & Frontend)
     - Wilfred (Backend & DB)
     - Kamogelo (Full-Stack & PM)
   * - 1: Auth
     - Auth context & protected routes logic
     - Login/Sign-up page UI components
     - Auth API routes (JWT, OAuth) & User schema
     - Project setup coordination & client meeting notes
   * - 2: Core Flow
     - Lesson Player component, Progress tracking UI
     - Course Explorer page, Dashboard layout
     - Course & Lesson APIs, Progress tracking API
     - Enrollment logic, connecting frontend to new APIs
   * - 3: Rich Content
     - Interactive quiz & flashcard components
     - Designer for new lesson component UIs
     - API endpoints for new lesson types (quiz, flashcard)
     - Implementing SRS logic, Review/rating system
   * - 4: Polish
     - Writing E2E tests, Code optimization
     - Final UI polish, responsive fixes
     - Deployment scripting, database indexing
     - "Suggested courses" logic, admin moderation features

How This Distribution is Fair
----------------------------

1. **Balance of "Heads-Down" vs. "Collaborative" Work:**
   - Wilfred focuses on deep backend work.
   - Priyanka and Emmanuel focus on frontend work.
   - Kamogelo's role is collaborative, interacting with all team members and the client, ensuring no isolation.

2. **Mix of Creation and Maintenance:**
   - Emmanuel creates designs, and Priyanka implements their complex logic, splitting creative and technical UI work.
   - Wilfred builds backend infrastructure, and Kamogelo writes code that consumes it, ensuring shared investment in quality.

3. **Skill Development for All:**
   - **Priyanka**: Strengthens advanced React and testing skills.
   - **Emmanuel**: Practices translating design theory into practice.
   - **Wilfred**: Gains deep experience in API architecture and deployment.
   - **Kamogelo**: Develops full-stack and project management skills.

4. **Shared Ownership of Critical Path:**
   - No single person owns a "critical path" feature alone. For example, a lesson requires Emmanuel's design, Priyanka's component, Wilfred's API, and Kamogelo's integration, fostering mutual dependency and teamwork.

5. **Rotating "Unglamorous" Tasks:**
   - Tasks like documentation, meeting setup, and testing are distributed. Defined roles ensure coverage (e.g., Kamogelo on notes, Priyanka on test protocols, Wilfred on deployment docs).

API Integration
---------------

We have established an integration with the team '202 Not Okay' to utilize their Moderation API. This collaboration will automatically scan and filter user-generated text content across our platform to ensure community guidelines are upheld.