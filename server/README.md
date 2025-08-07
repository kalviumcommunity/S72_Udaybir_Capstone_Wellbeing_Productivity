
# Student Hub Backend

This is the backend server for the Student Hub application, built using Express, MongoDB, and Node.js.

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- MongoDB (local instance or MongoDB Atlas)

### Setup

1. Clone the repository and navigate to the server directory
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on the `.env.example`:
   ```
   cp .env.example .env
   ```
4. Edit the `.env` file and set the following:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secret key for JWT token generation
   - `PORT`: The port for the server (default: 5000)

### Running the Server

#### Development Mode
```
npm run dev
```

#### Production Mode
```
npm start
```

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login a user
- `GET /api/users/profile` - Get current user profile (requires auth)
- `PUT /api/users/profile` - Update user profile (requires auth)

### Notes
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create a new note (requires auth)
- `GET /api/notes/:id` - Get a specific note
- `PUT /api/notes/:id` - Update a note (requires auth)
- `DELETE /api/notes/:id` - Delete a note (requires auth)
- `PUT /api/notes/like/:id` - Like a note (requires auth)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. For protected routes, include the token in the request header:

```
x-auth-token: YOUR_JWT_TOKEN
```
