# Inzira - Your Intelligent Career Journey 

**Inzira** is an enterprise-grade, AI-powered career development backend platform designed to improve employability for students and job seekers. The system provides automated resume analysis, ATS compatibility matching, personalized career roadmaps, and interactive AI mock interviews.

Built using **NestJS**, **TypeScript**, **PostgreSQL**, and **Prisma ORM**, the system follows modern, scalable SaaS architectural principles.

---

## ✨ Features

- 🔑 **Secure Authentication**: JWT-based authentication system using Passport.js, bcrypt password hashing, and role-based access control (`@Roles()` and `@CurrentUser()` decorators).
- 📄 **Resume Pipeline**: Upload and validate `.pdf` and `.docx` documents. Files are stored securely on Cloudinary, raw text is extracted, metadata is saved, and AI analysis is automatically triggered.
- 🤖 **AI-Powered Diagnostics**: Resume matching, ATS scoring, strengths/weaknesses identification, and actionable feedback powered by LLM integrations.
- 🎯 **Skill-Gap Detection**: Compare resume experience against target job descriptions to pinpoint missing skills and suggest learning resources.
- 🗺️ **Personalized Roadmaps**: Dynamically generated career transition steps. Includes interactive step completion tracking that automatically recalculates overall progression metrics.
- 🎙️ **AI Mock Interviews**: Generate 5 challenging questions based on a specific role and topic. Submit answers to receive grading, score averages, and detailed feedback.

---

## 🛠️ Tech Stack

- **Backend Framework**: NestJS (v11+)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma ORM (v7+) with Native Driver Adapters
- **Authentication**: JWT + Passport.js
- **Password Hashing**: bcrypt
- **Validation**: class-validator + DTOs
- **File Uploads**: Cloudinary API
- **AI Integration**: OpenAI SDK (compatible with OpenAI, Groq, Ollama, etc.)

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory using the layout from `.env.example`:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/inzira_db?schema=public"

# Authentication Secrets
JWT_SECRET="your-super-secure-jwt-key"
JWT_EXPIRES_IN="1d"

# Cloudinary Credentials
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# AI Integrations (OpenAI / Groq / Ollama)
OPENAI_API_KEY="your_api_key_here"
OPENAI_BASE_URL="https://api.groq.com/openai/v1" # Optional: For Groq or Ollama
OPENAI_MODEL="llama-3.3-70b-versatile"          # Optional: Model name
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Database Migrations
Apply the Prisma schema to compile the PostgreSQL tables:
```bash
npx prisma migrate dev --name init
```

### 3. Start the Server
Run the NestJS application in development mode:
```bash
npm run start:dev
```
The server will start at: `http://localhost:3000/api`

---

## 🔌 API Documentation

All request payloads are validated using class-validator DTOs. Protected routes require a Bearer token in the header (`Authorization: Bearer <JWT_TOKEN>`).

### Auth Module
- `POST /api/auth/register` - Create a new account.
- `POST /api/auth/login` - Authenticate and retrieve access token.
- `GET /api/users/profile` *(Protected)* - Get current user profile details.

### Resume Module
- `POST /api/resume/upload` *(Protected, multipart/form-data)* - Upload a resume (`file` field). Runs extraction, saves metadata, and auto-generates AI diagnostics.
- `GET /api/resume/:id` *(Protected)* - Fetch metadata and analysis history.

### AI Diagnostics Module
- `POST /api/ai/analyze` *(Protected)* - Manually trigger resume analysis.
- `POST /api/ai/skill-gap` *(Protected)* - Scan latest resume against target role.
- `POST /api/ai/roadmap` *(Protected)* - Generate career roadmap.

### Roadmap Module
- `GET /api/roadmap/my-roadmaps` *(Protected)* - List career roadmaps.
- `GET /api/roadmap/:id` *(Protected)* - Retrieve roadmap steps.
- `PATCH /api/roadmap/:id/step/:stepIndex` *(Protected)* - Toggle step completion and recalculate progress.

### Interview Module
- `POST /api/interview/start` *(Protected)* - Create session and generate questions.
- `GET /api/interview/my-sessions` *(Protected)* - Get interview history.
- `GET /api/interview/:id` *(Protected)* - Get session details.
- `POST /api/interview/:id/submit` *(Protected)* - Submit answers to evaluate and grade.
