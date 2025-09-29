Git Methodology
===============

Branching Strategy
-----------------

We follow the **GitHub Flow** branching model:

- **main**: Production-ready code.
- **dev**: Integration branch for features in development.
- **feat/[name]**: For specific features or tasks (e.g., ``feat/auth``).
- **fix/[issue]**: Bug fixes (e.g., ``fix/login-error``).

**Rules:**

- No direct commits to ``main`` – only **merged Pull Requests (PRs)** are allowed.

Commit Message Conventions
-------------------------

We adhere to `Conventional Commits <https://www.conventionalcommits.org/>`_ format:

.. code-block:: text

   <type>(<scope>): <description>

**Examples:**

- ``feat(auth): add JWT login``
- ``fix(api): resolve 500 error on /users``
- ``docs(readme): update setup instructions``

**Types:**

- ``feat``: New feature
- ``fix``: Bug fix
- ``docs``: Documentation
- ``refactor``: Code changes (no new features)
- ``chore``: Maintenance (e.g., dependency updates)

Best Practices
--------------

- **Commit Often, Keep Commits Small**: Use descriptive messages (e.g., ``git commit -m "Add user auth endpoint"``).
- **Use Pull Requests**: Facilitate code reviews and discussions.
- **Keep Branches Short-Lived**: Avoid long-running branches to reduce merge conflicts.
- **Rebase for Clean History**: Use ``git rebase`` to avoid unnecessary merge commits, but be cautious with shared branches.
- **Resolve Conflicts Promptly**: Use ``git merge`` or ``git rebase`` and communicate with teammates.
- **Leverage CI/CD**: Automate testing and deployment to catch issues early.
- **Tag Releases**: Use ``git tag`` to mark specific versions for traceability.

Code Style & Naming Conventions
-------------------------------

General Principles
~~~~~~~~~~~~~~~~~~

- **Be descriptive**: Avoid abbreviations unless widely known.
- **Follow language/framework conventions**.
- **Stay consistent** across the codebase.

Naming Conventions by Type
~~~~~~~~~~~~~~~~~~~~~~~~~~

Variables & Functions
^^^^^^^^^^^^^^^^^^^^^

.. list-table::
   :header-rows: 1
   :widths: auto

   * - Type
     - Convention
     - Examples
   * - Variables
     - ``camelCase``
     - ``userProfile``, ``isLoggedIn``
   * - Functions
     - ``camelCase``
     - ``fetchUserData()``, ``validateForm()``
   * - Boolean
     - Prefix with ``is``, ``has``, ``can``
     - ``isActive``, ``hasPermission``
   * - Constants
     - ``UPPER_SNAKE_CASE``
     - ``MAX_RETRIES``, ``API_ENDPOINT``

Files & Directories
^^^^^^^^^^^^^^^^^^^

.. list-table::
   :header-rows: 1
   :widths: auto

   * - Type
     - Convention
     - Examples
   * - Component files (React)
     - ``PascalCase``
     - ``UserCard.jsx``, ``Navbar.tsx``
   * - Utility files
     - ``kebab-case``
     - ``api-utils.js``, ``date-helpers.ts``
   * - Directories
     - ``kebab-case``
     - ``user-auth/``, ``api-services/``

Classes & Interfaces/Types
^^^^^^^^^^^^^^^^^^^^^^^^^^

.. list-table::
   :header-rows: 1
   :widths: auto

   * - Type
     - Convention
     - Examples
   * - Classes
     - ``PascalCase``
     - ``class UserModel {}``
   * - Interfaces (TypeScript)
     - ``PascalCase`` + ``I`` prefix (optional)
     - ``IUser``, ``IProduct``
   * - Enums
     - ``PascalCase``
     - ``enum UserRole { Admin, Member }``

CSS/Styling
^^^^^^^^^^^

.. list-table::
   :header-rows: 1
   :widths: auto

   * - Type
     - Convention
     - Examples
   * - Class names
     - ``kebab-case``
     - ``.user-card``, ``.nav-link-active``
   * - CSS Variables
     - ``--kebab-case``
     - ``--primary-color``, ``--font-size``