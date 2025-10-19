Project Planning
===============

Artifacts
---------

The project team utilized several key tools to manage the planning and execution of the project effectively. Each tool played a distinct role in organizing tasks, facilitating collaboration, and maintaining version control.

- **Notion**: Used for comprehensive work planning, sprint tracking, backlog management, and maintaining Kanban boards for workflow visualization.
- **GitHub**: Served as the central repository for version control, code collaboration, and maintaining project history.
- **Google Docs**: Used to record meeting minutes, document decisions, and store all written artifacts related to planning and review.
- **Google Meet**: Primary platform for virtual meetings, including sprint planning, stakeholder consultations, and daily stand-ups.
- **ReadTheDocs**: Hosted the team’s technical and management documentation for accessibility and versioned record-keeping.

Development Plan
---------------

The planning phase began by identifying key requirements and core functionalities of the **Course Management and Course Learning System**. Both the project team and the stakeholder were actively consulted to ensure that the system addressed diverse user needs. It was agreed that the system’s core features would include: **Learning Courses**, **Course Creation**, and **Course Management**. The planning phase also included selecting appropriate technologies and frameworks to guarantee scalability, security, and user-friendliness.

The following milestones were established as deliverables at the end of each sprint.

Sprint One: Foundational Setup & User System
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Milestone:** A secure and functional user system is in place.

- Users can sign in and log in via Google OAuth.
- User roles (Learner, Author) are defined in the database schema.
- Core database schemas for Users and Courses are designed and implemented.
- Development workflows and repositories (Notion, GitHub) are established.

Requirements Gathering & Initial Planning
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The team collaboratively defined the system’s core functionalities through detailed discussions with the stakeholder (tutor). This phase ensured that all functional requirements were clear, well-documented, and agreed upon by all parties.

Architecture Design & Technology Selection
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The overall architecture of the system was finalized. Core components such as the course creation flow, interactive course viewer, and learning progress tracker were mapped out. The chosen **tech stack** supported scalability, security, and maintainability.

Stakeholder Consultation & Requirements Documentation
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Informal consultation meetings were held with the stakeholder to capture their expectations, ensuring that the application design met their pedagogical and usability goals.

UI Designs
~~~~~~~~~~

User interface design was prioritized in this sprint, focusing on defining user flow, color schemes, typography, and iconography. Wireframes were created to visualize the experience for learners and authors.

Deployment of a Basic Application
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

A basic version of the application was deployed according to the defined infrastructure. This involved configuring the GitHub repository, database, and deployment environment to ensure accessibility and functionality.

Sprint Two: Core Learning Flow & Course Creation
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Milestone:** Users can create and manage courses; learners can enroll and start learning.

- **Course Explorer Page:** Users can browse and search all published courses.
- **Course Enrollment:** Learners can enroll in available courses.
- **Course Builder:** Authors can create new courses with text-based lessons.
- **Lesson Player UI:** Interface for viewing and navigating lesson content.
- **Progress Tracking:** Learners’ progress recorded per lesson.
- **User Dashboard:** Displays enrolled courses and progress metrics.

Sprint Three: Enhanced Content & Community Features
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Milestone:** The platform supports interactive content and basic community engagement.

- **Rich Lesson Builder:** Authors create lessons with multimedia and interactive quizzes.
- **Ratings & Reviews:** Learners rate and review courses.
- **Public Dashboard:** Displays user profiles, created courses, and learning stats.
- Collaboration: Users can collaborate with other users on their courses to make changes
- **Discussion Forum:** Integration with an external moderation API for safe user interactions.
- **User Profile Management:** Users can update personal information and achievements.
- **Notifications:** Real-time updates for forum interactions and course activities.

Sprint Four: Final Polish, Personalization & Launch
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Milestone:** The application is optimized, documented, and ready for deployment.

- **Bug Fixing & UI Enhancements:** Refine the interface for a seamless user experience.
- **Recommended Courses Section:** Personalized course suggestions based on tags and enrolled languages.
- **Landing Page:** Finalized marketing and introductory page for the platform.
- **Flashcards Tool:** Enables learners to create personalized study flashcards.
- **Final Documentation & Launch Preparation:** Ensured completeness and accuracy across all project documentation before launch.

Work Distribution
----------------

Work was distributed based on **features** rather than technical layers. Each team member was responsible for specific application features from design through testing and documentation. This structure promoted accountability and ownership. For complex features, multiple members collaborated, ensuring timely delivery. The approach encouraged team members to engage with both frontend and backend aspects, supporting skill development and system-wide understanding.

Bug Tracker
-----------

A detailed **bug tracking system** was implemented using Notion. Any member could report a bug, which was then assigned to the relevant developer. Bugs were categorized and tracked through the statuses: **Open**, **In Progress**, and **Fixed**.

Each bug report included:

- Bug name
- Description
- Steps to reproduce
- Priority (High, Medium, Low)
- Severity (Critical, Major, Minor)

Severity Levels
~~~~~~~~~~~~~~~

- **Critical**: System crash, data loss, or security breach. **Impact**: System unusable. **Examples**: Crashes, DB corruption, login bypass.
- **Major**: Core functionality broken but app runs. **Impact**: Severe feature impairment. **Examples**: Course not saving, progress not tracked.
- **Minor**: Cosmetic or partial issues. **Impact**: Minimal impact. **Examples**: UI glitches, image load delays.

Priority Levels
~~~~~~~~~~~~~~~

- **High**: Blocks major functionality. **Response Time**: < 24 hours. **Examples**: Login failure, data corruption.
- **Medium**: Affects functionality but workaround exists. **Response Time**: < 5 days. **Examples**: Progress not updating, API lag.
- **Low**: Minor or cosmetic issues. **Response Time**: < 2 weeks. **Examples**: Typos, alignment issues.

This structure ensured clarity in debugging efforts and helped prioritize critical fixes before release.

API Integration
---------------

The team collaborated with **Team “202 Not Okay”** to integrate their **Moderation API** into the discussion forum feature. The API automatically scans user-generated posts before submission. If the system detects offensive or harmful content, the post is blocked, maintaining a safe and respectful learning environment. This integration added a crucial layer of content moderation and enhanced community trust within the platform.
