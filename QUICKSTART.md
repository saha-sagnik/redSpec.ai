# 🚀 redSpec.AI - Quick Start Guide

## 30-Second Setup

```bash
cd /Users/sagnik.s/redspec.ai
npm run dev
```

Open: **http://localhost:3000**

---

## What You'll See

```
┌─────────────────────────────────────────────────────────────┐
│  redSpec.AI - Product Specification Generator               │
├──────────────────────┬──────────────────────────────────────┤
│  CHAT (Left)         │  PRD VIEWER (Right)                  │
├──────────────────────┼──────────────────────────────────────┤
│                      │                                      │
│  🤖: Welcome!        │  📄                                  │
│  Tell me your idea   │  PRD will appear here                │
│                      │                                      │
│  👤: Add tracking    │  Click "Generate PRD"                │
│                      │  to start                            │
│  [GitHub URL...]     │                                      │
│  [Your idea...]      │                                      │
│  [Send] [Generate]   │                                      │
└──────────────────────┴──────────────────────────────────────┘
```

---

## Try This First

**Input:**
```
GitHub: https://github.com/yourusername/yourrepo (optional)
Idea: Add real-time bus tracking with WebSocket updates
```

**Click:** 🚀 Generate Complete PRD

**Watch:**
- Progress bar: 0% → 100%
- PRD streaming on right side
- 5-10 minutes total

**Get:**
- Complete PRD (14 sections)
- Code impact analysis
- Story points (Fibonacci)
- Design wireframes
- Analytics events
- JIRA tickets
- Validation score

---

## Key Features

✅ **Company-Aware** - Uses redBus context  
✅ **Real Codebase** - Fetches GitHub repos  
✅ **Story Points** - Agile estimation  
✅ **Validation** - 0-100 quality score  
✅ **JIRA Ready** - Auto-create tickets  

---

## File Locations

- **Agents**: `/agents/` (10 AI agents)
- **Tools**: `/tools/github_tool.py`
- **Knowledge**: `/knowledge/redbus_context.json`
- **Orchestrator**: `/orchestrator.py`
- **Frontend**: `/app/page.tsx`
- **APIs**: `/app/api/`

---

## Commands

```bash
# Run frontend
npm run dev

# Test Python orchestrator
python3 orchestrator.py "Your idea here"

# Install Python deps
pip install -r requirements.txt

# Build for production
npm run build
```

---

## Environment Setup

`.env` file needs:
```bash
GOOGLE_API_KEY=your_key_here
GOOGLE_GENAI_USE_VERTEXAI=0
```

---

## Need Help?

- 📖 Read: `README_REDSPEC.md`
- 🏗️ Architecture: `ARCHITECTURE.md`
- ✅ Setup: `SETUP_COMPLETE.md`

---

**That's it! You're ready to generate PRDs with AI! 🎉**
