# Dicoding Backend Expert - Forum API

A robust and scalable forum API built with **Express.js** framework, implementing **Clean Architecture** principles and comprehensive testing coverage.

**Author:** Muhammad Sya'bani Falif  
**Email:** msfalif404@gmail.com

## 🚀 Features

- **User Management**: Registration, authentication, and authorization
- **Thread Management**: Create and retrieve forum threads
- **Comment System**: Add and delete comments on threads
- **Reply System**: Reply to comments with nested structure
- **JWT Authentication**: Secure token-based authentication
- **PostgreSQL Database**: Robust data persistence
- **Clean Architecture**: Separation of concerns with domain-driven design
- **Comprehensive Testing**: Unit and integration tests with high coverage
- **Database Migrations**: Version-controlled database schema

## 🏗️ Architecture

This project follows **Clean Architecture** principles with clear separation of layers:

```
src/
├── Applications/     # Application business rules
├── Commons/         # Shared utilities and exceptions
├── Domains/         # Enterprise business rules
├── Infrastructures/ # External interfaces (DB, HTTP)
└── Interfaces/      # Controllers and routes
```

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Testing**: Jest
- **Migration**: node-pg-migrate
- **Code Quality**: ESLint with Airbnb config

## 📦 Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd Hepi
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database configuration
```

4. Run database migrations:
```bash
npm run migrate up
```

## 🚀 Usage

### Development
```bash
npm run start:dev
```

### Production
```bash
npm start
```

### Testing
```bash
# Run all tests with coverage
npm test

# Run specific test
npm run test-thread

# Watch mode
npm run test:watch
```

## 📊 API Endpoints

### Authentication
- `POST /authentications` - Login user
- `PUT /authentications` - Refresh token
- `DELETE /authentications` - Logout user

### Users
- `POST /users` - Register new user

### Threads
- `POST /threads` - Create new thread
- `GET /threads/{id}` - Get thread details

### Comments
- `POST /threads/{threadId}/comments` - Add comment
- `DELETE /threads/{threadId}/comments/{commentId}` - Delete comment

### Comment Replies
- `POST /threads/{threadId}/comments/{commentId}/replies` - Add reply
- `DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}` - Delete reply

## 🧪 Testing Strategy

- **Unit Tests**: Domain entities and use cases
- **Integration Tests**: Repository implementations
- **End-to-End Tests**: HTTP endpoints
- **Coverage**: Maintained above 90%

## 📁 Project Structure Details

### Domains Layer
Contains enterprise business rules and entities:
- User management entities
- Thread and comment entities
- Repository interfaces

### Applications Layer
Contains application-specific business rules:
- Use cases for each feature
- Security abstractions
- Application services

### Infrastructures Layer
Contains external interface implementations:
- PostgreSQL repository implementations
- JWT token management
- Password hashing
- HTTP server configuration

### Interfaces Layer
Contains controllers and route definitions:
- HTTP handlers
- Request/response formatting
- Route configurations

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Owner validation for resource access
- Input validation and sanitization
- SQL injection prevention

## 📈 Performance Considerations

- Connection pooling for database
- Efficient query patterns
- Proper indexing strategy
- Caching mechanisms ready