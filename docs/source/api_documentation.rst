API Documentation
=================

Quiz Engine Endpoint
--------------------

**Endpoint**: ``POST /api/quiz-engine``

**Description**: Generates a multiple-choice exercise using OpenAI based on the provided topic, skill level, and instructions.

Headers
~~~~~~~

- **x-api-key**: string (required)
  Your API key.

Request Body
~~~~~~~~~~~~

Send a JSON object with a ``data`` field containing:

.. code-block:: json

   {
     "data": {
       "topic": "string",                    // Required. The topic for the exercise.
       "skill_level": "string",              // Required. The skill level (e.g., beginner, intermediate, advanced).
       "number_of_questions": number,        // Required. Number of questions to generate.
       "additional_instructions": "string",  // Required. Any extra instructions for the exercise.
       "information_from_sources": "string"  // Optional. Additional information or sources.
     }
   }

Example Request
~~~~~~~~~~~~~~~

.. code-block:: json

   POST /api/quiz-engine
   Headers:
     x-api-key: your_api_key
   Body:
   {
     "data": {
       "topic": "Mathematics",
       "skill_level": "beginner",
       "number_of_questions": 5,
       "additional_instructions": "Focus on algebra.",
       "information_from_sources": ""
     }
   }

Responses
~~~~~~~~~

Success
^^^^^^^

**Status**: 200

**Body**:

.. code-block:: json

   {
     "message": "Exercise generated successfully",
     "data": {
       "exercises": [
         {
           "type": "multiple_choice",
           "question": "The American flag has 13 stripes. If you subtract 3 stripes, how many stripes remain?",
           "options": {
             "A": "10",
             "B": "11",
             "C": "12",
             "D": "9"
           },
           "answer": "A",
           "hint": "Subtract 3 from 13.",
           "explanation": "13 stripes minus 3 stripes is 13 - 3 = 10 stripes left."
         }
       ]
     }
   }

Error Cases
^^^^^^^^^^^

**401 Unauthorized**:

.. code-block:: json

   {
     "message": "Unauthorized: Invalid or missing API key"
   }

**400 Bad Request**:

.. code-block:: json

   {
     "message": "Missing required fields"
   }

**500 Internal Server Error**:

.. code-block:: json

   {
     "message": "Failed to generate exercise: <error details>"
   }

Notes
~~~~~

- The route uses OpenAI's GPT-4.1 model to generate exercises.
- All required fields must be present in the request body.
- The response data structure depends on the OpenAI output.
- Includes CORS support for cross-origin requests.

Content Moderation Endpoint
---------------------------

**Endpoint**: ``POST /api/moderation``

**Description**: Checks text for profanity and returns moderated content.

Request Body
~~~~~~~~~~~~

.. code-block:: json

   {
     "text": "string"  // Required. The text to moderate
   }

Example Request
~~~~~~~~~~~~~~~

.. code-block:: json

   POST /api/moderation
   Body:
   {
     "text": "This is some text to check for inappropriate content"
   }

Responses
~~~~~~~~~

Success (200)
^^^^^^^^^^^^^

.. code-block:: json

   {
     "contains_profanity": false,
     "censored_text": "This is some text to check for inappropriate content"
   }

Error Cases
^^^^^^^^^^^

**400 Bad Request**:

.. code-block:: json

   {
     "detail": "Missing 'text' field"
   }

**500 Internal Server Error**:

.. code-block:: json

   {
     "contains_profanity": false,
     "censored_text": ""
   }

Notes
~~~~~

- Uses external moderation service
- Returns original text if moderation fails
- Automatically falls back to safe response on errors

Email Collaboration Invitation Endpoint
---------------------------------------

**Endpoint**: ``POST /api/email/collab-invite``

**Description**: Sends a collaboration invitation email for a course.

Request Body
~~~~~~~~~~~~

.. code-block:: json

   {
     "data": {
       "senderName": "string",      // Required. Name of the person sending invitation
       "courseTitle": "string",     // Required. Title of the course
       "courseUrl": "string",       // Required. URL to access the course
       "to": "string"              // Required. Recipient email address
     }
   }

Example Request
~~~~~~~~~~~~~~~

.. code-block:: json

   POST /api/email/collab-invite
   Body:
   {
     "data": {
       "senderName": "John Doe",
       "courseTitle": "Advanced Mathematics",
       "courseUrl": "https://example.com/courses/math-101",
       "to": "recipient@example.com"
     }
   }

Responses
~~~~~~~~~

Success (200)
^^^^^^^^^^^^^

.. code-block:: json

   {
     "id": "email-id",
     "from": "onboarding@resend.dev"
   }

Error Cases
^^^^^^^^^^^

**400 Bad Request**:

.. code-block:: json

   {
     "error": "Missing required fields"
   }

**500 Internal Server Error**:

.. code-block:: json

   {
     "error": "Resend error details"
   }

Notes
~~~~~

- Uses Resend email service
- Sends from "Acme <onboarding@resend.dev>"
- Uses React email template component

User Registration Endpoint
--------------------------

**Endpoint**: ``POST /api/users``

**Description**: Inserts a new user into the database (typically used with webhooks).

Request Body
~~~~~~~~~~~~

.. code-block:: json

   {
     "data": {
       "id": "string",                    // Required. User ID
       "first_name": "string",           // Optional. User's first name
       "email_addresses": [              // Required array with at least one email
         {
           "email_address": "string"     // Required. User's email address
         }
       ]
     }
   }

Example Request
~~~~~~~~~~~~~~~

.. code-block:: json

   POST /api/users
   Body:
   {
     "data": {
       "id": "user_123",
       "first_name": "Alice",
       "email_addresses": [
         {
           "email_address": "alice@example.com"
         }
       ]
     }
   }

Responses
~~~~~~~~~

Success (200)
^^^^^^^^^^^^^

.. code-block:: json

   {
     "message": "User inserted successfully"
   }

Error Cases
^^^^^^^^^^^

**500 Internal Server Error**:

.. code-block:: json

   {
     "error": "Failed to insert user: error details"
   }

Notes
~~~~~

- Typically used as a webhook endpoint
- Requires specific data structure with email addresses array
- Stores user ID, first name, and primary email

CORS Information
----------------

The Quiz Engine endpoint (``/api/quiz-engine``) includes CORS support:

- **Allowed Origins**: All (``*``)
- **Allowed Methods**: ``POST``, ``OPTIONS``
- **Allowed Headers**: ``Content-Type``, ``x-api-key``
- **Preflight**: OPTIONS method available for CORS preflight requests