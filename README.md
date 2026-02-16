# SkillSync Backend

AI-powered developer-project matching platform with intelligent recommendations using RAG (Retrieval-Augmented Generation) and vector search.

## 🚀 Features

- **AI-Powered Matching**: Uses vector embeddings and semantic search to match developers with projects
- **Smart Recommendations**: Google Gemini AI generates human-readable explanations for matches
- **Real-time Chat**: Socket.IO integration for instant messaging
- **Application System**: Complete workflow for applying to projects and managing applications
- **Notifications**: Real-time notification system for applications and matches
- **Background Processing**: Non-blocking AI computation for optimal performance

## 🛠️ Tech Stack

- **Runtime**: Node.js + Express.js
- **Database**: MongoDB Atlas with Vector Search
- **AI/ML**: 
  - @xenova/transformers (Vector Embeddings)
  - Google Gemini API (AI Reasoning)
  - MongoDB Atlas Vector Search
- **Real-time**: Socket.IO
- **Authentication**: JWT

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- Google Gemini API key

## ⚙️ Installation

1. **Clone the repository**
```bash
git clone https://github.com/Ragul2125/SkillSync-backend.git
cd SkillSync-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

4. **MongoDB Atlas Vector Search Setup**

Create a vector search index on your MongoDB Atlas cluster. See `backend_rag_utils/VECTOR_INDEX_SETUP.md` for detailed instructions.

5. **Start the server**
```bash
npm start
```

The server will run on `http://localhost:5000`

## 📁 Project Structure

```
SkillSync-backend/
├── controllers/          # Request handlers
│   ├── authController.js
│   ├── profileController.js
│   ├── projectController.js
│   ├── matchedController.js
│   ├── applicationController.js
│   ├── notificationController.js
│   └── chatController.js
├── model/               # MongoDB schemas
│   ├── userModel.js
│   ├── projectModel.js
│   ├── matchModel.js
│   ├── applicationModel.js
│   └── notificationModel.js
├── Routers/            # API routes
├── middlewares/        # Authentication & error handling
├── backend_rag_utils/  # AI/RAG utilities
│   ├── embeddings.js
│   ├── vectorSearch.js
│   └── matchReasoning.js
├── services/           # Background services
│   └── ragService.js
├── scripts/            # Utility scripts
│   ├── regenerateEmbeddings.js
│   ├── triggerMatching.js
│   └── debugMatches.js
└── utils/              # Helper functions
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Profile
- `GET /api/profile/:userId` - Get user profile
- `PUT /api/profile` - Update profile

### Projects
- `POST /api/project` - Create project
- `GET /api/project` - Get all projects
- `GET /api/project/:id` - Get specific project
- `PUT /api/project/:id` - Update project
- `DELETE /api/project/:id` - Delete project

### AI Matching
- `GET /api/matches/ai-matched-devs` - Get matched developers
- `GET /api/matches/ai-matched-projects` - Get matched projects
- `POST /api/matches/refresh` - Trigger background matching

### Applications
- `POST /api/applications/apply` - Apply to project
- `GET /api/applications/my-applications` - Get user's applications
- `GET /api/applications/project/:projectId` - Get project applications (owner only)
- `PATCH /api/applications/:id/status` - Update application status (owner only)

### Notifications
- `GET /api/notifications` - Get notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read

### Dashboard
- `GET /api/dashboard/statistics` - Get dashboard stats
- `GET /api/dashboard/projects` - Get recent projects
- `GET /api/dashboard/matcheddev` - Get top matched developers
- `GET /api/dashboard/matchedproject` - Get top matched projects

## 🤖 AI Matching System

### How It Works

1. **Embedding Generation**: When users create profiles or projects, text is converted to 384-dimensional vectors using transformers
2. **Vector Search**: MongoDB Atlas Vector Search finds semantically similar items
3. **AI Reasoning**: Google Gemini generates human-readable explanations for why items match
4. **Background Processing**: Matching runs asynchronously to avoid blocking requests

### Utility Scripts

**Regenerate Embeddings** (after data migration):
```bash
node scripts/regenerateEmbeddings.js
```

**Trigger Matching** (for specific user):
```bash
node scripts/triggerMatching.js <userId>
```

**Debug Matches** (view match data):
```bash
node scripts/debugMatches.js
```

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 🚨 Error Handling

The API uses consistent error responses:
```json
{
  "message": "Error description",
  "statusCode": 400
}
```

## 📊 Database Models

- **User**: Profile, skills, bio, embeddings
- **Project**: Details, tech stack, team members, embeddings
- **Match**: AI-generated matches with reasoning and scores
- **Application**: Application submissions with status tracking
- **Notification**: User notifications with read status
- **Conversation**: Chat conversations
- **Message**: Chat messages

## 🔄 Background Jobs

The RAG service automatically:
- Computes matches when users update profiles
- Finds developers when projects are created
- Generates AI reasoning for all matches
- Handles rate limiting with exponential backoff

## 🌐 Deployment

The application is deployed on Render. Environment variables must be configured in the Render dashboard.

## 📝 License

ISC

## 👥 Author

Ragul

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📧 Support

For issues or questions, please open an issue on GitHub.
