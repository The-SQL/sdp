API Documentation
=================

Endpoint
--------

``POST /api/quiz-engine``

Description
-----------

Generates a multiple-choice exercise using OpenAI based on the provided topic, skill level, and instructions.

Headers
-------

- **x-api-key**: string (required)
  Your API key.

Request Body
------------

Send a JSON object with a ``data`` field containing:

.. code-block:: json

   {
     "data": {
       "topic": "string",                    // Required. The topic for the exercise.
       "skill_level": "string",              // Required. The skill level (e.g., beginner, intermediate, advanced).
       "number_of_questions": number,         // Required. Number of questions to generate.
       "additional_instructions": "string",  // Required. Any extra instructions for the exercise.
       "information_from_sources": "string"  // Optional. Additional information or sources.
     }
   }

Example Request
---------------

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
---------

Success
~~~~~~~

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
         },
         ...
       ]
     }
   }

Error Cases
~~~~~~~~~~~

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
-----

- The route uses OpenAI's GPT-4.1 model to generate exercises.
- All required fields must be present in the request body.
- The response data structure depends on the OpenAI output.