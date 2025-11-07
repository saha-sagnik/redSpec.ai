# redSpec.AI 🚀

**AI-powered Product Specification Generator for redBus**

Automates the first 70% of product planning by transforming rough ideas into comprehensive, company-aware PRDs with real codebase analysis, story points, analytics tracking, and JIRA integration.

---

## 🎯 What It Does

redSpec.AI is a **multi-agent AI system** that:

1. **Fetches & Analyzes Real Codebases** - Clones GitHub repos and identifies actual files to modify
2. **Generates Company-Aware PRDs** - Uses redBus context, not generic ChatGPT responses
3. **Calculates Story Points** - Fibonacci-based Agile estimation
4. **Creates Design Specs** - Wireframes aligned with redBus Design System
5. **Defines Analytics** - Complete GA4 + Mixpanel tracking strategy
6. **Validates Quality** - PRD scoring (0-100)
7. **Auto-Creates JIRA Tickets** - Epics, stories, tasks with acceptance criteria

---

## 🏗️ Architecture

### 10 Specialized Agents:

**Phase 1: Context Gathering**
1. Context Extraction Agent - Loads redBus company knowledge
2. Codebase Fetcher Agent - Clones & analyzes GitHub repos
3. Release Notes Analyzer - Learns from past releases

**Phase 2: PRD Generation**
4. Conversational PRD Agent - Interactive PRD generation

**Phase 3: Technical Analysis**
5. Code Impact Analyzer - Real file-level analysis
6. Story Point Calculator - Fibonacci estimation

**Phase 4: Design & Tracking**
7. Design & Wireframe Generator - ASCII wireframes + specs
8. Analytics Tracking Agent - GA4 events & funnels

**Phase 5: Validation & Integration**
9. PRD Validator - Quality scoring
10. JIRA Integration Agent - Auto-create tickets

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (for Next.js frontend)
- Python 3.9+ (for AI agents)
- Google API Key (for Gemini)

### Installation

```bash
# 1. Clone the repository
cd redspec.ai

# 2. Install Node.js dependencies
npm install

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Set up environment variables
cp .env.example .env
# Add your GOOGLE_API_KEY to .env

# 5. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
redspec.ai/
├── app/
│   ├── page.tsx                    # Main chat interface
│   ├── api/
│   │   ├── chat/route.ts           # Chat API
│   │   └── stream/route.ts         # SSE streaming API
│   └── layout.tsx
│
├── agents/                         # 10 AI Agents
│   ├── context_extraction_agent.py
│   ├── codebase_fetcher_agent.py
│   ├── release_notes_agent.py
│   ├── conversational_prd_agent.py
│   ├── code_impact_agent.py
│   ├── story_point_calculator_agent.py
│   ├── design_wireframe_agent.py
│   ├── analytics_tracking_agent.py
│   ├── prd_validator_agent.py
│   └── jira_integration_agent.py
│
├── tools/
│   └── github_tool.py              # GitHub integration
│
├── knowledge/
│   └── redbus_context.json         # Company knowledge base
│
├── orchestrator.py                 # Agent coordination
├── requirements.txt                # Python dependencies
├── package.json                    # Node.js dependencies
└── README_REDSPEC.md               # This file
```

---

## 🎨 Features

### Chat Interface
- Split-screen design (Chat | PRD Viewer)
- Real-time conversation with AI
- GitHub repository input
- Progress tracking

### PRD Generation
- **Streaming**: Watch PRD being built live
- **14 Sections**: Complete, structured PRD
- **Company-Aware**: Uses redBus context
- **Interactive**: Agent asks clarifying questions

### Code Analysis
- **Real Repos**: Fetches actual GitHub repositories
- **File-Level**: Specific file paths + line numbers
- **Dependencies**: Identifies what else is affected
- **Risk Assessment**: Flags potential issues

### Story Points
- **Fibonacci Scale**: 1, 2, 3, 5, 8, 13, 21
- **Factors**: Complexity, impact, dependencies, risk
- **Breakdown**: Per-story estimation
- **Confidence**: Estimation confidence level

### Design Specs
- **ASCII Wireframes**: Text-based mockups
- **Component Specs**: Detailed specifications
- **Design Tokens**: Colors, typography, spacing
- **RDS Aligned**: redBus Design System compliant

### Analytics
- **GA4 Events**: Complete event taxonomy
- **Mixpanel**: Product analytics setup
- **Funnels**: Conversion funnel mapping
- **Implementation**: Code examples included

### Validation
- **Quality Score**: 0-100 scoring
- **Checklist**: 10-section validation
- **Feedback**: Specific improvements needed
- **Grading**: A+ to F

### JIRA Integration
- **Auto-Create**: Epics, stories, tasks
- **Story Points**: Pre-populated
- **Acceptance Criteria**: Testable criteria
- **Dependencies**: Linked tickets

---

## 🔧 Configuration

### Environment Variables (.env)

```bash
# Required: Google API Key
GOOGLE_API_KEY=your_api_key_here

# Optional: Vertex AI
GOOGLE_GENAI_USE_VERTEXAI=false
```

### Company Context (knowledge/redbus_context.json)

Customize the knowledge base with your company's:
- Product principles
- Tech stack
- Design system
- User demographics
- Agile practices

---

## 📊 Usage Example

### 1. Start the App
```bash
npm run dev
```

### 2. Enter Product Idea
```
"Add real-time bus tracking with WebSocket updates and map visualization"
```

### 3. (Optional) Add GitHub Repo
```
https://github.com/redbus/mobile-app
```

### 4. Click "Generate Complete PRD"

### 5. Watch Magic Happen ✨
- Context gathered (10%)
- PRD generated (30%)
- Code analyzed (60%)
- Design created (80%)
- Validated & JIRA tickets created (100%)

### 6. Download Results
- Copy PRD
- Download as Markdown
- Export JIRA structure

---

## 🎯 What Makes This Special

| Feature | ChatGPT | redSpec.AI |
|---------|---------|------------|
| Company Context | ❌ Generic | ✅ redBus-specific |
| Real Codebase | ❌ No access | ✅ Fetches GitHub repos |
| Story Points | ❌ No | ✅ Fibonacci estimation |
| File-Level Analysis | ❌ Assumptions | ✅ Actual paths + lines |
| Design Specs | ❌ Generic | ✅ redBus Design System |
| Analytics | ❌ Basic | ✅ GA4 + Mixpanel complete |
| JIRA Integration | ❌ No | ✅ Auto-create tickets |
| PRD Validation | ❌ No | ✅ Quality scoring |
| Conversational | ✅ Yes | ✅ Yes + asks questions |

---

## 🛠️ Development

### Run Frontend Only
```bash
npm run dev
```

### Test Python Orchestrator
```bash
python3 orchestrator.py "Add feature X"
```

### Test Agents Individually
```python
from agents import conversational_prd_agent
from google.adk.runners import InMemoryRunner

runner = InMemoryRunner(agent=conversational_prd_agent)
events = await runner.run_debug("Add user authentication")

for event in events:
    if event.is_final_response():
        print(event.content.parts[0].text)
```

---

## 📝 API Endpoints

### POST /api/chat
Send chat messages

**Request**:
```json
{
  "message": "Add bus tracking feature",
  "githubRepo": "https://github.com/user/repo"
}
```

**Response**:
```json
{
  "success": true,
  "message": {
    "role": "assistant",
    "content": "Tell me more about...",
    "timestamp": "2025-01-07T12:00:00Z"
  }
}
```

### GET /api/stream
Server-Sent Events for real-time PRD generation

**Query Params**:
- `idea` (required): Product idea
- `repo` (optional): GitHub repository URL

**Events**:
- `progress`: Phase updates
- `prd_update`: PRD content streaming
- `complete`: Final summary
- `error`: Error messages

---

## 🧪 Testing

### Test Chat Interface
1. Open http://localhost:3000
2. Enter a product idea
3. Click "Send"
4. Verify agent responds

### Test PRD Generation
1. Enter idea + GitHub repo
2. Click "Generate Complete PRD"
3. Watch progress bar
4. Verify PRD streams to right panel

### Test GitHub Integration
```python
from tools.github_tool import GitHubTool

tool = GitHubTool()
result = tool.clone_repository("https://github.com/user/repo")
print(result)
```

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
vercel --prod
```

### Backend (Python)
- Deploy orchestrator as FastAPI service
- Or use serverless functions (AWS Lambda, Google Cloud Functions)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

---

## 📄 License

Internal use only - redBus/Makeathon'25

---

## 🏆 Makeathon'25 Alignment

**Problem**: Automate the "first 70%" of PRD work

**Solution**: Complete AI system that:
- ✅ Takes rough ideas → Detailed PRDs
- ✅ Generates design mocks/wireframes
- ✅ Aligns with company principles
- ✅ **Goes beyond**: Code analysis, story points, JIRA, analytics

**Differentiation**:
- Not just PRD generation (ChatGPT can do that)
- **Real codebase integration**
- **Company-specific context**
- **End-to-end automation**

---

## 📞 Support

For issues or questions, contact the team.

---

**Built with ❤️ using Google ADK, Gemini 2.0 Flash, and Next.js**
