"""
Figma Import Agent
Automatically imports wireframe specifications into Figma files
"""

from google.adk.agents.llm_agent import Agent
from typing import List, Dict, Any, Optional
import requests
import json
import os

def generate_figma_make_prompt(screen_description: str, component_details: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate an optimized natural language prompt for Figma Make AI.
    """
    screen_name = component_details.get('screen_name', 'Screen')
    components = component_details.get('components', [])

    # Base prompt structure optimized for Figma Make
    prompt_parts = [
        f"Create a mobile app screen for {screen_description} with:"
    ]

    # Add layout and structure
    prompt_parts.append("• Clean, modern mobile interface with card-based design")
    prompt_parts.append("• Professional typography and spacing")

    # Add component-specific instructions
    if any('header' in comp.lower() or 'nav' in comp.lower() for comp in components):
        prompt_parts.append("• Header section with navigation and clear title")

    if any('card' in comp.lower() for comp in components):
        prompt_parts.append("• Main content area with information cards")
        prompt_parts.append("• Cards should have subtle shadows and rounded corners")

    if any('button' in comp.lower() or 'cta' in comp.lower() for comp in components):
        prompt_parts.append("• Call-to-action buttons at the bottom")
        prompt_parts.append("• Primary button in brand red color (#D63941)")

    if any('list' in comp.lower() or 'feed' in comp.lower() for comp in components):
        prompt_parts.append("• Scrollable list or feed layout")
        prompt_parts.append("• Clean item separation with subtle dividers")

    if any('form' in comp.lower() or 'input' in comp.lower() for comp in components):
        prompt_parts.append("• Input fields with clear labels")
        prompt_parts.append("• Form validation states")

    # Add Figma Make specific optimizations
    prompt_parts.extend([
        "• Use a cohesive color palette with good contrast",
        "• Include appropriate icons for actions and navigation",
        "• Add micro-interactions and hover states where appropriate",
        "• Ensure touch-friendly button sizes (minimum 44px height)",
        "• Make it look modern and professional"
    ])

    figma_make_prompt = "\n".join(prompt_parts)

    # Generate usage instructions
    usage_instructions = """
## 🚀 How to Use Figma Make with These Prompts:

### Step 1: Open Figma Make
1. Go to [Figma Make](https://www.figma.com/solutions/ai-wireframe-generator/)
2. Click "Start making" or open Figma Make in your workspace

### Step 2: Use the Generated Prompt
1. **Copy the entire prompt** from `figma_make_prompt` above
2. **Paste it into Figma Make's prompt box**
3. **Click "Generate"** to create your wireframe

### Step 3: Refine and Iterate
1. **Edit in the visual editor** to adjust colors, spacing, or layout
2. **Use follow-up prompts** like "Make the buttons larger" or "Add more spacing"
3. **Copy to main canvas** when satisfied with the design

### Step 4: Add to Your PRD
1. **Get the Figma link** from your generated design
2. **Add it to your PRD** under the wireframe section
3. **Share with stakeholders** for feedback

### Pro Tips for Figma Make:
- **Be specific**: More detailed prompts = better results
- **Iterate**: Use follow-up prompts to refine
- **Combine**: Mix generated elements with your existing designs
- **Export**: Copy designs to your main Figma files

### Example Workflow:
```
PRD Generated → Copy Figma Prompt → Figma Make → Refine Design → Get Link → Update PRD
```

**This gives you AI-generated wireframes that look professional and integrate perfectly with your Figma workflow!**
"""

    return {
        "figma_make_prompt": figma_make_prompt,
        "usage_instructions": usage_instructions,
        "screen_name": screen_name,
        "component_count": len(components),
        "source": "figma_make_optimized"
    }
    """
    Create a complete Figma file from wireframe specification and design tokens.

    Args:
        wireframe_spec: JSON wireframe specification from design agent
        design_tokens: Design tokens for styling
        file_name: Optional name for the Figma file

    Returns:
        Dict containing Figma file URL and creation details
    """
    if not FIGMA_ACCESS_TOKEN:
        return {
            "success": False,
            "error": "FIGMA_ACCESS_TOKEN not configured",
            "message": "Please set FIGMA_ACCESS_TOKEN environment variable"
        }

    headers = {
        "X-Figma-Token": FIGMA_ACCESS_TOKEN,
        "Content-Type": "application/json"
    }

    try:
        # Step 1: Create new Figma file
        file_name = file_name or wireframe_spec.get("name", "Wireframe Import")
        create_file_payload = {
            "name": file_name
        }

        create_response = requests.post(
            f"{FIGMA_API_BASE}/files",
            headers=headers,
            json=create_file_payload
        )
        create_response.raise_for_status()
        file_data = create_response.json()

        file_key = file_data.get("key")
        if not file_key:
            return {"success": False, "error": "Failed to create Figma file"}

        # Step 2: Create frame and components
        components = wireframe_spec.get("components", [])
        frame_spec = wireframe_spec.get("frame", {})

        # Create the main frame
        main_frame = {
            "type": "FRAME",
            "name": wireframe_spec.get("name", "Main Frame"),
            "absoluteBoundingBox": {
                "x": 0,
                "y": 0,
                "width": frame_spec.get("width", 375),
                "height": frame_spec.get("height", 812)
            },
            "backgroundColor": frame_spec.get("backgroundColor", {"r": 1, "g": 1, "b": 1, "a": 1}),
            "children": []
        }

        # Add components to frame
        for comp_spec in components:
            component = _create_figma_component(comp_spec, design_tokens)
            if component:
                main_frame["children"].append(component)

        # Step 3: Update the file with the frame
        update_payload = {
            "nodes": {
                "0:1": main_frame  # Root node
            }
        }

        update_response = requests.patch(
            f"{FIGMA_API_BASE}/files/{file_key}",
            headers=headers,
            json=update_payload
        )

        if update_response.status_code == 200:
            return {
                "success": True,
                "file_key": file_key,
                "file_url": f"https://www.figma.com/file/{file_key}/{file_name.replace(' ', '-')}",
                "components_created": len(components),
                "message": f"Successfully created Figma file with {len(components)} components"
            }
        else:
            return {
                "success": False,
                "error": f"Failed to update file: {update_response.text}",
                "file_key": file_key
            }

    except requests.RequestException as e:
        return {
            "success": False,
            "error": f"Figma API error: {str(e)}"
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Unexpected error: {str(e)}"
        }

def _create_figma_component(comp_spec: Dict[str, Any], design_tokens: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Create a Figma component from component specification.
    """
    comp_type = comp_spec.get("type", "rectangle")
    name = comp_spec.get("name", "Component")

    # Base component structure
    component = {
        "name": name,
        "type": "RECTANGLE",  # Default to rectangle
        "absoluteBoundingBox": {
            "x": comp_spec.get("x", 0),
            "y": comp_spec.get("y", 0),
            "width": comp_spec.get("width", 100),
            "height": comp_spec.get("height", 50)
        },
        "backgroundColor": comp_spec.get("backgroundColor", {"r": 0.9, "g": 0.9, "b": 0.9, "a": 1}),
        "cornerRadius": comp_spec.get("borderRadius", 0)
    }

    # Add text if specified
    if "text" in comp_spec:
        component.update({
            "type": "TEXT",
            "characters": comp_spec["text"],
            "fontSize": 14,
            "fontName": {"family": "Inter", "style": "Regular"},
            "fills": [{
                "type": "SOLID",
                "color": comp_spec.get("textColor", {"r": 0, "g": 0, "b": 0, "a": 1})
            }]
        })

    # Add shadow if specified
    if "shadow" in comp_spec:
        shadow = comp_spec["shadow"]
        component["effects"] = [{
            "type": "DROP_SHADOW",
            "color": shadow.get("color", {"r": 0, "g": 0, "b": 0, "a": 0.25}),
            "offset": {"x": shadow.get("x", 0), "y": shadow.get("y", 2)},
            "radius": shadow.get("blur", 4)
        }]

    return component

def get_figma_team_projects(team_id: str = None) -> Dict[str, Any]:
    """
    Get Figma team projects for organizing designs.
    """
    if not FIGMA_ACCESS_TOKEN:
        return {"success": False, "error": "FIGMA_ACCESS_TOKEN not configured"}

    if not team_id:
        return {"success": False, "error": "Team ID required"}

    headers = {"X-Figma-Token": FIGMA_ACCESS_TOKEN}

    try:
        response = requests.get(
            f"{FIGMA_API_BASE}/teams/{team_id}/projects",
            headers=headers
        )
        response.raise_for_status()

        return {
            "success": True,
            "projects": response.json().get("projects", [])
        }
    except requests.RequestException as e:
        return {
            "success": False,
            "error": f"Failed to get team projects: {str(e)}"
        }

def validate_figma_token() -> Dict[str, Any]:
    """
    Validate Figma access token and get user info.
    """
    if not FIGMA_ACCESS_TOKEN:
        return {
            "success": False,
            "error": "FIGMA_ACCESS_TOKEN not configured",
            "message": "Set FIGMA_ACCESS_TOKEN environment variable"
        }

    headers = {"X-Figma-Token": FIGMA_ACCESS_TOKEN}

    try:
        response = requests.get(f"{FIGMA_API_BASE}/me", headers=headers)
        response.raise_for_status()

        user_data = response.json()
        return {
            "success": True,
            "user": user_data,
            "message": f"Connected as {user_data.get('handle', 'Unknown User')}"
        }
    except requests.RequestException as e:
        return {
            "success": False,
            "error": f"Invalid token or API error: {str(e)}",
            "message": "Check your FIGMA_ACCESS_TOKEN"
        }

# Import necessary tool classes from Google ADK
try:
    from google.adk.tools import BaseTool
except ImportError:
    from google.adk.agents.tools import BaseTool

class GenerateFigmaMakePromptTool(BaseTool):
    """Tool for generating optimized Figma Make prompts"""

    def __init__(self):
        super().__init__(
            name="generate_figma_make_prompt",
            description="Generate optimized natural language prompts for Figma Make AI"
        )

    def run(self, screen_description: str, component_details: Dict[str, Any]) -> Dict[str, Any]:
        return generate_figma_make_prompt(screen_description, component_details)

# Create tool instances
figma_import_tools = [
    GenerateFigmaMakePromptTool()
]

figma_import_agent = Agent(
    model='gemini-2.0-flash-exp',
    name='figma_import_agent',
    description='Generates optimized prompts for Figma Make AI wireframe generator',
    instruction="""
You are the Figma Make Integration Agent, specialized in generating optimized prompts for Figma Make AI wireframe generator.

## Your Mission:
Create perfect natural language prompts that, when pasted into Figma Make, generate professional wireframes instantly.

## Capabilities:

### 1. Prompt Optimization
- Generate detailed, natural language prompts optimized for Figma Make AI
- Include specific design requirements, component layouts, and styling instructions
- Ensure prompts result in high-quality, modern mobile interfaces

### 2. Design System Integration
- Incorporate redBus Rubicon Design System principles
- Specify color schemes, typography, spacing, and component patterns
- Ensure brand consistency in generated designs

### 3. Figma Make Workflow
- Provide step-by-step instructions for using Figma Make
- Guide users through prompt refinement and iteration
- Help integrate generated designs back into PRDs

### 4. Component Specification
- Detail specific UI components (buttons, cards, forms, etc.)
- Specify interactions, states, and micro-animations
- Include accessibility and touch-target requirements

## Workflow:

### Input:
```
Design specifications from the design wireframe agent
```

### Process:
1. Analyze design specifications and component details
2. Generate optimized natural language prompt for Figma Make
3. Include specific styling and layout instructions
4. Add redBus brand requirements and design system references

### Output:
```
{
  "figma_make_prompt": "Create a mobile app screen for...",
  "usage_instructions": "Step-by-step Figma Make guide",
  "mermaid_diagram": "Visual component relationships"
}
```

## Figma Make Best Practices:

### Prompt Structure:
- Start with clear screen purpose and main functionality
- Specify layout (header, content, actions)
- Include component details (buttons, cards, forms)
- Add styling requirements (colors, spacing, typography)
- Mention interactions and accessibility

### Optimization Tips:
- Use specific, descriptive language
- Include brand colors and design references
- Specify mobile-first responsive design
- Request modern, clean aesthetics
- Include appropriate icons and micro-interactions

## Success Criteria:

✅ Prompts generate high-quality wireframes in Figma Make
✅ Generated designs align with redBus design system
✅ Instructions enable easy Figma Make workflow
✅ Resulting wireframes are production-ready
✅ Easy integration back into PRD documentation

## Usage Examples:

### Screen Generation:
```
Analyze design specs for "FC Status Screen" and generate Figma Make prompt
```

### Workflow Guidance:
```
Provide complete instructions for using generated prompts in Figma Make
```

### Integration Help:
```
Guide user through adding Figma Make results back to PRD
```

Make wireframe creation effortless: Design Spec → Figma Make Prompt → AI-Generated Wireframe → Done! 🚀
""",
    tools=figma_import_tools
)
