User Feedback
=============

**Product**: OSLearn - Language Learning Platform

**Tested Features**: Course Discovery (Explore & Overview), Dashboard, User Profile, Create Content, Quiz Engine

**Testing Date**: 25/09/25

**Participants**: 5 Users

**Methodology**: Moderated remote testing via Google Meet. Participants shared their screens and were asked to "think aloud" while completing tasks. Sessions were recorded for analysis. Users requested anonymity, so names and personal information are not recorded.

Testing Script & Tasks
---------------------

**Introduction**: "Thank you for helping us test OSLearn. Today, we're evaluating how easy it is to discover and evaluate courses on our platform. Please verbalize your thoughts, feelings, and frustrations as you complete the tasks. There are no right or wrong answers; we're testing the platform, not you."

**Task 1: Discovery**

"Imagine you want to learn basic Italian for an upcoming trip. Please find a suitable beginner Italian course."

**Task 2: Evaluation**

"Now, please decide if you would enroll in this course. What information helps you make this decision?"

**Task 3: Personal Management**

"Please find the page where you can see all the courses you're currently taking and check your progress in one of them."

**Task 4: Profile Review**

"Please find and update your profile bio to say 'Learning Italian and Japanese'."

**Task 5: Course Creation**

"You've decided to create a short course on 'Coffee Shop Spanish'. Please use the course creation system to set up this course. Add a unit called 'Greetings and Ordering' with one video lesson and one text-based lesson on vocabulary."

Summary of Feedback & Evidence of Integration
--------------------------------------------

.. list-table::
   :header-rows: 1
   :widths: auto

   * - User
     - Key Feedback (Verbatim Where Possible)
     - Category
     - Evidence of Integration / Developer Response
     - Status
   * - All
     - Loading page should be added. I don’t like seeing a white screen while waiting for the page to load.
     - UI/Usability
     - Added. A loading page was implemented to address page load times.
     - Done
   * - User 1
     - "I love the tags! I searched 'Italian' and then saw the 'Travel' tag on one course, which is exactly what I need. That sold me."
     - Positive
     - **N/A** - Positive reinforcement of existing feature.
     - N/A
   * - User 1
     - "The 'Level' badge is a bit plain. I almost missed it. Maybe colour-code it? Green for beginner, etc."
     - UI/Usability
     - **Integrated.** Level badges on Course Overview and Course Cards now have colored backgrounds: ``bg-green-100 text-green-800`` for Beginner, yellow for Intermediate, etc.
     - Done
   * - User 2
     - "I can't tell if I'm already taking a course or not from the main list. I have to click in to see."
     - Feature Request
     - **Integrated.** The ``getUserCourses`` function is now used on the Explore page. Course cards for enrolled courses display an "Enrolled" badge.
     - Done
   * - User 3
     - "On the course page, the 'What you'll learn' section is great. I want to see that *before* I click on a course, maybe on the card itself."
     - Feature Request
     - **Backlog.** Deemed too cluttered for mobile view. Compromise: added a tooltip on hover for course cards showing the first two learning objectives.
     - Backlog (S3)
   * - User 4
     - "The 'Continue Learning' button is perfect. It's right there. But on my dashboard, the progress bar for my course is tiny and hard to see."
     - UI/Usability
     - **Integrated.** Progress bars on Dashboard course cards are now thicker, with bolded percentage labels for better visibility.
     - Done
   * - User 4
     - "I finished a course but there's no way to celebrate! Can I leave a review? It says 'Based on 0 reviews'..."
     - Feature Request
     - **Integrated.** This feedback led to the development of the **Course Reviews & Ratings** feature, prioritized for Sprint 2.
     - Done (S2)
   * - User 5
     - "I filtered for 'Beginner' courses but this one course that came up is listed as 'Intermediate' in its description."
     - Bug
     - **Fixed.** Bug in the course card component; filter was querying an incorrect field. Fixed to ensure consistency with ``course.level``.
     - Done
   * - User 5
     - "The 'Students' stat is confusing. Is that all-time? This month? I'm not sure what it tells me about the course quality."
     - Content Clarity
     - **Integrated.** Added a tooltip to the "Students" icon on the Course Overview page clarifying "Total enrolled students".
     - Done
   * - All
     - **Consensus**: The "Preview Course" button was used by all 5 users. 4/5 expected a video trailer or sample lesson, not just a promotional image.
     - Expectation
     - **Backlog.** Renamed to "Watch Preview" and added story **VID-01: Implement Video Course Previews** to the product backlog.
     - Backlog

Conclusion & Outcomes
--------------------

User testing provided critical insights, moving the platform from "it works" to "it works well." Feedback was categorized into three areas:

1. **Bugs & Immediate Fixes**: Addressed within 24 hours.
2. **Quick UI/Usability Wins**: Implemented by updating CSS.
3. **Strategic Feature Requests**: Formalized into user stories and prioritized for the next sprint.

User Feedback Sprint 2
----------------------

**Product**: OSLearn - Language Learning Platform

**Tested Features**: Course Learning Interface, Dashboard, Course Management, Community Forums

**Testing Date**: 15/10/25

**Participants**: 6 Users

**Methodology**: Unmoderated testing with session recording. Users were given specific tasks related to the learning experience, course management, and community features. Feedback was collected through in-app surveys and session analytics.

Testing Script & Tasks
---------------------

**Introduction**: "Welcome to OSLearn testing. Today we're evaluating the core learning experience, progress tracking, and community features. Please complete the following tasks while thinking aloud about your experience."

**Task 1: Course Learning**
"Enroll in a course and complete at least 3 lessons of different types (video, text, exercise). Navigate between lessons and mark them as complete."

**Task 2: Progress Tracking**
"Check your learning progress on the dashboard. Review your weekly activity and current streak."

**Task 3: Course Management**
"As a course creator, edit an existing course by adding a new unit and modifying lesson content."

**Task 4: Community Engagement**
"Browse the forums, create a new discussion post, and reply to an existing thread."

**Task 5: Content Moderation**
"Test the profanity filter by attempting to post inappropriate content in the forums."

Summary of Feedback & Evidence of Integration
--------------------------------------------

.. list-table::
   :header-rows: 1
   :widths: auto

   * - User
     - Key Feedback (Verbatim Where Possible)
     - Category
     - Evidence of Integration / Developer Response
     - Status
   * - All
     - "The sidebar curriculum is essential but takes too much space on mobile. Need better mobile navigation."
     - UI/Usability
     - **Integrated.** Added mobile-responsive sidebar with slide-out drawer and close button. Implemented "Open Curriculum" button for mobile access.
     - Done
   * - User 1
     - "Love the different content types! The audio player with transcript is perfect for language learning."
     - Positive
     - **N/A** - Positive reinforcement of existing feature design.
     - N/A
   * - User 2
     - "When I complete a video lesson, it should automatically mark as complete. I don't want to click the button every time."
     - Feature Request
     - **Integrated.** Added auto-completion for media lessons (video/audio) when content ends. Manual completion still available for all lesson types.
     - Done
   * - User 3
     - "The progress bar in the sidebar is motivating! But I want to see my overall course completion more prominently."
     - UI/Usability
     - **Integrated.** Enhanced progress visualization with completed/total lessons count and percentage progress bar in sidebar header.
     - Done
   * - User 4
     - "Exercise feedback is helpful, but I want to see why my answer was wrong with more explanation."
     - Feature Enhancement
     - **Integrated.** Enhanced exercise components to show correct answers with explanations for both MCQ and fill-in-the-blank exercises.
     - Done
   * - User 5
     - "As a course collaborator, the version switching between main and suggested edits is confusing. Need clearer labels."
     - UX/Clarity
     - **Integrated.** Improved version selector with clear "Main" and "Suggested Edit - [Date]" labels in course management interface.
     - Done
   * - User 6
     - "Forum post creation is smooth, but I accidentally posted inappropriate content. Glad it was blocked!"
     - Content Moderation
     - **Integrated.** Implemented comprehensive profanity checking for forum posts (title, content, tags) with clear error messaging.
     - Done
   * - All
     - "Navigation between lessons should be easier. The Previous/Next buttons are too far apart on mobile."
     - UI/Usability
     - **Integrated.** Restructured lesson navigation footer with stacked layout on mobile and better button placement.
     - Done
   * - User 2, 4
     - "Discussion forum loading is slow when there are many posts. The infinite scroll sometimes glitches."
     - Performance
     - **Integrated.** Optimized forum post loading with better pagination handling and loading states. Fixed scroll restoration issues.
     - Done
   * - User 3, 5
     - "Dashboard stats don't always match my actual progress. Some completed lessons aren't reflected."
     - Data Accuracy
     - **Fixed.** Synchronized progress tracking between learning interface and dashboard. Fixed cache invalidation for real-time updates.
     - Done
   * - User 1, 6
     - "The 'Mark Complete' button state should be more obvious. Sometimes I don't know if I've completed a lesson."
     - UI/Clarity
     - **Integrated.** Enhanced visual states for completion buttons with distinct colors and icons for complete/incomplete states.
     - Done
   * - All
     - **Consensus**: The collaborative editing workflow for course management needs better visual differentiation between original and suggested changes.
     - Feature Enhancement
     - **Backlog.** Created story **CMS-02: Enhanced Visual Diff for Course Editing** to show side-by-side comparison of changes.
     - Backlog (S3)

Conclusion & Outcomes
--------------------

The testing revealed strong positive reception for the multi-format learning content and community features. Key improvements were made to:

1. **Mobile Experience**: Completely overhauled mobile navigation for the learning interface
2. **Progress Tracking**: Enhanced real-time synchronization and visual feedback
3. **Content Moderation**: Strengthened profanity filtering across community features
4. **User Experience**: Streamlined workflows for both learners and content creators

The collaborative course editing system received particular praise, though users requested better visual differentiation between versions, which has been prioritized for future development.