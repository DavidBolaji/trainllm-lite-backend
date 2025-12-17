# Train LLM Backend

A Node.js/Express backend service that provides AI-powered immigration guidance using RAG (Retrieval-Augmented Generation) architecture with OpenAI and Pinecone.

## 🏗️ Architecture

The backend follows a modular architecture with clear separation of concerns:

```
backend/
├── src/
│   ├── clients/          # External service clients
│   ├── eval/            # Response evaluation and feedback
│   ├── rag/             # RAG pipeline components
│   ├── routes/          # API route handlers
│   ├── services/        # Business logic services
│   └── workflows/       # Intent detection and routing
├── data/                # Static data and feedback storage
├── uploads/             # Temporary audio file storage
└── .env                 # Environment configuration
```

## 🚀 Features

### Core Functionality
- **RAG Pipeline**: Document retrieval and AI-powered answer generation
- **Multi-language Support**: Translation services for 2+ languages
- **Speech-to-Text**: Audio input processing via OpenAI Whisper
- **Intent Detection**: Smart routing based on question type
- **Response Evaluation**: Automated quality assessment and feedback collection

### Supported Languages
- English (en)
- French (fr)

## 📋 Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- OpenAI API key
- Pinecone API key and environment

## 🛠️ Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following environment variables:
   ```env
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Pinecone Configuration
   PINECONE_API_KEY=your_pinecone_api_key_here
   PINECONE_ENVIRONMENT=your_pinecone_environment
   PINECONE_INDEX_NAME=your_index_name
   
   # Server Configuration
   PORT=5000
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### 1. Text Questions
```http
POST /api/question
Content-Type: application/json

{
  "question": "Am I eligible for a UK work visa?",
  "language": "en",
  "conversation": [
    {
      "question": "Previous question",
      "answer": "Previous answer"
    }
  ]
}
```

**Response:**
```json
{
  "answer": "Based on the information provided...",
  "intent": "visa_eligibility"
}
```

#### 2. Audio Questions
```http
POST /api/audio
Content-Type: multipart/form-data

FormData:
- audio: [audio file - mp4, webm, ogg, wav]
- language: "en"
```

**Response:**
```json
{
  "answer": "Transcribed and processed response...",
  "intent": "general_info"
}
```

#### 3. Feedback Collection
```http
POST /api/feedback

{
  "question": "User's question",
  "answer": "AI response",
  "sources": ["source1", "source2"],
  "rating": 4
}
```

#### 4. Health Check
```http
GET /health
```

## 🧩 Core Components

### RAG Pipeline (`src/rag/`)
- **Document Loading**: Processes immigration documents from `/data/documents/`
- **Text Chunking**: Splits documents into searchable segments
- **Vector Storage**: Pinecone integration for semantic search
- **Context Retrieval**: Finds relevant document sections
- **Answer Generation**: OpenAI-powered response synthesis

### Services (`src/services/`)
- **Speech-to-Text**: Whisper API integration for audio processing
- **Translation**: Multi-language support via OpenAI

### Workflows (`src/workflows/`)
- **Intent Detection**: Classifies questions into categories:
  - `visa_eligibility`
  - `document_requirements`
  - `processing_times`
  - `general_info`
- **Smart Routing**: Directs questions to appropriate handlers

### Evaluation (`src/eval/`)
- **Response Quality**: Automated scoring based on relevance and accuracy
- **Feedback Collection**: Stores user ratings and AI evaluations
- **Performance Metrics**: Tracks system performance over time

## 🗂️ Data Management

### Document Storage
Immigration documents are stored in `/data/documents/`:
- `canada_immigrations.txt`
- `uk_visa_faq.txt`
- `diaspora_services.txt`

### Feedback Storage
User and AI feedback is collected in `/data/feedback.json` for continuous improvement.

### Audio Processing
Temporary audio files are stored in `/uploads/` and automatically cleaned up after processing.

## 🔧 Development

### Available Scripts
```bash
# Development with hot reload
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

### Code Structure
- **TypeScript**: Full type safety throughout the codebase
- **Modular Design**: Clear separation between RAG, services, and routes
- **Error Handling**: Comprehensive error handling with fallbacks
- **Logging**: Detailed logging for debugging and monitoring

### Adding New Documents
1. Place documents in `/data/documents/`
2. Restart the server to rebuild the vector index
3. Documents are automatically chunked and indexed

## 🚀 Deployment

### Production Build
```bash
pnpm build
pnpm start
```

### Environment Variables
Ensure all required environment variables are set in production:
- `OPENAI_API_KEY`
- `PINECONE_API_KEY`
- `PINECONE_ENVIRONMENT`
- `PINECONE_INDEX_NAME`
- `PORT` (optional, defaults to 5000)

### Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## 🧪 Testing

The system includes built-in evaluation mechanisms:
- Response quality scoring
- Source relevance assessment
- User feedback collection
- Performance monitoring

## 📈 Monitoring

### Health Checks
- `/health` endpoint for service monitoring
- Automatic error logging and fallback responses

### Performance Metrics
- Response evaluation scores stored in feedback system
- Processing time tracking
- Error rate monitoring

## 🤝 Contributing

1. Follow TypeScript best practices
2. Maintain modular architecture
3. Add comprehensive error handling
4. Update documentation for new features
5. Test with multiple languages and document types

## 📄 License

This project is licensed under the ISC License.