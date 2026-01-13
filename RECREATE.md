# Hepi Project Recreation Guide

This guide describes how to recreate the **Hepi** (Dicoding Backend Expert) project from scratch, implementing **clean architecture**, **automated testing**, and utilizing **Express.js** and **PostgreSQL**.

## 1. Project Initialization

1.  **Create Project Directory**:
    ```bash
    mkdir Hepi
    cd Hepi
    ```

2.  **Initialize Node.js**:
    ```bash
    npm init -y
    ```

3.  **Initialize Git**:
    ```bash
    git init
    echo "node_modules/\n.env\ncoverage/" > .gitignore
    ```

## 2. Install Dependencies

### Production Dependencies
```bash
npm install express dotenv pg bcrypt jsonwebtoken nanoid instances-container cors
```
*   `express`: Web framework.
*   `dotenv`: Environment variable management.
*   `pg`: PostgreSQL client.
*   `bcrypt`: Password hashing.
*   `jsonwebtoken`: JWT for authentication.
*   `nanoid`: UID generator.
*   `instances-container`: Dependency injection container.
*   `cors`: Cross-Origin Resource Sharing.

### Development Dependencies
```bash
npm install --save-dev nodemon jest eslint eslint-config-airbnb-base eslint-plugin-import node-pg-migrate supertest @types/jest
```
*   `nodemon`: Auto-restart server during dev.
*   `jest`: Testing framework.
*   `eslint`: Linter.
*   `node-pg-migrate`: Database migration tool.
*   `supertest`: HTTP assertions for testing.

## 3. Configuration

### Environment Variables (`.env`)
Create a `.env` file for tokens and database configuration:
```env
# Server
HOST=localhost
PORT=5000

# Postgres
PGUSER=developer
PGHOST=localhost
PGPASSWORD=supersecretpassword
PGDATABASE=forumapi
PGPORT=5432

# Postgres Test
PGUSER_TEST=developer
PGHOST_TEST=localhost
PGPASSWORD_TEST=supersecretpassword
PGDATABASE_TEST=forumapi_test
PGPORT_TEST=5432

# JWT
ACCESS_TOKEN_KEY=access_token_secret
REFRESH_TOKEN_KEY=refresh_token_secret
ACCESS_TOKEN_AGE=1800
```
*Create a `.env.example` with the same keys but dummy values.*

### Database Migrations (`package.json`)
Add migration scripts to `package.json`:
```json
"scripts": {
  "start": "node src/app.js",
  "start:dev": "nodemon src/app.js",
  "test": "jest --coverage --setupFiles dotenv/config -i",
  "test:watch": "jest --watchAll --coverage --setupFiles dotenv/config -i",
  "migrate": "node-pg-migrate",
  "migrate:test": "node-pg-migrate -f config/database/test.json"
}
```

### ESLint
Create `.eslintrc.json`:
```json
{
  "env": {
    "commonjs": true,
    "es2021": true,
    "node": true,
    "jest": true
  },
  "extends": [
    "airbnb-base"
  ],
  "parserOptions": {
    "ecmaVersion": 12
  }
}
```

## 4. Database Setup

1.  **Create Databases**:
    Create two databases in PostgreSQL: `forumapi` and `forumapi_test`.

2.  **Migration Configuration**:
    Create `config/database/test.json` for test migration config:
    ```json
    {
      "dev": {
        "driver": "pg",
        "user": "developer",
        "password": "supersecretpassword",
        "host": "localhost",
        "database": "forumapi_test",
        "port": 5432
      }
    }
    ```

3.  **Run Migrations**:
    ```bash
    npm run migrate create create-table-users
    npm run migrate create create-table-authentications
    npm run migrate create create-table-threads
    npm run migrate create create-table-comments
    npm run migrate create create-table-comment-replies
    ```
    Fill these files in the `migrations` folder with `pgm.createTable` logic.

## 5. Clean Architecture Implementation

Organize `src` into layers:

```
src/
├── Applications/     # Business Logic
│   ├── use_case/     # Application Use Cases
│   └── security/     # Security Interfaces (abstractions)
├── Commons/          # Shared Utilities & Exceptions
├── Domains/          # Enterprise Business Rules (Entities & Repository Interfaces)
├── Infrastructures/  # Frameworks & Drivers
│   ├── database/     # DB Connections
│   ├── http/         # Server Setup
│   ├── repository/   # Repository Implementations
│   └── security/     # Security Implementations
└── Interfaces/       # Interface Adapters
    └── http/         # API Handlers & Routes
```

### Step-by-Step Implementation Flow

#### A. Domain Layer (The Core)
1.  **Entities**: Define data structures and validation logic (e.g., `RegisterUser`, `NewThread`). These should not depend on frameworks.
2.  **Repository Interfaces**: Define abstract classes for data access (e.g., `UserRepository`, `ThreadRepository`).
    *   *Tip: Throw `Error('METHOD_NOT_IMPLEMENTED')` in base classes.*

#### B. Infrastructure Layer (The Mechanics)
1.  **Database Pool**: generic `pg` pool setup in `Infrastructures/database/postgres/pool.js`.
2.  **Repository Implementation**: Concrete classes extending Domain repositories (e.g., `UserRepositoryPostgres`).
    *   Use `pool.query` to interact with DB.
    *   Map DB results to Domain entities.
3.  **Security Implementation**:
    *   `BcryptPasswordHash`: Extends a Domain `PasswordHash` abstraction.
    *   `JwtTokenManager`: Extends a Domain `AuthenticationTokenManager` abstraction.

#### C. Application Layer (The Orchestration)
1.  **Use Cases**: Classes that orchestrate the flow (e.g., `AddUserUseCase`).
    *   Inject dependencies (repositories, security tools) via constructor.
    *   Validate input using Domain entities.
    *   Call repository methods.

#### D. Interface Layer (The Entry)
1.  **Handlers**: Classes that handle HTTP requests (e.g., `UsersHandler`).
    *   Extract data from `req.body` / `req.params`.
    *   Execute Use Cases (getting instances from Container).
    *   Format and send responses.
2.  **Routes**: Define URL paths and methods (e.g., `routes.js` or directly in `index.js` using Express router).

#### E. Wiring (Dependency Injection)
1.  **Container (`src/Infrastructures/container.js`)**:
    *   Use `instances-container` to register all classes.
    *   Define parameters (dependencies) for each class.
    *   This ensures loose coupling.

#### F. Server Entry
1.  **Create Server (`src/Infrastructures/http/createServer.js`)**:
    *   Initialize Express app.
    *   Register middleware (cors, json parsing).
    *   Register routes from Interfaces.
    *   Setup global error handling (translating Domain errors to HTTP responses).
2.  **App Entry (`src/app.js`)**:
    *   Load env vars.
    *   Create server with container.
    *   Start listening.

## 6. Testing Strategy

*   **Unit Tests**: Test Entities and Use Cases in isolation using **Jest** and mocks.
*   **Integration Tests**: Test Repository implementations using the real `forumapi_test` database.
*   **Functional/E2E Tests**: Test HTTP endpoints using **Supertest**.
*   **Utilities**: Create helper functions (e.g., `UsersTableTestHelper`) to manipulate DB state directly during tests.

## 7. Running the Project

*   **Development**: `npm run start:dev`
*   **Production**: `npm start`
*   **Test**: `npm test`
