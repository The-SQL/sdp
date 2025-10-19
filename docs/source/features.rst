Features
========

User Authentication & Profile Management
---------------------------------------

The application uses Clerk for user authentication, providing a secure sign-in/sign-up system. Each user has a comprehensive profile system that tracks their learning journey. The profile displays personal information, learning statistics including completed courses, lessons finished, current and longest learning streaks, and total points earned. Users can edit their profile information including name and bio directly within the application. The system also tracks which languages the user is learning and displays them in the profile.

Course Management System
-----------------------

Course Creation & Editing
~~~~~~~~~~~~~~~~~~~~~~~~

The platform provides a sophisticated course creation interface with a tab-based workflow. The process is divided into four main sections: Course Setup, Content Builder, Collaboration, and Publishing. In the setup phase, creators define basic course information including title, description, difficulty level, estimated duration, language, and learning objectives. The system includes a live preview feature that shows how the course will appear to students.

The Content Builder allows creators to structure their course into units and lessons. Each lesson can be one of four content types: video lessons, text content, audio lessons, or interactive exercises. For video and audio content, the system supports file uploads and provides storage through Supabase. The exercise system includes multiple-choice quizzes and fill-in-the-blank activities with configurable correct answers.

Course Publishing Options
~~~~~~~~~~~~~~~~~~~~~~~~

Creators have flexible publishing options. They can save courses as drafts for private development, publish as unlisted (accessible only via direct link), or publish publicly to make them discoverable to all users. The system handles all media uploads and database operations automatically during the publishing process.

Learning Interface
-----------------

Course Overview & Enrollment
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The course overview page provides detailed information about each course including title, description, difficulty level, duration, student count, ratings, and reviews. Students can enroll in courses, add them to favorites, or share them with others. The page displays comprehensive author information and a detailed curriculum breakdown.

Interactive Learning Experience
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Once enrolled, students access a dedicated learning interface that presents course content in an organized manner. The interface features a collapsible sidebar showing course curriculum with progress tracking. Each lesson is displayed in a main content area with specialized players for different content types: video players with controls, audio players with playback functionality, text content readers, and interactive exercise components.

The system includes progress tracking that marks lessons as complete automatically when media content finishes playing or manually when students click completion buttons. Navigation controls allow moving between lessons while maintaining progress state. Users can also create flashcards to help them solidify their understanding of a language.

Collaboration Features
---------------------

Course Collaboration System
~~~~~~~~~~~~~~~~~~~~~~~~~~

The platform includes a robust collaboration system that allows course creators to invite other users to contribute to their courses. Creators can enable or disable collaboration requests through a toggle setting. The system manages collaboration invitations and tracks pending, accepted, and rejected requests.

Collaborators can propose changes to courses through a suggested edits system. When collaborators make changes, these are stored as separate versions that the original course author can review and approve or reject. The system highlights differences between the original course and suggested changes, making it easy for authors to review modifications.

Community Features
-----------------

Discussion Forums
~~~~~~~~~~~~~~~~~

The application includes a comprehensive forum system where users can discuss language learning topics. The forums are organized into categories including General Discussion, Language Exchange, Study Groups, Course Help, Cultural Exchange, and Success Stories. Users can create posts with titles, categories, language tags, and content. The system includes search and filtering capabilities to help users find relevant discussions.

Post Interactions & Moderation
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The forum supports rich interactions including replies, likes, and viewing counts. A content moderation system checks all posts and replies for inappropriate language using a profanity filter, preventing submissions that contain offensive content. The interface shows post metrics like reply counts, view counts, and like counts, along with timestamps for all activities.

Notifications System
~~~~~~~~~~~~~~~~~~~

Users receive notifications when others interact with their content, such as when someone replies to their forum posts. The notification system marks items as read when viewed and provides options to mark all notifications as read at once. Notifications include excerpts of the relevant content and direct links to the discussions.

Progress Tracking & Analytics
----------------------------

Learning Analytics
~~~~~~~~~~~~~~~~~

The platform tracks extensive learning metrics including course completion percentages, lesson progress, and time-based streaks. The dashboard displays weekly activity visualizations showing which days the user was active. Quick stats provide at-a-glance information about completed courses, lessons finished, current streaks, and total learning points.

Goal Setting System
~~~~~~~~~~~~~~~~~~

Users can set learning goals with specific target dates. The system tracks goal completion and provides visual progress indicators. Goals can be marked as complete manually, helping users stay motivated and organized in their learning journey.

Content Management & Administration
-----------------------------------

Course Management Dashboard
~~~~~~~~~~~~~~~~~~~~~~~~~~

Content creators have access to a management dashboard where they can view all their courses, see basic statistics, and access editing interfaces. The system supports version management for courses, allowing creators to view and manage both main course content and suggested edits from collaborators.

Media Management
~~~~~~~~~~~~~~~~

The application handles various media types including images for course covers, video files for lessons, and audio files for listening exercises. All media is stored and served through Supabase storage with organized bucket structures for different content types.
