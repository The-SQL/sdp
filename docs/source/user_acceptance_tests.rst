User Acceptance Tests
=====================

Sprint 1
--------

.. list-table::
   :header-rows: 1
   :widths: auto

   * - UAT
   * - **Given**: A user has an existing account with valid Google credentials  
       **When**: They sign in successfully with Google  
       **Then**: They are redirected to their personal dashboard where they can view and interact with available courses.
   * - **Given**: A user is filling out the sign-up form  
       **When**: They complete the authentication process with Google  
       **Then**: A new account is created using their Google credentials, and they are automatically logged in and directed to their dashboard.

Sprint 2
--------

Course Overview Page
~~~~~~~~~~~~~~~~~~~~

.. list-table::
   :header-rows: 1
   :widths: auto

   * - UAT
   * - **Given**: A user is viewing a course overview page  
       **When**: The page loads successfully  
       **Then**: The course title, description, author information, and statistics (rating, students, duration) should be displayed accurately.
   * - **Given**: A logged-in user is viewing a course they haven't favorited  
       **When**: They click the "Add to Favorites" button  
       **Then**: The course should be added to their favorites, and the button should update to show "Added to Favorites" with a filled heart icon.
   * - **Given**: A logged-in user is viewing a course they haven't enrolled in  
       **When**: They click the "Enrol Now" button  
       **Then**: They should be successfully enrolled, and the button should change to "Continue Learning" that links to the learning page.
   * - **Given**: A user is viewing any course  
       **When**: They click the "Share" button  
       **Then**: The course URL should be copied to the clipboard, and a confirmation alert should appear.
   * - **Given**: A user is viewing the curriculum tab  
       **When**: They click on any chapter  
       **Then**: They should be redirected to the learning page for that specific chapter.
   * - **Given**: A course has reviews  
       **When**: The user navigates to the Reviews tab  
       **Then**: All reviews should be displayed with user information, ratings, and comments.
   * - **Given**: A non-enrolled user views the Discussions tab  
       **When**: They try to access discussions  
       **Then**: They should see a prompt to enroll first with an enrollment button.

Explore Courses Page
~~~~~~~~~~~~~~~~~~~

.. list-table::
   :header-rows: 1
   :widths: auto

   * - UAT
   * - **Given**: A user is on the courses page with multiple courses  
       **When**: They enter a search term in the search box  
       **Then**: Only courses matching the search term (in title, language, or tags) should be displayed.
   * - **Given**: A user wants to see only beginner-level courses  
       **When**: They select "Beginner" from the level filter  
       **Then**: Only courses with beginner level should be displayed in the results.
   * - **Given**: A user wants to see courses for a specific language  
       **When**: They select a language from the language filter  
       **Then**: Only courses for that language should be displayed.
   * - **Given**: Multiple courses are displayed  
       **When**: The user selects "Highest Rated" sorting  
       **Then**: Courses should be ordered from highest to lowest rating, with recommended courses appearing first.
   * - **Given**: A logged-in user is browsing courses  
       **When**: They click the heart icon on any course card  
       **Then**: The course should be added/removed from favorites, and the heart icon should update its visual state accordingly.
   * - **Given**: Some courses are marked as recommended  
       **When**: The page loads  
       **Then**: Recommended courses should display a "Recommended" badge and appear first in the list when no other sorting/filtering is applied.
   * - **Given**: No courses match the current search/filter criteria  
       **When**: The user applies restrictive filters  
       **Then**: An appropriate empty state message should be displayed suggesting to adjust filters.
   * - **Given**: Any course is displayed in the list  
       **When**: The user views a course card  
       **Then**: It should display the course image, title, description, duration, student count, rating, tags, level, author, and a view course button.
   * - **Given**: A non-logged-in user is browsing courses  
       **When**: They try to favorite a course  
       **Then**: The favorite button should be disabled or prompt them to log in (implementation-dependent).

Create Course Page
~~~~~~~~~~~~~~~~~

.. list-table::
   :header-rows: 1
   :widths: auto

   * - UAT
   * - **Given**: A user is creating a new course  
       **When**: They fill in the course title, description, and learning objectives  
       **Then**: All information should be properly saved and displayed in the preview section.
   * - **Given**: A user needs to specify the course language  
       **When**: They search for a language that doesn't exist and create a new one  
       **Then**: The new language should be created and selected for the course.
   * - **Given**: A user wants to add tags to their course  
       **When**: They search for existing tags and create new ones  
       **Then**: All selected tags should appear and be removable with the X icon.
   * - **Given**: A user wants to add a course image  
       **When**: They upload an image file  
       **Then**: The image should appear in the preview section immediately.
   * - **Given**: A user is building course content  
       **When**: They add a new unit and give it a title  
       **Then**: The unit should appear in the content builder with the specified title.
   * - **Given**: A user wants to add lessons to a unit  
       **When**: They add a lesson and select a content type (video, text, audio, exercise)  
       **Then**: The appropriate content input fields should appear based on the selected type.
   * - **Given**: A user selects "Video Lesson" type  
       **When**: They add video content and description  
       **Then**: The video upload interface and notes field should be available.
   * - **Given**: A user selects "Text Content" type  
       **When**: They enter text content  
       **Then**: A textarea should be provided for writing the lesson content.
   * - **Given**: A user selects "Audio Lesson" type  
       **When**: They work with audio content  
       **Then**: Record/upload options and transcript field should be available.
   * - **Given**: A user selects "Interactive Exercise" type  
       **When**: They create an exercise  
       **Then**: Exercise type selection and instructions field should be provided.
   * - **Given**: A user wants to remove a unit  
       **When**: They click the delete icon on a unit  
       **Then**: The unit and all its lessons should be removed from the course structure.
   * - **Given**: A user is configuring collaboration options  
       **When**: They toggle collaboration request and auto-approve settings  
       **Then**: The settings should be saved and reflected in the interface.
   * - **Given**: A user wants to invite collaborators  
       **When**: They enter a username/email and click invite  
       **Then**: The invitation should be sent, and pending requests should be visible.
   * - **Given**: A user receives collaboration requests  
       **When**: They accept, message, or decline requests  
       **Then**: The appropriate actions should be processed for each request.
   * - **Given**: A user is ready to publish their course  
       **When**: They select between draft, unlisted, or public publishing options  
       **Then**: The selected publishing state should be clearly indicated and saved.
   * - **Given**: A user completes course creation  
       **When**: They click "Publish Course" with their preferred visibility setting  
       **Then**: The course should be saved/published and redirect to the course page.
   * - **Given**: A user tries to publish a course with missing required fields  
       **When**: They attempt to publish without completing mandatory information  
       **Then**: Appropriate validation messages should guide them to complete the form.
   * - **Given**: A user is editing course details  
       **When**: They make changes to title, description, or other fields  
       **Then**: The preview section should update in real-time to reflect changes.
   * - **Given**: A user is working through the course creation process  
       **When**: They navigate between Setup, Content Builder, Collaboration, and Publish tabs  
       **Then**: Each tab should load the appropriate content without data loss.
   * - **Given**: Network issues or server errors occur during course creation  
       **When**: The user attempts to save or publish  
       **Then**: Appropriate error messages should be displayed with options to retry.

Dashboard Page
~~~~~~~~~~~~~

.. list-table::
   :header-rows: 1
   :widths: auto

   * - UAT
   * - **Given**: A user logs into the application  
       **When**: The dashboard page loads  
       **Then**: The user should see a personalized welcome message with their name.
   * - **Given**: A user has enrolled in courses  
       **When**: They view the "Your Courses" section  
       **Then**: All enrolled courses should be displayed with progress indicators and continue buttons.
   * - **Given**: A user hasn't enrolled in any courses  
       **When**: They view the dashboard  
       **Then**: They should see a prompt to browse courses with a link to the courses page.
   * - **Given**: A user is progressing through courses  
       **When**: They view their course cards  
       **Then**: Progress percentages should accurately reflect their completion status.
   * - **Given**: A user wants to set learning goals  
       **When**: They click "Add Goal" and fill in the form  
       **Then**: The new goal should appear in their goals list with progress tracking.
   * - **Given**: A user has studied during the week  
       **When**: They view the weekly activity chart  
       **Then**: Studied days should be highlighted with lesson counts and minutes.
   * - **Given**: A user has consecutive study days  
       **When**: The dashboard loads  
       **Then**: The current streak should be accurately calculated and displayed.
   * - **Given**: A user has been using the platform  
       **When**: They view the quick stats sidebar  
       **Then**: Total study time, lessons completed, streak, languages, and achievement points should be displayed.
   * - **Given**: A user has earned achievements  
       **When**: They view the achievements section  
       **Then**: Earned achievements should be highlighted with descriptions, and unearned ones should show progress.
   * - **Given**: A user has favorited courses  
       **When**: They view the starred courses section  
       **Then**: Their favorited courses should be displayed with ratings and quick access.
   * - **Given**: A user wants to find new courses  
       **When**: They click "Browse More" in the courses section  
       **Then**: They should be redirected to the courses catalog page.
   * - **Given**: A user wants to continue a course  
       **When**: They click "Continue" on a course card  
       **Then**: They should be redirected to the learning interface for that course.
   * - **Given**: A user has set goals with reminders  
       **When**: They view their goals  
       **Then**: Goals with reminders should show the bell icon indicating active reminders.
   * - **Given**: A user is working toward achievements  
       **When**: They view unearned achievements  
       **Then**: Progress bars should show how close they are to earning each achievement.
   * - **Given**: A user accesses the dashboard on different devices  
       **When**: They view the dashboard on mobile, tablet, and desktop  
       **Then**: The layout should adapt appropriately to each screen size.
   * - **Given**: A user has been active in another tab/session  
       **When**: They return to the dashboard  
       **Then**: The dashboard should refresh to show updated progress and statistics.
   * - **Given**: A user hasn't set any learning goals  
       **When**: They view the goals section  
       **Then**: They should see a prompt to add their first goal with an "Add Goal" button.
   * - **Given**: Network issues occur during dashboard loading  
       **When**: The dashboard tries to fetch user data  
       **Then**: Appropriate error states should be displayed without crashing the interface.
   * - **Given**: A user has enrolled in many courses  
       **When**: The dashboard loads  
       **Then**: All courses should display without significant performance issues.
   * - **Given**: A user completes a lesson in another tab  
       **When**: They return to the dashboard  
       **Then**: Progress indicators and statistics should update to reflect the recent activity.

Profile Page
~~~~~~~~~~~~

.. list-table::
   :header-rows: 1
   :widths: auto

   * - UAT
   * - **Given**: A user navigates to their profile page  
       **When**: The page loads  
       **Then**: Their profile information (name, bio, email, join date) should be displayed correctly.
   * - **Given**: A user wants to update their profile  
       **When**: They click "Edit Profile," make changes, and click "Save Changes"  
       **Then**: The profile information should be updated and persisted.
   * - **Given**: A user views the Overview tab  
       **When**: The tab loads  
       **Then**: All statistics (completed courses, in-progress courses, lessons, streaks, points) should display accurate numbers.
   * - **Given**: A user is learning multiple languages  
       **When**: They view the Overview tab  
       **Then**: All languages they're learning should be displayed as badges.
   * - **Given**: A user hasn't enrolled in any courses  
       **When**: They view the Courses tab  
       **Then**: They should see a prompt to browse courses with a link to the courses page.
   * - **Given**: A user has enrolled in courses  
       **When**: They view the Courses tab  
       **Then**: All courses should show accurate progress percentages and completion status.
   * - **Given**: A user has earned achievements  
       **When**: They view the Achievements tab  
       **Then**: Earned achievements should be highlighted with earned dates, and unearned ones should show progress.
   * - **Given**: A user has both earned and unearned achievements  
       **When**: They view the Achievements tab  
       **Then**: Earned achievements should appear first, followed by unearned ones.
   * - **Given**: A user wants to update their settings  
       **When**: They navigate to the Settings tab  
       **Then**: All editable fields should be accessible when in edit mode.
   * - **Given**: A user is viewing the Settings tab without editing  
       **When**: They view personal information fields  
       **Then**: All fields should be disabled until edit mode is activated.
   * - **Given**: A user wants to manage notifications  
       **When**: They view the Notifications section in Settings  
       **Then**: They should be able to enable/disable different notification types.
   * - **Given**: A user wants to manage account security  
       **When**: They view the Privacy & Security section  
       **Then**: Options for changing password, downloading data, and deleting account should be available.
   * - **Given**: A user has uploaded a profile picture  
       **When**: They view their profile  
       **Then**: Their custom avatar should be displayed; otherwise, initials should be shown.
   * - **Given**: A user is browsing their profile  
       **When**: They switch between Overview, Courses, Achievements, and Settings tabs  
       **Then**: Each tab should load the appropriate content without page refresh.
   * - **Given**: Profile data is loading  
       **When**: The user navigates to the profile page  
       **Then**: Loading indicators should be displayed until data is fully loaded.
   * - **Given**: Network issues occur during profile data loading  
       **When**: The page tries to fetch user data  
       **Then**: Appropriate error states should be displayed without crashing the interface.
   * - **Given**: A user accesses the profile page on different devices  
       **When**: They view the profile on mobile, tablet, and desktop  
       **Then**: The layout should adapt appropriately to each screen size.
   * - **Given**: A user has consistent learning activity  
       **When**: They view their streak information  
       **Then**: Both current streak and longest streak should display accurate numbers.
   * - **Given**: A user has completed some courses  
       **When**: They view the Courses tab  
       **Then**: Completed courses should be marked with a "Completed" badge and completion date.
   * - **Given**: A user updates their profile information  
       **When**: They refresh the page or navigate away and return  
       **Then**: All changes should be persisted and displayed correctly.