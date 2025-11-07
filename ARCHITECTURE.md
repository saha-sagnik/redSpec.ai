# redSpec.AI - Complete Architecture

## Problem Statement (Makeathon'25)
Build an AI agent that takes a basic PRD draft and automatically generates a detailed, well-structured PRD with design mocks aligned with redBus product principles. Automate the "first 70%" of product planning work.

## Enhanced Requirements
1. **Company Context Awareness** - Not generic ChatGPT responses, but redBus-specific output
2. **Real Codebase Integration** - Fetch actual GitHub repos and analyze real files
3. **Chat Interface** - Conversational PRD generation with live streaming
4. **PRD Validation** - Ensure quality and completeness
5. **Wireframes/Mocks** - Generate design artifacts aligned with design system
6. **JIRA Integration** - Auto-create tickets with story points
7. **Analytics Tracking** - Include GA events and tracking parameters
8. **Story Point Calculation** - Agile estimation based on impact analysis
9. **Release Notes Integration** - Context from past releases

---

## 🏗️ Multi-Agent System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR AGENT                           │
│         (Manages conversation flow & agent coordination)        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1: CONTEXT GATHERING                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Agent 1: Context Extraction Agent                              │
│  ├─ Load redBus product principles                              │
│  ├─ Access design system guidelines                             │
│  ├─ Understand tech stack & constraints                         │
│  ├─ Load user demographics & market context                     │
│  └─ Extract key info from rough PRD draft                       │
│                                                                  │
│  Agent 2: Codebase Fetcher Agent                                │
│  ├─ Accept GitHub/GitLab URL                                    │
│  ├─ Clone/fetch repository                                      │
│  ├─ Index files and build codebase map                          │
│  ├─ Identify architecture patterns                              │
│  └─ Provide searchable code interface                           │
│                                                                  │
│  Agent 3: Release Notes Analyzer Agent                          │
│  ├─ Fetch past release notes                                    │
│  ├─ Understand recent changes                                   │
│  ├─ Identify related features                                   │
│  └─ Provide historical context                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 2: PRD GENERATION (Conversational)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Agent 4: Conversational PRD Generator                          │
│  ├─ Ask clarifying questions in chat                            │
│  ├─ Use company context from Phase 1                            │
│  ├─ Stream PRD sections in real-time                            │
│  ├─ Follow redBus product principles                            │
│  ├─ Include user journeys & acceptance criteria                 │
│  └─ Generate success metrics                                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 3: TECHNICAL ANALYSIS                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Agent 5: Real Code Impact Analyzer                             │
│  ├─ Analyze actual codebase files                               │
│  ├─ Identify specific impacted files with line numbers          │
│  ├─ Map PRD requirements to code changes                        │
│  ├─ Detect architectural changes needed                         │
│  ├─ Identify dependencies & side effects                        │
│  └─ Generate file-level impact report                           │
│                                                                  │
│  Agent 6: Story Point Calculator Agent                          │
│  ├─ Analyze impact area (High/Medium/Low)                       │
│  ├─ Count affected files & complexity                           │
│  ├─ Consider dependencies & risk                                │
│  ├─ Calculate story points per user story                       │
│  ├─ Provide effort breakdown                                    │
│  └─ Generate sprint planning estimates                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 4: DESIGN & TRACKING                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Agent 7: Design & Wireframe Generator                          │
│  ├─ Generate wireframes aligned with redBus design system       │
│  ├─ Create first-cut mockups                                    │
│  ├─ Follow UI/UX guidelines                                     │
│  ├─ Generate component specifications                           │
│  └─ Include responsive design considerations                    │
│                                                                  │
│  Agent 8: Analytics Tracking Agent                              │
│  ├─ Define GA events for feature                                │
│  ├─ Specify tracking parameters                                 │
│  ├─ Map user actions to events                                  │
│  ├─ Define conversion funnels                                   │
│  └─ Create analytics implementation guide                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 5: VALIDATION & INTEGRATION                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Agent 9: PRD Validator Agent                                   │
│  ├─ Check PRD completeness                                      │
│  ├─ Validate against redBus standards                           │
│  ├─ Ensure all sections present                                 │
│  ├─ Check for ambiguities                                       │
│  ├─ Verify acceptance criteria quality                          │
│  └─ Score PRD quality (0-100)                                   │
│                                                                  │
│  Agent 10: JIRA Integration Agent                               │
│  ├─ Parse PRD into JIRA tickets                                 │
│  ├─ Create epics from features                                  │
│  ├─ Generate user stories with story points                     │
│  ├─ Add acceptance criteria to tickets                          │
│  ├─ Link related tickets                                        │
│  ├─ Assign to appropriate sprints                               │
│  └─ Auto-populate fields (priority, labels, etc.)               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  FINAL OUTPUT                                                   │
├─────────────────────────────────────────────────────────────────┤
│  ✅ Complete PRD with company context                           │
│  ✅ Real codebase impact analysis (actual file paths)           │
│  ✅ Design wireframes/mocks                                     │
│  ✅ Story points for each story                                 │
│  ✅ GA tracking events defined                                  │
│  ✅ JIRA tickets created                                        │
│  ✅ Validated & ready for stakeholder discussion                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow

### Input
```json
{
  "rough_prd": "Add real-time bus tracking feature",
  "github_repo": "https://github.com/redbus/mobile-app",
  "company_context": "redBus",
  "conversation_mode": true
}
```

### Output
```json
{
  "prd": {
    "problem_statement": "...",
    "user_stories": [...],
    "acceptance_criteria": [...],
    "success_metrics": [...],
    "wireframes": [...]
  },
  "code_impact": {
    "affected_files": [
      {
        "path": "app/services/TrackingService.java",
        "lines": [42, 67, 103],
        "impact": "HIGH",
        "changes_needed": "Add WebSocket connection for real-time updates"
      }
    ],
    "new_files": [...],
    "architecture_changes": [...]
  },
  "story_points": {
    "total": 21,
    "stories": [
      {"title": "GPS integration", "points": 8, "impact": "HIGH"},
      {"title": "Real-time UI updates", "points": 5, "impact": "MEDIUM"}
    ]
  },
  "analytics": {
    "events": [
      {"name": "bus_tracking_started", "params": ["bus_id", "route_id"]},
      {"name": "location_updated", "params": ["lat", "lng", "timestamp"]}
    ]
  },
  "jira_tickets": [
    {"key": "PROD-123", "type": "Epic", "title": "..."},
    {"key": "PROD-124", "type": "Story", "points": 8}
  ],
  "validation_score": 92
}
```

---

## 🎨 Frontend Interface

### Chat + PRD Viewer (Split Screen)

```
┌────────────────────────────────────────────────────────────────┐
│  redSpec.AI - Product Spec Generator                          │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────┐  ┌────────────────────────────────┐   │
│  │  CHAT (Left)       │  │  PRD VIEWER (Right)            │   │
│  ├────────────────────┤  ├────────────────────────────────┤   │
│  │                    │  │  # Product Requirements Doc    │   │
│  │ 🤖 Agent:          │  │                                │   │
│  │ Hi! Tell me about  │  │  ## Problem Statement          │   │
│  │ your feature idea  │  │  [Streaming live...]           │   │
│  │                    │  │                                │   │
│  │ 👤 You:            │  │  ## User Stories               │   │
│  │ Real-time bus      │  │  - As a user, I want to...    │   │
│  │ tracking           │  │                                │   │
│  │                    │  │  ## Code Impact                │   │
│  │ 🤖 Agent:          │  │  ### Affected Files            │   │
│  │ Great! What's the  │  │  - TrackingService.java:42    │   │
│  │ codebase URL?      │  │                                │   │
│  │                    │  │  ## Story Points: 21           │   │
│  │ 👤 You:            │  │                                │   │
│  │ github.com/...     │  │  ## Wireframes                 │   │
│  │                    │  │  [Design preview...]           │   │
│  │ 🤖 Agent:          │  │                                │   │
│  │ Analyzing code...  │  │  ## Analytics Events           │   │
│  │ Found 15 affected  │  │  - bus_tracking_started        │   │
│  │ files!             │  │                                │   │
│  │                    │  │  ## JIRA Tickets               │   │
│  │ [Progress: 60%]    │  │  - PROD-123 (Epic) - 21 pts   │   │
│  │                    │  │                                │   │
│  └────────────────────┘  └────────────────────────────────┘   │
│                                                                 │
│  [Input box...] 💬                           [Export] [JIRA]  │
└────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend (Python)
- **Google ADK** - Agent framework
- **Google Gemini 2.5 Flash** - LLM
- **FastAPI** - API endpoints
- **GitPython** - GitHub integration
- **Tree-sitter** - Code parsing
- **JIRA Python SDK** - JIRA integration

### Frontend (Next.js)
- **Next.js 15** - Framework
- **React 19** - UI
- **TailwindCSS** - Styling
- **Server-Sent Events (SSE)** - Streaming
- **shadcn/ui** - Component library

### Tools & Integration
- **GitHub API** - Repo fetching
- **JIRA REST API** - Ticket creation
- **Mermaid/Excalidraw** - Wireframes
- **Vector DB (optional)** - Company knowledge RAG

---

## 📁 Project Structure

```
my_agent/
├── agents/
│   ├── context_extraction_agent.py       # Agent 1
│   ├── codebase_fetcher_agent.py         # Agent 2
│   ├── release_notes_agent.py            # Agent 3
│   ├── conversational_prd_agent.py       # Agent 4
│   ├── code_impact_agent.py              # Agent 5
│   ├── story_point_calculator_agent.py   # Agent 6
│   ├── design_wireframe_agent.py         # Agent 7
│   ├── analytics_tracking_agent.py       # Agent 8
│   ├── prd_validator_agent.py            # Agent 9
│   └── jira_integration_agent.py         # Agent 10
│
├── tools/
│   ├── github_tool.py                    # GitHub API integration
│   ├── jira_tool.py                      # JIRA API integration
│   ├── code_parser_tool.py               # Code analysis utilities
│   └── wireframe_generator_tool.py       # Design generation
│
├── knowledge/
│   ├── redbus_context.json               # Company knowledge base
│   ├── design_system.json                # UI/UX guidelines
│   └── tech_stack.json                   # Technical constraints
│
├── orchestrator.py                       # Main orchestration logic
├── api.py                                # FastAPI backend
└── requirements.txt

redspec.ai/                               # Next.js frontend
├── app/
│   ├── page.tsx                          # Main chat interface
│   ├── api/
│   │   ├── chat/route.ts                 # Chat API
│   │   ├── prd-stream/route.ts           # SSE streaming
│   │   └── jira/route.ts                 # JIRA integration
│   └── components/
│       ├── ChatPanel.tsx                 # Left side chat
│       ├── PRDViewer.tsx                 # Right side PRD
│       └── ProgressTracker.tsx           # Progress indicator
```

---

## 🚀 Implementation Plan

1. **Phase 1**: Build all 10 agents with proper tools
2. **Phase 2**: Implement orchestrator with conversation flow
3. **Phase 3**: Build FastAPI backend with streaming
4. **Phase 4**: Create Next.js frontend with split-screen UI
5. **Phase 5**: Integrate GitHub + JIRA APIs
6. **Phase 6**: Add company knowledge base & validation
7. **Phase 7**: Testing & refinement

---

## 🎯 Key Differentiators (vs ChatGPT)

✅ **Company-specific context** - Not generic, redBus-aware
✅ **Real codebase analysis** - Actual files, not assumptions
✅ **Live streaming** - Watch PRD being built
✅ **Story point calculation** - Agile estimation automated
✅ **JIRA integration** - One-click ticket creation
✅ **Analytics tracking** - GA events included by default
✅ **Design artifacts** - Wireframes aligned with design system
✅ **PRD validation** - Quality scoring & completeness check
✅ **Conversational** - Ask questions, iterate, refine
