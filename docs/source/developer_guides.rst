Developer Guide
===============

1. Development Database Setup
----------------------------

This project uses `Supabase <https://supabase.com/>`_ as its database.

Steps
~~~~~

1. **Create a Supabase Project**

   - Visit `Supabase <https://app.supabase.com/>`_ and sign in.
   - Click **New Project** and fill in the details.

2. **Configure Database Tables**

   - In the Supabase dashboard, navigate to **Table Editor**.
   - Create tables:
     - ``users``: Columns: ``id``, ``clerk_id``, ``name``, ``email``
     - Add other tables as needed (e.g., ``courses``, ``lessons``, ``user_progress``).
   - Set up relationships and constraints as required.

3. **Get API Keys**

   - In **Project Settings > API**, copy:
     - ``SUPABASE_URL``
     - ``SUPABASE_ANON_KEY``
     - ``SUPABASE_SERVICE_ROLE_KEY``

4. **Configure Local Environment**

   - Create a ``.env.local`` file in the project root:

     .. code-block:: bash

        NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
        NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
        SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key

2. Development API Setup
-----------------------

API routes are managed using `Next.js API Routes <https://nextjs.org/docs/api-routes/introduction>`_.

Steps
~~~~~

1. **Create API Route Files**

   - Add files in ``src/pages/api/`` (e.g., ``users.ts``, ``courses.ts``).
   - Use the Supabase client for database operations (see ``insertUser``, ``checkUserExists`` in ``src/utils/db/server.ts``).

2. **Example API Route**

   .. code-block:: tsx

      // src/pages/api/users.ts
      import { insertUser } from "@/utils/db/server";

      export default async function handler(req, res) {
        if (req.method === "POST") {
          const { clerk_id, name, email } = req.body;
          try {
            const user = await insertUser(clerk_id, name, email);
            res.status(200).json(user);
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
        }
      }

3. **Test API Endpoints**

   - Use tools like `Postman <https://www.postman.com/>`_ or `curl <https://curl.se/>`_ to test endpoints.

3. Development Site Setup
------------------------

The frontend is built with `Next.js <https://nextjs.org/>`_.

Steps
~~~~~

1. **Install Dependencies**

   .. code-block:: bash

      npm install

2. **Run Development Server**

   .. code-block:: bash

      npm run dev

   - Visit `http://localhost:3000 <http://localhost:3000/>`_ in your browser.

3. **Frontend Development**

   - Edit pages in ``src/app/`` (e.g., ``page.tsx``).
   - Use components and hooks to interact with the API and Supabase.

4. Testing
---------

- Run tests with:

  .. code-block:: bash

     npm test

- Coverage reports are generated in the ``coverage/`` folder.