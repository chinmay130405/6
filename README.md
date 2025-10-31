# JWT Authentication Backend

A minimal Node.js + Express backend with JWT authentication and role-based access control (RBAC).

## Features

- User registration with hashed passwords (bcryptjs)
- JWT-based authentication
- Role-based access control (admin, user)
- In-memory user storage
- Protected routes
- Minimal setup - single file implementation

## Installation

1. Install dependencies:
```bash
npm install
```

## Running the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### 1. Register a User
**POST** `/register`

Create a new user account.

**Request Body:**
```json
{
  "username": "john",
  "password": "password123",
  "role": "user"
}
```

**Roles:** `admin` or `user` (defaults to `user` if not specified)

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "john",
    "role": "user"
  }
}
```

### 2. Login
**POST** `/login`

Authenticate and receive a JWT token.

**Request Body:**
```json
{
  "username": "john",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john",
    "role": "user"
  }
}
```

### 3. Dashboard (Protected)
**GET** `/dashboard`

Accessible to any authenticated user.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "message": "Welcome to your dashboard!",
  "user": {
    "id": 1,
    "username": "john",
    "role": "user"
  }
}
```

### 4. Admin Panel (Admin Only)
**GET** `/admin`

Accessible only to users with `admin` role.

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "message": "Welcome to the admin panel!",
  "user": {
    "id": 2,
    "username": "admin",
    "role": "admin"
  },
  "allUsers": [...]
}
```

## Testing with cURL

### 1. Register a regular user:
```bash
curl -X POST http://localhost:3000/register -H "Content-Type: application/json" -d "{\"username\":\"john\",\"password\":\"pass123\",\"role\":\"user\"}"
```

### 2. Register an admin user:
```bash
curl -X POST http://localhost:3000/register -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\",\"role\":\"admin\"}"
```

### 3. Login:
```bash
curl -X POST http://localhost:3000/login -H "Content-Type: application/json" -d "{\"username\":\"john\",\"password\":\"pass123\"}"
```

Copy the `token` from the response.

### 4. Access Dashboard (replace TOKEN with your actual token):
```bash
curl -X GET http://localhost:3000/dashboard -H "Authorization: Bearer TOKEN"
```

### 5. Access Admin Panel (requires admin token):
```bash
curl -X GET http://localhost:3000/admin -H "Authorization: Bearer TOKEN"
```

## Testing with Postman

1. **Register**: POST to `http://localhost:3000/register` with JSON body
2. **Login**: POST to `http://localhost:3000/login` with JSON body
3. **Copy the token** from login response
4. **Access Protected Routes**: 
   - Add header: `Authorization: Bearer <your-token>`
   - GET `http://localhost:3000/dashboard`
   - GET `http://localhost:3000/admin` (only works with admin token)

## Project Structure

```
.
├── package.json       # Dependencies and scripts
├── server.js          # Main application file
└── README.md          # This file
```

## Security Notes

⚠️ **Important for Production:**
- Change `JWT_SECRET` to a strong, random secret
- Use environment variables for secrets
- Implement a real database instead of in-memory storage
- Add rate limiting
- Implement token refresh mechanism
- Use HTTPS
- Add input validation and sanitization
- Implement password strength requirements

## Technologies Used

- **Express.js** - Web framework
- **jsonwebtoken** - JWT generation and verification
- **bcryptjs** - Password hashing

## License

ISC
