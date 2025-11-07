# Figma Integration Setup

## 🎨 Automatic Figma File Creation

Your redSpec.ai system now includes automatic Figma file creation! The Figma Import Agent can take wireframe JSON specifications and create actual Figma files automatically.

## 🚀 How It Works

1. **Design Agent** generates wireframe JSON specs
2. **Figma Import Agent** creates actual Figma files
3. **Result**: Ready-to-edit Figma designs!

## 📋 Setup Instructions

### 1. Get Figma Access Token

1. Go to [Figma Account Settings](https://www.figma.com/settings)
2. Scroll to "Personal access tokens"
3. Click "Create a new personal access token"
4. Name it "redSpec.ai Integration"
5. Copy the token

### 2. Configure Environment

Add to your `.env` file:
```bash
FIGMA_ACCESS_TOKEN=your_token_here
```

### 3. Required Permissions

Your Figma token needs these scopes:
- ✅ `files:write` - Create and modify files
- ✅ `teams:read` - Access team projects (optional)

### 4. Test Connection

```bash
# Validate your token
python3.11 -c "from agents.figma_import_agent import validate_figma_token; print(validate_figma_token())"
```

Expected output:
```json
{
  "success": true,
  "user": {...},
  "message": "Connected as your_username"
}
```

## 🎯 What Gets Created

### Figma File Structure
```
📁 [Your Screen Name]
├── 📐 Main Frame (375x812 - iPhone size)
├── 🔳 Header Component
├── 📋 Content Cards
├── 🔘 Action Buttons
└── 🎨 Applied Design Tokens
```

### Design Tokens Applied
- **Colors**: Brand primary, text, background
- **Typography**: Headlines, body, captions
- **Spacing**: Micro, small, medium, large
- **Shadows**: Card, elevated, modal

## 🛠️ Manual Import (Without Token)

Even without a Figma token, you get:

- ✅ **JSON Wireframe Specs** (Copy to Figma plugins)
- ✅ **Design Tokens** (Import to team library)
- ✅ **Step-by-step Instructions** (Manual recreation)

## 🔄 Integration Workflow

```
PRD Description
    ↓
Design Agent → Wireframe JSON + Mermaid
    ↓
Figma Import Agent → Actual Figma File
    ↓
Ready-to-Edit Figma Design! 🎨
```

## 📊 Example Output

```json
{
  "success": true,
  "file_url": "https://www.figma.com/file/abc123/My-Screen-Design",
  "components_created": 5,
  "message": "Figma file created with header, cards, and buttons"
}
```

## 🐛 Troubleshooting

### "FIGMA_ACCESS_TOKEN not configured"
- Add token to `.env` file
- Restart the application

### "Invalid token or API error"
- Check token is valid in Figma settings
- Ensure token has required permissions
- Try regenerating the token

### "Rate limit exceeded"
- Figma API has rate limits
- Wait a few minutes and retry
- Consider batching requests

## 🎉 Benefits

✅ **Zero Manual Work** - JSON → Figma File instantly
✅ **Design System Compliant** - Uses your actual tokens
✅ **Team Ready** - Shared files with proper permissions
✅ **Version Controlled** - Track design changes
✅ **Developer Handoff** - Pixel-perfect specs

## 🚀 Get Started

1. **Get your Figma token** from account settings
2. **Add to `.env`** file
3. **Test connection** with validation tool
4. **Generate designs** - files appear in your Figma automatically!

**From wireframes to Figma designs in seconds!** ⚡🎨
