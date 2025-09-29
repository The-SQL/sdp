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