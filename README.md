# Todo Web Application

A modern Todo web application built with Next.js, TypeScript, and Tailwind CSS. This application allows users to manage their tasks efficiently with features like creating, updating, deleting, and reordering todos using drag and drop.

### Login: admin@gmail.com || 12345

## Features

- 🔐 **Authentication**: Sign up and login functionality
- ✅ **Todo Management**: Create, read, update, and delete todos
- 🎯 **Priority Levels**: Assign priorities (Extreme, Moderate, Low) to todos
- 🔄 **Drag & Drop**: Reorder todos by dragging and dropping
- 📅 **Due Dates**: Set and track due dates for todos
- 🔍 **Search**: Search todos by title or description
- 👤 **Profile Management**: Update account information and profile picture
- 📱 **Responsive Design**: Fully responsive design for mobile, tablet, and desktop

## Tech Stack

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form + Zod
- **Drag & Drop**: @dnd-kit
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn installed
- MongoDB database (connection string required)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd todo
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
NEXT_PUBLIC_API_URL=/api
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/
JWT_SECRET=your-secret-jwt-key-change-in-production
MONGODB_DB_NAME=todo-app
```

4. Run the development server:
```bash
npm run dev
```



5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
todo/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── todos/
│   ├── profile/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── Layout.tsx
│   ├── Sidebar.tsx
│   └── Header.tsx
├── lib/
│   ├── api.ts
│   └── auth.ts
├── types/
│   └── index.ts
├── middleware.ts
└── package.json
```

## Pages

1. **Signup Page** (`/signup`): User registration with form validation
2. **Login Page** (`/login`): User authentication
3. **Todos Page** (`/todos`): Main todo management interface
   - Create new todos
   - Edit existing todos
   - Delete todos
   - Drag and drop to reorder
   - Search functionality
4. **Profile Page** (`/profile`): Account information management
   - Update personal information
   - Upload profile picture

## Database & API

The application uses MongoDB for data storage and Next.js API routes for the backend. All API endpoints are defined in `app/api/` and the client-side API calls are in `lib/api.ts`.

### MongoDB Collections

- **users**: Stores user accounts with hashed passwords
- **todos**: Stores todos associated with users

### API Endpoints

#### Authentication
- Login: `POST /api/auth/login`
- Signup: `POST /api/auth/signup`

#### Todos
- Get all todos: `GET /api/todos`
- Get todo by ID: `GET /api/todos/:id`
- Create todo: `POST /api/todos`
- Update todo: `PUT /api/todos/:id`
- Delete todo: `DELETE /api/todos/:id`
- Reorder todos: `PATCH /api/todos/reorder`

#### User Profile
- Get profile: `GET /api/user/profile`
- Update profile: `PUT /api/user/profile`
- Upload profile picture: `POST /api/user/profile/picture`

## Deployment

### Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_API_URL=https://todo-app.pioneeralpha.com`
4. Deploy

### Netlify

1. Push your code to GitHub
2. Import your repository in Netlify
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Add environment variables:
   - `NEXT_PUBLIC_API_URL=https://todo-app.pioneeralpha.com`
6. Deploy

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | API base URL (use `/api` for local) | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT token generation | Yes |
| `MONGODB_DB_NAME` | MongoDB database name | No (defaults to `todo-app`) |

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Notes

- The `.env` file is included in the repository as per requirements for configuration verification
- Authentication tokens are stored in localStorage
- The application handles authentication redirects client-side

## License

This project is created for the Front-End Developer screening task.
