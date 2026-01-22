# todAI

A task management application built with Express.js, MongoDB, React, Redux Toolkit, and Material UI.

## Tech Stack

### Backend

- Express.js 5
- MongoDB with Mongoose 9
- TypeScript

### Frontend

- React 19
- Redux Toolkit with RTK Query
- Material UI 7
- Vite

## Prerequisites

- Node.js 20+
- Docker and Docker Compose (for MongoDB)

## Getting Started

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Start MongoDB

Start MongoDB using Docker Compose:

```bash
docker-compose up -d
```

This will start MongoDB on port 27017 with persistent data storage.

### 3. Start Development Servers

```bash
npm run dev
```

This will start:

- Backend server on http://localhost:5000
- Frontend dev server on http://localhost:5173

## Project Structure

```
todAI/
├── client/          # React frontend
│   ├── src/
│   │   ├── app/     # Redux store configuration
│   │   ├── features/# Feature-based modules (tasks)
│   │   ├── theme/   # MUI theme configuration
│   │   └── types/   # TypeScript types
│   └── ...
├── server/          # Express backend
│   ├── src/
│   │   ├── config/  # Database configuration
│   │   ├── controllers/
│   │   ├── models/  # Mongoose models
│   │   └── routes/  # API routes
│   └── ...
└── package.json     # Root package with monorepo scripts
```

## API Endpoints

| Method | Endpoint       | Description       |
| ------ | -------------- | ----------------- |
| GET    | /api/tasks     | Get all tasks     |
| GET    | /api/tasks/:id | Get task by ID    |
| POST   | /api/tasks     | Create a new task |
| PUT    | /api/tasks/:id | Update a task     |
| DELETE | /api/tasks/:id | Delete a task     |

## Task Schema

```typescript
{
    id: string;
    title: string;
    description: string;
    status: "todo" | "in-progress" | "done";
}
```
