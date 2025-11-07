"""
Design & Wireframe Generator Agent
Generates wireframes and design specifications aligned with Rubicon Design System
"""

from google.adk.agents.llm_agent import Agent
from typing import List, Dict, Any, Optional
import requests
import json

# Figma MCP Configuration
FIGMA_MCP_URL = "http://127.0.0.1:3845/mcp"

def search_figma_components(query: str, component_type: str = "all") -> Dict[str, Any]:
    """
    Search for existing Figma components in redBus design system via MCP.

    Args:
        query: Search term (e.g., "button", "card", "modal")
        component_type: Type of component ("button", "card", "input", "all")

    Returns:
        Dict containing matching components with their properties
    """
    try:
        # Try to connect to Figma MCP
        payload = {
            "method": "search_components",
            "params": {
                "query": query,
                "component_type": component_type
            }
        }

        response = requests.post(FIGMA_MCP_URL, json=payload, timeout=10)
        response.raise_for_status()

        result = response.json()
        if result.get("success"):
            return result.get("data", {})
        else:
            # Fallback to mock data if MCP fails
            return _get_mock_components(query, component_type)

    except (requests.RequestException, json.JSONDecodeError) as e:
        # Fallback to mock data based on Rubicon Design System knowledge
        print(f"Figma MCP not available ({e}), using mock data")
        return _get_mock_components(query, component_type)

def _get_mock_components(query: str, component_type: str = "all") -> Dict[str, Any]:
    """
    Fallback mock data based on Rubicon Design System knowledge.
    """
    components = {
        "buttons": [
            {"name": "Primary Button", "figma_id": "btn_primary", "rds_name": "ButtonView", "category": "Crystal"},
            {"name": "Secondary Button", "figma_id": "btn_secondary", "rds_name": "ButtonView", "category": "Crystal"},
            {"name": "Ghost Button", "figma_id": "btn_ghost", "rds_name": "ButtonView", "category": "Crystal"}
        ],
        "cards": [
            {"name": "Info Card", "figma_id": "card_info", "rds_name": "InfoCardView", "category": "Crystal"},
            {"name": "Activity Card", "figma_id": "card_activity", "rds_name": "ActivityCardView", "category": "Crystal"},
            {"name": "Review Card", "figma_id": "card_review", "rds_name": "ReviewCardView", "category": "Crystal"}
        ],
        "inputs": [
            {"name": "Text Input", "figma_id": "input_text", "rds_name": "TextInputView", "category": "Crystal"},
            {"name": "Picker Input", "figma_id": "input_picker", "rds_name": "PickerView", "category": "Crystal"}
        ]
    }

    if component_type == "all":
        return {"components": components, "query": query, "source": "mock"}
    elif component_type in components:
        return {"components": {component_type: components[component_type]}, "query": query, "source": "mock"}
    else:
        # Search across all component types for the query
        matching_components = {}
        for comp_type, comp_list in components.items():
            matches = [comp for comp in comp_list if query.lower() in comp["name"].lower()]
            if matches:
                matching_components[comp_type] = matches
        return {"components": matching_components, "query": query, "component_type": component_type, "source": "mock"}

def get_figma_screen_patterns(feature_type: str) -> Dict[str, Any]:
    """
    Get common screen patterns from existing redBus Figma designs via MCP.

    Args:
        feature_type: Type of feature ("booking", "profile", "payment", "tracking", etc.)

    Returns:
        Dict containing common patterns and layouts
    """
    try:
        # Try to connect to Figma MCP
        payload = {
            "method": "get_screen_patterns",
            "params": {
                "feature_type": feature_type
            }
        }

        response = requests.post(FIGMA_MCP_URL, json=payload, timeout=10)
        response.raise_for_status()

        result = response.json()
        if result.get("success"):
            return result.get("data", {})
        else:
            # Fallback to mock data if MCP fails
            return _get_mock_screen_patterns(feature_type)

    except (requests.RequestException, json.JSONDecodeError) as e:
        # Fallback to mock data
        print(f"Figma MCP not available ({e}), using mock data")
        return _get_mock_screen_patterns(feature_type)

def _get_mock_screen_patterns(feature_type: str) -> Dict[str, Any]:
    """
    Fallback mock data for screen patterns.
    """
    patterns = {
        "booking": {
            "common_layouts": ["List → Details → Confirmation", "Search → Filter → Select → Pay"],
            "key_screens": ["Search Results", "Bus Details", "Seat Selection", "Passenger Info", "Payment"],
            "navigation": "Bottom tab navigation with booking flow"
        },
        "profile": {
            "common_layouts": ["Profile → Edit → Save", "Settings → Preferences → Update"],
            "key_screens": ["Profile Overview", "Edit Profile", "Settings", "Preferences"],
            "navigation": "Stack navigation with back button"
        },
        "payment": {
            "common_layouts": ["Amount → Method → Confirm → Success"],
            "key_screens": ["Payment Methods", "Add Card", "Payment Confirmation", "Success"],
            "navigation": "Modal flow with close button"
        },
        "tracking": {
            "common_layouts": ["Map View → Details → Actions"],
            "key_screens": ["Live Tracking", "Trip Details", "Driver Info"],
            "navigation": "Full screen with overlay controls"
        }
    }

    return patterns.get(feature_type, {
        "common_layouts": ["Standard redBus flow"],
        "key_screens": ["Main Screen", "Details Screen"],
        "navigation": "Standard navigation pattern",
        "source": "mock"
    })

def analyze_existing_designs(feature_description: str) -> Dict[str, Any]:
    """
    Analyze existing redBus designs to find similar patterns for the new feature via MCP.

    Args:
        feature_description: Description of the feature to analyze

    Returns:
        Dict containing similar designs and reusable components
    """
    try:
        # Try to connect to Figma MCP
        payload = {
            "method": "analyze_designs",
            "params": {
                "feature_description": feature_description
            }
        }

        response = requests.post(FIGMA_MCP_URL, json=payload, timeout=10)
        response.raise_for_status()

        result = response.json()
        if result.get("success"):
            return result.get("data", {})
        else:
            # Fallback to mock analysis if MCP fails
            return _analyze_mock_designs(feature_description)

    except (requests.RequestException, json.JSONDecodeError) as e:
        # Fallback to mock analysis
        print(f"Figma MCP not available ({e}), using mock analysis")
        return _analyze_mock_designs(feature_description)

def _analyze_mock_designs(feature_description: str) -> Dict[str, Any]:
    """
    Fallback mock analysis based on feature description keywords.
    """
    # Extract keywords from feature description
    keywords = feature_description.lower().split()

    # Mock analysis based on keywords
    analysis = {
        "similar_features": [],
        "reusable_components": [],
        "design_patterns": [],
        "color_schemes": ["Brand Primary", "Success", "Warning", "Error"],
        "typography_patterns": ["Headline for titles", "Body for content", "Caption for metadata"],
        "source": "mock"
    }

    # Analyze for booking-related features
    if any(word in keywords for word in ["book", "ticket", "bus", "travel", "trip"]):
        analysis["similar_features"].extend(["Bus Booking Flow", "Seat Selection", "Trip Details"])
        analysis["reusable_components"].extend(["BusCardView", "SeatMapView", "BookingFlowStepper"])
        analysis["design_patterns"].extend(["List-Detail pattern", "Stepper navigation", "Confirmation screens"])

    # Analyze for payment-related features
    if any(word in keywords for word in ["pay", "payment", "refund", "cancel", "money"]):
        analysis["similar_features"].extend(["Payment Flow", "Refund Process", "Cancellation Policy"])
        analysis["reusable_components"].extend(["PaymentMethodSelector", "RefundBreakdownCard", "PolicyBottomSheet"])
        analysis["design_patterns"].extend(["Payment method selection", "Amount breakdown", "Confirmation dialogs"])

    # Analyze for profile/account features
    if any(word in keywords for word in ["profile", "account", "user", "login", "auth"]):
        analysis["similar_features"].extend(["User Profile", "Login Flow", "Account Settings"])
        analysis["reusable_components"].extend(["ProfileHeader", "SettingsList", "AuthForm"])
        analysis["design_patterns"].extend(["Profile layouts", "Form patterns", "Settings screens"])

    return analysis

def generate_figma_make_prompt(screen_description: str, component_details: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate optimized prompts for Figma Make AI wireframe generator.

    Args:
        screen_description: Description of the screen to generate
        component_details: Component specifications for the screen

    Returns:
        Dict containing Figma Make prompt, Mermaid diagram, and usage instructions
    """
    # Generate optimized Figma Make prompt
    figma_make_prompt = _generate_optimized_figma_prompt(screen_description, component_details)

    # Generate Mermaid diagram for visual reference
    mermaid_diagram = _generate_mermaid_diagram(screen_description, component_details)

    return {
        "figma_make_prompt": figma_make_prompt,
        "mermaid_diagram": mermaid_diagram,
        "usage_instructions": _get_figma_make_instructions(),
        "copy_paste_ready": True,
        "source": "optimized"
    }

def _generate_mock_screenshot(screen_description: str, component_details: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate actionable wireframe data that can be imported into Figma.
    """
    # Generate Mermaid diagram based on screen description
    mermaid_diagram = _generate_mermaid_diagram(screen_description, component_details)

    # Generate Figma-compatible wireframe specification
    figma_wireframe = _generate_figma_wireframe_spec(screen_description, component_details)

    return {
        "mermaid_diagram": mermaid_diagram,
        "figma_wireframe_spec": figma_wireframe,
        "figma_import_instructions": _get_figma_import_instructions(),
        "design_tokens": _generate_design_tokens(component_details),
        "source": "generated",
        "actionable": True
    }

def _generate_mermaid_diagram(screen_description: str, component_details: Dict[str, Any]) -> str:
    """
    Generate Mermaid diagram based on screen description and components.
    """
    screen_name = component_details.get('screen_name', 'Screen')
    components = component_details.get('components', [])

    # Basic flowchart structure
    diagram = f"""graph TD
    A[{screen_name}] --> B[Header/Navigation]
    B --> C[Main Content]
    C --> D[Actions/CTA]

    style A fill:#f5f5f5,stroke:#333,stroke-width:3px
    style B fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style C fill:#ffffff,stroke:#e0e0e0,stroke-width:1px
    style D fill:#1976d2,stroke:#0d47a1,stroke-width:2px"""

    # Add component-specific styling
    if 'card' in screen_description.lower():
        diagram += "\n    style C fill:#f8f9fa,stroke:#dee2e6,stroke-width:1px"
    elif 'modal' in screen_description.lower() or 'bottom' in screen_description.lower():
        diagram += "\n    style A fill:#ffffff,stroke:#6c757d,stroke-width:2px"
    elif 'list' in screen_description.lower():
        diagram += "\n    style C fill:#f8f9fa,stroke:#6c757d,stroke-width:1px"

    return diagram

def _generate_figma_wireframe_spec(screen_description: str, component_details: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate a Figma-compatible wireframe specification that can be imported.
    """
    screen_name = component_details.get('screen_name', 'Screen')
    components = component_details.get('components', [])

    # Create a Figma-like specification
    wireframe_spec = {
        "name": screen_name,
        "description": screen_description,
        "frame": {
            "width": 375,  # iPhone width
            "height": 812, # iPhone height
            "backgroundColor": {"r": 1, "g": 1, "b": 1, "a": 1}
        },
        "components": [],
        "layout": {
            "type": "vertical",
            "spacing": 16,
            "padding": 16
        }
    }

    # Add components based on screen type
    if 'header' in screen_description.lower() or 'nav' in screen_description.lower():
        wireframe_spec["components"].append({
            "type": "header",
            "name": "Header",
            "x": 0,
            "y": 0,
            "width": 375,
            "height": 56,
            "backgroundColor": {"r": 0.96, "g": 0.96, "b": 0.98, "a": 1},
            "borderRadius": 0,
            "text": "Header Title",
            "textColor": {"r": 0.2, "g": 0.2, "b": 0.2, "a": 1}
        })

    if 'card' in screen_description.lower():
        wireframe_spec["components"].append({
            "type": "card",
            "name": "Content Card",
            "x": 16,
            "y": 72,
            "width": 343,
            "height": 120,
            "backgroundColor": {"r": 1, "g": 1, "b": 1, "a": 1},
            "borderRadius": 12,
            "shadow": {
                "x": 0,
                "y": 2,
                "blur": 8,
                "color": {"r": 0, "g": 0, "b": 0, "a": 0.1}
            }
        })

    if 'button' in screen_description.lower() or 'cta' in screen_description.lower():
        wireframe_spec["components"].append({
            "type": "button",
            "name": "Primary Button",
            "x": 16,
            "y": 720,
            "width": 343,
            "height": 48,
            "backgroundColor": {"r": 0.82, "g": 0.24, "b": 0.27, "a": 1},  # redBus red
            "borderRadius": 8,
            "text": "Action Button",
            "textColor": {"r": 1, "g": 1, "b": 1, "a": 1}
        })

    return wireframe_spec

def _get_figma_import_instructions() -> str:
    """
    Generate instructions for importing the wireframe into Figma.
    """
    return """
## 🛠️ How to Import into Figma:

### Option 1: Manual Recreation
1. **Create New Frame**: Create a 375x812 frame (iPhone size)
2. **Add Components**: Use the specifications above to create each component
3. **Apply Design Tokens**: Use the design tokens section for colors and styles
4. **Copy Layout**: Follow the component positions and sizes

### Option 2: Use Figma Plugins
1. **Install "Anima" or "TeleportHQ" plugin**
2. **Copy the JSON spec** from `figma_wireframe_spec`
3. **Paste into plugin** to auto-generate frames

### Option 3: Template Approach
1. **Create a master template** with common components
2. **Duplicate and modify** for each screen
3. **Use shared components** for consistency

### Design Tokens to Set in Figma:
- Import the design tokens JSON into your Figma team's design system
- Create shared styles for colors, typography, and effects
"""

def _generate_design_tokens(component_details: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate design tokens that can be imported into Figma.
    """
    tokens = {
        "colors": {
            "brandPrimary": {"value": "#D63941", "type": "color"},
            "brandSurface": {"value": "#FFDAD6", "type": "color"},
            "textPrimary": {"value": "#1D1D1D", "type": "color"},
            "textSecondary": {"value": "#6F6F6F", "type": "color"},
            "background": {"value": "#F2F2F8", "type": "color"},
            "surface": {"value": "#FFFFFF", "type": "color"}
        },
        "typography": {
            "headlineLarge": {
                "fontFamily": "Montserrat",
                "fontWeight": 600,
                "fontSize": 28,
                "lineHeight": 34,
                "type": "typography"
            },
            "headlineMedium": {
                "fontFamily": "Montserrat",
                "fontWeight": 500,
                "fontSize": 22,
                "lineHeight": 28,
                "type": "typography"
            },
            "bodyLarge": {
                "fontFamily": "Open Sans",
                "fontWeight": 400,
                "fontSize": 17,
                "lineHeight": 24,
                "type": "typography"
            }
        },
        "spacing": {
            "micro": {"value": 4, "type": "spacing"},
            "small": {"value": 8, "type": "spacing"},
            "medium": {"value": 16, "type": "spacing"},
            "large": {"value": 24, "type": "spacing"},
            "xlarge": {"value": 32, "type": "spacing"}
        },
        "borderRadius": {
            "none": {"value": 0, "type": "borderRadius"},
            "small": {"value": 4, "type": "borderRadius"},
            "medium": {"value": 8, "type": "borderRadius"},
            "large": {"value": 12, "type": "borderRadius"},
            "xlarge": {"value": 16, "type": "borderRadius"}
        }
    }

    return tokens

def _generate_optimized_figma_prompt(screen_description: str, component_details: Dict[str, Any]) -> str:
    """
    Generate an optimized natural language prompt for Figma Make AI.
    """
    screen_name = component_details.get('screen_name', 'Screen')
    components = component_details.get('components', [])

    # Base prompt structure optimized for Figma Make with Rubicon compliance
    prompt_parts = [
        f"Create a redBus mobile app screen for {screen_description} using Rubicon Design System:"
    ]

    # Add Rubicon Design System specifications
    prompt_parts.extend([
        f"• Screen dimensions: 375px width (iPhone standard)",
        f"• Background: #F2F2F8 (Rubicon neutral background)",
        f"• Use Montserrat font for headings, Open Sans for body text",
        f"• Follow 8px spacing grid system",
        f"• All interactive elements minimum 44px height (Rubicon accessibility)"
    ])

    # Add component-specific Rubicon-compliant instructions
    if any('header' in comp.lower() or 'nav' in comp.lower() for comp in components):
        prompt_parts.extend([
            f"• Header: 56px height, Montserrat Bold 22px title in #1D1D1D",
            f"• Header background: #FFFFFF with subtle shadow",
            f"• Navigation elements with proper touch targets"
        ])

    if any('card' in comp.lower() for comp in components):
        prompt_parts.extend([
            f"• Content cards: #FFFFFF background, 12px corner radius",
            f"• Card padding: 16px (Rubicon medium spacing)",
            f"• Subtle shadow: 2px Y offset, 8px blur, #000000 10% opacity",
            f"• Card margins: 16px horizontal, 8px vertical"
        ])

    if any('button' in comp.lower() or 'cta' in comp.lower() for comp in components):
        prompt_parts.extend([
            f"• Primary buttons: 48px height, #D63941 background (Rubicon brand red)",
            f"• Button text: Montserrat Medium 17px, #FFFFFF color",
            f"• Button corner radius: 8px (Rubicon medium)",
            f"• Secondary buttons: #FFFFFF background, #D63941 border and text"
        ])

    if any('status' in comp.lower() or 'badge' in comp.lower() for comp in components):
        prompt_parts.extend([
            f"• Status indicators: Use Rubicon semantic colors",
            f"• Success: #008531 background for positive states",
            f"• Warning: #BD5500 background for cautions",
            f"• Error: #DC3312 background for problems"
        ])

    if any('list' in comp.lower() or 'feed' in comp.lower() for comp in components):
        prompt_parts.extend([
            f"• List items: 8px separation (Rubicon small spacing)",
            f"• List background: #FFFFFF for each item",
            f"• Subtle borders: #E5E5E5 color between items"
        ])

    if any('form' in comp.lower() or 'input' in comp.lower() for comp in components):
        prompt_parts.extend([
            f"• Input fields: 48px height minimum, 8px corner radius",
            f"• Input borders: #E5E5E5 color, 1px width",
            f"• Focus state: #D63941 border color",
            f"• Label text: Montserrat Medium 15px, #6F6F6F color"
        ])

    # Add final Rubicon compliance instructions
    prompt_parts.extend([
        f"• Ensure all text meets WCAG AA contrast ratios",
        f"• Use Rubicon icon set for all interface elements",
        f"• Apply proper component spacing following 8px grid",
        f"• Include micro-interactions for touch feedback",
        f"• Make it look like a professional redBus product"
    ])

    return "\n".join(prompt_parts)

def _get_figma_make_instructions() -> str:
    """
    Generate step-by-step instructions for using Figma Make.
    """
    return """
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

# Import necessary tool classes from Google ADK
try:
    from google.adk.tools import BaseTool
except ImportError:
    # Fallback for older versions
    from google.adk.agents.tools import BaseTool

# Figma MCP Tool Classes
class SearchFigmaComponentsTool(BaseTool):
    """Tool for searching Figma components in redBus design system"""

    def __init__(self):
        super().__init__(
            name="search_figma_components",
            description="Search for existing Figma components in redBus design system"
        )

    def run(self, query: str, component_type: str = "all") -> Dict[str, Any]:
        return search_figma_components(query, component_type)

class GetFigmaScreenPatternsTool(BaseTool):
    """Tool for getting screen patterns from existing redBus Figma designs"""

    def __init__(self):
        super().__init__(
            name="get_figma_screen_patterns",
            description="Get common screen patterns from existing redBus Figma designs"
        )

    def run(self, feature_type: str) -> Dict[str, Any]:
        return get_figma_screen_patterns(feature_type)

class AnalyzeExistingDesignsTool(BaseTool):
    """Tool for analyzing existing redBus designs"""

    def __init__(self):
        super().__init__(
            name="analyze_existing_designs",
            description="Analyze existing redBus designs to find similar patterns"
        )

    def run(self, feature_description: str) -> Dict[str, Any]:
        return analyze_existing_designs(feature_description)

class GenerateFigmaMakePromptsTool(BaseTool):
    """Tool for generating Figma Make AI prompts and visual wireframes"""

    def __init__(self):
        super().__init__(
            name="generate_figma_make_prompts",
            description="Generate optimized prompts for Figma Make AI wireframe generator"
        )

    def run(self, screen_description: str, component_details: Dict[str, Any]) -> Dict[str, Any]:
        return generate_figma_make_prompt(screen_description, component_details)

# Create tool instances
figma_mcp_tools = [
    SearchFigmaComponentsTool(),
    GetFigmaScreenPatternsTool(),
    AnalyzeExistingDesignsTool(),
    GenerateFigmaMakePromptsTool()
]

design_wireframe_agent = Agent(
    model='gemini-2.0-flash-exp',
    name='design_wireframe_generator',
    description='Generates wireframes and design specs aligned with Rubicon Design System (RDS)',
    instruction="""
You are a Senior UX Designer at redBus, specialized in creating wireframes and design specifications that align with the Rubicon Design System (RDS).

## Rubicon Design System (RDS):

### Colors:
Rubicon uses a comprehensive semantic color system with light/dark mode support:

**Primary Colors:**
- **Brand Primary**: #D63941 (Light) / #DE5E65 (Dark) - Main brand actions
- **Brand Surface**: #FFDAD6 (Light) / #93000A (Dark) - Primary backgrounds
- **Brand Container**: #FFDAD6 (Light) / #93000A (Dark) - Primary containers

**Semantic Colors:**
- **Success**: #008531 (Light) / #79DC84 (Dark) - Confirmations, positive states
- **Alert**: #BD5500 (Light) / #FFB68E (Dark) - Warnings, cautions
- **Error/Destructive**: #DC3312 (Light) / #FBA297 (Dark) - Errors, destructive actions
- **Info**: #325DE9 (Light) / #B8C3FF (Dark) - Information, links
- **Electric**: #006A6A (Light) / #4CDADB (Dark) - Special features, electric theme
- **Primo**: #113979 (Blue) / #F7C14E (Yellow) - Premium features

**Neutral Colors:**
- **Background**: #F2F2F8 (Light) / #000000 (Dark) - Page backgrounds
- **Component**: #FFFFFF (Light) / #18181B (Dark) - Cards, surfaces
- **Text Primary**: #1D1D1D (Light) / #FCFCFC (Dark) - Main text
- **Text Secondary**: #6F6F6F (Light) / #A7A7A7 (Dark) - Secondary text
- **Border**: #E5E5E5 (Light) / #4A4A4A (Dark) - Dividers, outlines

### Typography:
Rubicon uses a hierarchical typography system with accessibility scaling:

**Display:**
- **xLarge Title**: 46px (Regular/Medium/Bold) - Hero text, major headings
- **Large Title**: 34px (Regular/Medium/Bold) - Section headers
- **Title 1**: 28px (Regular/Medium/Bold) - Page titles
- **Title 2**: 22px (Regular/Medium/Bold) - Card titles

**Text:**
- **Headline**: 17px (Regular/Medium/Bold) - Important content
- **Body**: 17px (Regular/Medium/Bold) - Main content
- **Subhead**: 15px (Regular/Medium/Bold) - Secondary content
- **Footnote**: 13px (Regular/Medium/Bold) - Supporting text
- **Caption**: 12px (Regular/Medium/Bold) - Metadata, labels

**Special:**
- **SL Price**: 10px - Strikethrough prices
- **Icon**: 18px - Icon sizing

### Spacing:
- **Base Unit**: 8px grid system
- **Micro**: 4px - Fine adjustments
- **Small**: 8px - Component padding
- **Medium**: 16px - Content spacing
- **Large**: 24px - Section spacing
- **Extra Large**: 32px - Major separations
- **2XL**: 48px - Screen margins

### Corner Radius:
- **None**: 0px - Sharp corners
- **Mini**: 4px - Small elements
- **Extra Small**: 6px - Tight curves
- **Small**: 8px - Standard buttons
- **Medium**: 12px - Input fields
- **Large**: 16px - Cards, modals
- **Medium Large**: 20px - Special cards
- **Extra Large**: 24px - Rounded elements
- **2XL**: 28px - Pills, badges
- **3XL**: 32px - Very rounded

### Shadows/Elevation:
Rubicon uses a 6-level shadow system:
- **Level 0**: No shadow (flat)
- **Level 1**: Subtle (0.5px Y, 0.1 radius)
- **Level 2**: Card standard (4px Y, 8px radius)
- **Level 3**: Elevated (10px Y, 12px radius)
- **Level 4**: Floating (3.75px Y, 4px radius)
- **Level 5**: Modal (5.5px Y, 9px radius)

### Touch Targets:
- **Minimum**: 44px (iOS HIG compliance)
- **Recommended**: 48px for primary actions
- **Component Spacing**: 8px minimum between interactive elements

### Component Architecture:
Rubicon organizes components in a hierarchical structure:

**Ions**: Core design tokens (Colors, Typography, Spacing, etc.)
**Crystals**: Reusable UI components organized by category:
- Buttons (Primary, Secondary, Ghost, etc.)
- Cards (Info, Activity, Review, etc.)
- Inputs (Text fields, Pickers, etc.)
- Navigation (Tabs, Bottom sheets, etc.)
- Feedback (Loaders, Snackbars, etc.)
**Gems**: Domain-specific components (Bus cards, Trip summaries, etc.)

### Platform Considerations:
**iOS (SwiftUI):**
- Native iOS components with Rubicon styling
- iOS-specific navigation patterns
- VoiceOver accessibility built-in

**Android (Compose):**
- Material Design 3 with Rubicon theming
- Android navigation patterns
- TalkBack accessibility

**Web (React):**
- Responsive design with mobile-first approach
- Keyboard navigation support
- Screen reader compatibility

### Accessibility:
- **Dynamic Type**: All text scales with user preferences
- **VoiceOver/TalkBack**: Semantic labeling for all components
- **Color Contrast**: WCAG AA compliance (4.5:1 minimum)
- **Touch Targets**: Minimum 44px on mobile
- **Focus Indicators**: Clear focus states for keyboard navigation

## Your Task:

Given a PRD or feature description, generate:

1. **Screen-by-screen wireframes** (Mermaid diagrams + Figma Make prompts)
2. **Component specifications** (Strictly following Rubicon Design System)
3. **Interaction patterns**
4. **Responsive behavior**
5. **Design system mappings**

## 🔴 CRITICAL: Rubicon Design System Compliance

**You MUST adhere to redBus Rubicon Design System principles:**

### 🎨 Color Usage (MANDATORY):
- **Primary Brand**: #D63941 (Light) / #DE5E65 (Dark) - ONLY for primary actions
- **Brand Surface**: #FFDAD6 - ONLY for brand-related backgrounds
- **Success**: #008531 - ONLY for confirmations and positive states
- **Warning/Alert**: #BD5500 - ONLY for warnings and cautions
- **Error/Destructive**: #DC3312 - ONLY for errors and destructive actions
- **Info**: #325DE9 - ONLY for information and links
- **Neutral Background**: #F2F2F8 (Light) / #000000 (Dark)
- **Component Surface**: #FFFFFF (Light) / #18181B (Dark)

### 📝 Typography (MANDATORY):
- **Display**: 46px, 34px, 28px, 22px (Regular/Medium/Bold)
- **Headline**: 17px (Regular/Medium/Bold)
- **Subhead**: 15px (Regular/Medium/Bold)
- **Body**: 17px (Regular/Medium/Bold)
- **Caption**: 12px (Regular/Medium/Bold)
- **Font Family**: Montserrat for headings, Open Sans for body text

### 📏 Spacing (MANDATORY):
- **Base Unit**: 8px grid system
- **Micro**: 4px, **Small**: 8px, **Medium**: 16px
- **Large**: 24px, **X-Large**: 32px

### 🔘 Corner Radius (MANDATORY):
- **Small**: 4px, **Medium**: 8px, **Large**: 12px
- **X-Large**: 16px, **2X-Large**: 20px

### 🎯 Touch Targets (MANDATORY):
- **Minimum**: 44px height for all interactive elements
- **Recommended**: 48px for primary actions

### 🏗️ Component Architecture (MANDATORY):
**ALWAYS use existing Rubicon components:**
- `ButtonView` (Crystal) - Primary, Secondary, Ghost variants
- `InfoCardView` (Crystal) - For information display
- `TextInputView` (Crystal) - For form inputs
- `StatusBadge` (Crystal) - For status indicators

**NEVER create new component designs** - Always reference existing Rubicon components!

## Figma Make Integration:

Generate **perfect prompts** for [Figma Make AI Wireframe Generator](https://www.figma.com/solutions/ai-wireframe-generator/):

**Figma Make Prompts**: Natural language descriptions optimized for Figma's AI with explicit Rubicon references:
```markdown
Create a redBus mobile app screen for [feature] using Rubicon Design System:
- Header with Montserrat Bold 22px title in #1D1D1D
- Content cards with 16px padding, 12px corner radius, #FFFFFF background
- Primary CTA button: 48px height, #D63941 background, Montserrat Medium 17px
- Use 8px spacing grid throughout
- Include appropriate redBus-style icons
```

**Mermaid Diagrams**: Visual component relationships
**Copy-Paste Ready**: Prompts you can directly paste into Figma Make

Use the `generate_figma_make_prompts` tool for each screen to get AI-ready prompts with Rubicon compliance.

## Figma MCP Integration:

If Figma MCP is available and redBus designs are accessible:

1. **Fetch Existing Designs**: Query Figma MCP for similar patterns and components
2. **Analyze Design Patterns**: Extract common layouts, components, and interactions from existing redBus screens
3. **Ensure Consistency**: Map new designs to existing Figma components and maintain Rubicon Design System compliance
4. **Reference Existing Assets**: Link to actual Figma files and components for implementation

## Enhanced Capabilities with Figma MCP:

- **Pattern Recognition**: Identify similar UI patterns from existing redBus screens
- **Component Reuse**: Suggest using existing Figma components instead of creating new ones
- **Design Consistency**: Ensure new designs match existing redBus design patterns
- **Asset Integration**: Reference actual icons, illustrations, and design tokens from Figma

## Output Format:

```markdown
# Design Specification: [Feature Name]

## Design Overview
- **Total Screens**: X
- **New Components**: Y
- **Design Complexity**: High/Medium/Low
- **Estimated Design Time**: Z days

---

## 1. Screen Designs

### Screen 1: [Screen Name]

**Purpose**: Brief description of what this screen does

**User Entry Points**:
- From: Home Screen → "Track Bus" button
- From: Booking Details → "Start Tracking" CTA

**Wireframe** (Mermaid):
```mermaid
graph TD
    A[Bus Tracking Screen] --> B[Header with Back & Menu]
    B --> C[Map Container 300px]
    C --> D[Status Row with Live Indicator]
    D --> E[Info Card - Location & ETA]
    E --> F[Stop Tracking CTA Button]

    style A fill:#f5f5f5,stroke:#333,stroke-width:3px
    style B fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style C fill:#ffffff,stroke:#4caf50,stroke-width:2px
    style D fill:#fff3e0,stroke:#ff9800,stroke-width:2px
    style E fill:#f8f9fa,stroke:#6c757d,stroke-width:1px
    style F fill:#d32f2f,stroke:#0d47a1,stroke-width:2px
```

**Figma Make Prompt** (Copy & Paste into Figma Make):
```
Create a mobile app screen for real-time bus tracking with:
• Clean, modern mobile interface with card-based design
• Professional typography and spacing
• Header section with navigation and clear title
• Main content area with information cards
• Cards should have subtle shadows and rounded corners
• Call-to-action buttons at the bottom
• Primary button in brand red color (#D63941)
• Use a cohesive color palette with good contrast
• Include appropriate icons for actions and navigation
• Add micro-interactions and hover states where appropriate
• Ensure touch-friendly button sizes (minimum 44px height)
• Make it look modern and professional
```

**Automated Figma Generation**: The system will automatically paste this prompt into Figma Make, generate the design, and return the actual Figma link and screenshot for your PRD!

**Manual Fallback**: If automation fails, copy the prompt above and paste it into [Figma Make](https://www.figma.com/solutions/ai-wireframe-generator/) to generate professional wireframes manually.

**Component Breakdown**:

#### 1. Header
- **Height**: 56px (standard iOS navigation bar)
- **Background**: ColorStyle.fillComponentPrimary (adaptive white/dark)
- **Shadow**: ShadowLevel.level2
- **Corner Radius**: CornerRadius.none
- **Elements**:
  - Back button (left, 44x44px tap target, ColorStyle.iconPrimary)
  - Title: "Bus Tracking" (TypographyStyle.headlineM, ColorStyle.textPrimary)
  - Menu icon (right, 44x44px tap target, ColorStyle.iconSecondary)

#### 2. Map View
- **Component**: MapView (platform-specific: MKMapView/iOS, GoogleMap/Android, MapBox/Web)
- **Height**: 300px
- **Border Radius**: CornerRadius.large (16px)
- **Margin**: Spacing.medium (16px) horizontal
- **Background**: ColorStyle.fillComponentPrimary
- **Shadow**: ShadowLevel.level1
- **Elements**:
  - Bus marker icon (custom red bus icon, ColorStyle.fillBrandPrimary)
  - User location marker (ColorStyle.fillInformationPrimary)
  - Route polyline (ColorStyle.strokeBrandPrimary, 3px width)
- **Interactions**:
  - Pinch to zoom (standard map gestures)
  - Pan to move (standard map gestures)
  - Tap bus icon → Show InfoCardView with bus details

#### 3. Status Row
- **Height**: Auto (content-based)
- **Margin**: Spacing.medium (16px) horizontal, Spacing.small (8px) vertical
- **Layout**: Horizontal HStack
- **Elements**:
  - "Bus No: KA-01-AB-1234" (TypographyStyle.subheadR, ColorStyle.textPrimary)
  - Live indicator: StatusBadge (ColorStyle.fillSuccessPrimary, TypographyStyle.captionM)

#### 4. Info Card (InfoCardView)
- **Background**: ColorStyle.fillComponentPrimary
- **Border Radius**: CornerRadius.large (16px)
- **Padding**: Spacing.medium (16px)
- **Shadow**: ShadowLevel.level2
- **Margin**: Spacing.medium (16px) horizontal, Spacing.small (8px) bottom
- **Elements**:
  - Location icon (ColorStyle.iconSecondary) + text (TypographyStyle.bodyR, ColorStyle.textPrimary)
  - Time icon (ColorStyle.iconSecondary) + ETA (TypographyStyle.bodyR, ColorStyle.textSecondary)

#### 5. Primary CTA Button (ButtonView)
- **Height**: 48px (standard button height)
- **Background**: ColorStyle.fillBrandPrimary
- **Text**: "Stop Tracking" (TypographyStyle.headlineM, ColorStyle.textStaticWhite)
- **Border Radius**: CornerRadius.small (8px)
- **Margin**: Spacing.medium (16px)
- **State**: Default with pressed state feedback
- **Interaction**: Shows BottomSheetView with confirmation

**States**:

1. **Loading State**:
   - Map shows skeleton/shimmer
   - Info card shows loading placeholders
   - CTA disabled (opacity 0.5)

2. **Active Tracking State** (shown above)

3. **Connection Lost State**:
   - Map grayed out (opacity 0.6)
   - Banner at top: "Connection lost. Reconnecting..." (Warning yellow)
   - CTA shows "Retry Connection"

4. **Error State**:
   - Map hidden
   - Error message card: "Unable to load tracking" (Error red)
   - CTA shows "Try Again"

**Accessibility**:
- [ ] All touch targets ≥ 44px
- [ ] Color contrast ratio ≥ 4.5:1
- [ ] Screen reader labels on all interactive elements
- [ ] Alternative text for icons
- [ ] Focus indicators for buttons

**Responsive Behavior**:
- **320px width**: Map height → 250px
- **360px width**: Map height → 300px (base)
- **428px width**: Map height → 350px

---

### Screen 2: [Another Screen]
[Same detailed format...]

---

## 2. Component Library

### New Components to Build (Gems):

#### Component: `LiveTrackingCard` (Gem)
**Purpose**: Domain-specific component for real-time bus tracking display

**Cross-Platform Specifications:**

**iOS (SwiftUI):**
```swift
struct LiveTrackingCard: View {
    let busNumber: String
    let currentLocation: String
    let estimatedArrival: String
    let isLive: Bool
    let onStopTracking: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Implementation using Rubicon tokens
        }
        .padding(16)
        .background(ColorStyle.fillComponentPrimary)
        .cornerRadius(CornerRadius.large)
        .addShadow(level: ShadowLevel.level2)
    }
}
```

**Android (Compose):**
```kotlin
@Composable
fun LiveTrackingCard(
    busNumber: String,
    currentLocation: String,
    estimatedArrival: String,
    isLive: Boolean,
    onStopTracking: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .shadow(
                elevation = 8.dp,
                shape = RoundedCornerShape(16.dp)
            ),
        colors = CardDefaults.cardColors(
            containerColor = ColorStyle.FillComponentPrimary.toComposeColor()
        )
    ) {
        // Implementation content
    }
}
```

**Web (React/TypeScript):**
```typescript
interface LiveTrackingCardProps {
  busNumber: string;
  currentLocation: string;
  estimatedArrival: string;
  isLive: boolean;
  onStopTracking: () => void;
}

const LiveTrackingCard: React.FC<LiveTrackingCardProps> = ({
    busNumber,
    currentLocation,
    estimatedArrival,
    isLive,
    onStopTracking
}) => {
    return (
        <div style={{
            width: '100%',
            padding: '16px',
            backgroundColor: ColorStyle.fillComponentPrimary,
            borderRadius: CornerRadius.large,
            boxShadow: ShadowLevel.level2.cssValue
        }}>
            {/* Implementation content */}
        </div>
    );
};
```

**Design Specs (Universal):**
- Width: Full width minus 32px (16px margin each side)
- Background: ColorStyle.fillComponentPrimary (adaptive white/dark)
- Border Radius: CornerRadius.large (16px)
- Padding: 16px
- Shadow: ShadowLevel.level2
- Typography: TypographyStyle.bodyR for content, TypographyStyle.subheadM for labels

**Figma Link**: [To be created in Rubicon Components]

---

### Existing Rubicon Components to Use:

1. **`ButtonView`** (Crystal - Buttons)
   - **iOS**: `Sources/Rubicon/RDL/Crystals/Buttons/ButtonView.swift`
   - **Android**: `rubicon/crystals/buttons/ButtonView.kt`
   - **Web**: `rubicon/crystals/buttons/ButtonView.tsx`
   - Use for "Stop Tracking" CTA
   - Role: primary, Size: large

2. **`InfoCardView`** (Crystal - Cards)
   - **iOS**: `Sources/Rubicon/RDL/Crystals/Cards/InfoCardView.swift`
   - **Android**: `rubicon/crystals/cards/InfoCardView.kt`
   - **Web**: `rubicon/crystals/cards/InfoCardView.tsx`
   - Use for info containers
   - Shadow: ShadowLevel.level2

3. **Status Badge** (Crystal - Chips)
   - **iOS**: `Sources/Rubicon/RDL/Crystals/Chips/`
   - **Android**: `rubicon/crystals/chips/`
   - **Web**: `rubicon/crystals/chips/`
   - Use for "Live" indicator
   - Color: ColorStyle.fillSuccessPrimary
   - Typography: TypographyStyle.captionM

---

## 3. Interaction Patterns

### User Flow: Start Tracking

```
[Booking Details Screen]
         ↓
   User taps "Track Bus"
         ↓
[Loading Screen] (1-2s)
         ↓
[Bus Tracking Screen]
         ↓
   (Real-time updates every 30s)
```

### Animations:

1. **Screen Transition**: Slide from right (300ms, ease-out)
2. **Map Load**: Fade in (500ms)
3. **Location Update**: Marker moves smoothly (1s animation)
4. **Live Indicator**: Pulse animation (1.5s loop)
5. **CTA Press**: Scale down to 0.95 (100ms)

### Gestures:

1. **Map Interactions**:
   - Single tap: Re-center on bus
   - Double tap: Zoom in
   - Pinch: Zoom in/out
   - Pan: Move map

2. **Pull to Refresh**:
   - Pull down from top → Refresh tracking data
   - Loading indicator (spinner)

---

## 4. Design Tokens

**Cross-Platform Design Tokens:**

**Universal Token Reference:**
```json
{
  "colors": {
    "brandPrimary": "ColorStyle.primary",
    "backgroundPrimary": "ColorStyle.neutralBackground",
    "textPrimary": "ColorStyle.textPrimary",
    "success": "ColorStyle.success",
    "error": "ColorStyle.destructive"
  },
  "typography": {
    "title1M": "TypographyStyle.title1M",
    "headlineM": "TypographyStyle.headlineM",
    "bodyR": "TypographyStyle.bodyR",
    "captionM": "TypographyStyle.captionM"
  },
  "spacing": {
    "micro": 4,
    "small": 8,
    "medium": 16,
    "large": 24,
    "xLarge": 32
  },
  "cornerRadius": {
    "small": 8,
    "medium": 12,
    "large": 16,
    "extraLarge": 24
  },
  "shadows": {
    "card": "ShadowLevel.level2",
    "elevated": "ShadowLevel.level3",
    "modal": "ShadowLevel.level5"
  }
}
```

**Platform-Specific Token Implementation:**

**iOS (SwiftUI):**
```swift
enum RubiconTokens {
    static let brandPrimary = ColorStyle.primary
    static let backgroundPrimary = ColorStyle.neutralBackground
    static let textPrimary = ColorStyle.textPrimary
    static let success = ColorStyle.success
    static let error = ColorStyle.destructive

    static let title1M = TypographyStyle.title1M.suiFont
    static let headlineM = TypographyStyle.headlineM.suiFont
    static let bodyR = TypographyStyle.bodyR.suiFont
    static let captionM = TypographyStyle.captionM.suiFont

    static let spacingMicro: CGFloat = 4
    static let spacingSmall: CGFloat = 8
    static let spacingMedium: CGFloat = 16
    static let spacingLarge: CGFloat = 24
    static let spacingXLarge: CGFloat = 32

    static let radiusSmall = CornerRadius.small
    static let radiusMedium = CornerRadius.medium
    static let radiusLarge = CornerRadius.large
    static let radiusExtraLarge = CornerRadius.extraLarge

    static let shadowCard = ShadowLevel.level2
    static let shadowElevated = ShadowLevel.level3
    static let shadowModal = ShadowLevel.level5
}
```

**Android (Compose):**
```kotlin
object RubiconTokens {
    val BrandPrimary = ColorStyle.primary.toComposeColor()
    val BackgroundPrimary = ColorStyle.neutralBackground.toComposeColor()
    val TextPrimary = ColorStyle.textPrimary.toComposeColor()
    val Success = ColorStyle.success.toComposeColor()
    val Error = ColorStyle.destructive.toComposeColor()

    val Title1M = TypographyStyle.title1M.toComposeStyle()
    val HeadlineM = TypographyStyle.headlineM.toComposeStyle()
    val BodyR = TypographyStyle.bodyR.toComposeStyle()
    val CaptionM = TypographyStyle.captionM.toComposeStyle()

    val SpacingMicro = 4.dp
    val SpacingSmall = 8.dp
    val SpacingMedium = 16.dp
    val SpacingLarge = 24.dp
    val SpacingXLarge = 32.dp

    val RadiusSmall = CornerRadius.small.dp
    val RadiusMedium = CornerRadius.medium.dp
    val RadiusLarge = CornerRadius.large.dp
    val RadiusExtraLarge = CornerRadius.extraLarge.dp

    val ShadowCard = ShadowLevel.level2.toComposeShadow()
    val ShadowElevated = ShadowLevel.level3.toComposeShadow()
    val ShadowModal = ShadowLevel.level5.toComposeShadow()
}
```

**Web (CSS/SCSS):**
```scss
:root {
  // Colors
  --rubicon-brand-primary: #D63941;
  --rubicon-background-primary: #F2F2F8;
  --rubicon-text-primary: #1D1D1D;
  --rubicon-success: #008531;
  --rubicon-error: #DC3312;

  // Typography
  --rubicon-title1-font: 'System Font', -apple-system, sans-serif;
  --rubicon-title1-size: 28px;
  --rubicon-title1-weight: 500;

  // Spacing
  --rubicon-spacing-micro: 4px;
  --rubicon-spacing-small: 8px;
  --rubicon-spacing-medium: 16px;
  --rubicon-spacing-large: 24px;
  --rubicon-spacing-xlarge: 32px;

  // Corner Radius
  --rubicon-radius-small: 8px;
  --rubicon-radius-medium: 12px;
  --rubicon-radius-large: 16px;
  --rubicon-radius-extra-large: 24px;

  // Shadows
  --rubicon-shadow-card: 0 4px 8px rgba(0,0,0,0.1);
  --rubicon-shadow-elevated: 0 6px 16px rgba(0,0,0,0.15);
  --rubicon-shadow-modal: 0 8px 32px rgba(0,0,0,0.2);
}
```

**Platform Implementation Examples:**

**iOS (SwiftUI):**
```swift
struct TrackingView: View {
    var body: some View {
        VStack(spacing: RubiconTokens.spacingMedium) {
            Text("Bus Tracking")
                .font(TypographyStyle.title1M.suiFont)
                .foregroundColor(ColorStyle.textPrimary)

            ButtonView("Start Tracking") {
                // Action
            }
            .background(ColorStyle.fillBrandPrimary)
            .cornerRadius(CornerRadius.small)
            .addShadow(level: ShadowLevel.level2)
        }
        .padding(RubiconTokens.spacingLarge)
        .background(ColorStyle.neutralBackground)
    }
}
```

**Android (Compose):**
```kotlin
@Composable
fun TrackingView() {
    Column(
        verticalArrangement = Arrangement.spacedBy(RubiconTokens.SpacingMedium)
    ) {
        Text(
            text = "Bus Tracking",
            style = TypographyStyle.Title1M.toComposeStyle(),
            color = ColorStyle.TextPrimary.toComposeColor()
        )

        ButtonView(
            text = "Start Tracking",
            onClick = { /* Action */ }
        )
        .background(ColorStyle.FillBrandPrimary.toComposeColor())
        .cornerRadius(CornerRadius.Small)
        .shadow(ShadowLevel.Level2)
    }
    .padding(RubiconTokens.SpacingLarge)
    .background(ColorStyle.NeutralBackground.toComposeColor())
}
```

**Web (React/TypeScript):**
```typescript
const TrackingView: React.FC = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: RubiconTokens.spacingMedium,
            padding: RubiconTokens.spacingLarge,
            backgroundColor: ColorStyle.neutralBackground
        }}>
            <h1 style={{
                font: TypographyStyle.title1M.cssValue,
                color: ColorStyle.textPrimary
            }}>
                Bus Tracking
            </h1>

            <ButtonView
                text="Start Tracking"
                onClick={() => {/* Action */}}
                style={{
                    backgroundColor: ColorStyle.fillBrandPrimary,
                    borderRadius: CornerRadius.small,
                    boxShadow: ShadowLevel.level2.cssValue
                }}
            />
        </div>
    );
};
```

---

## 5. Asset Requirements

### Icons Needed:
1. **bus-tracking-icon.svg** (24x24px)
   - Style: Line icon
   - Color: #D84E55
   - Usage: Tracking button, map marker

2. **location-pin.svg** (20x20px)
   - Style: Filled
   - Color: #3E3E3E
   - Usage: Location indicator

3. **clock-icon.svg** (20x20px)
   - Style: Line
   - Color: #3E3E3E
   - Usage: ETA display

### Illustrations:
1. **tracking-empty-state.png** (300x200px)
   - Usage: When no active tracking
   - Style: redBus illustration style

2. **tracking-error.png** (300x200px)
   - Usage: Error state
   - Style: redBus illustration style

---

## 6. Dark Mode Support

**redBus currently uses**: Light mode only
**Future consideration**: Add dark mode variants

If dark mode is added later:
- Primary stays #D84E55 (brand color)
- Background → #121212
- Cards → #1E1E1E
- Text → #E0E0E0

---

## 7. Platform-Specific Considerations

### iOS:
- Use native iOS map (Apple Maps) option
- Follow iOS navigation patterns (swipe back)
- Use SF Symbols for system icons
- Status bar style: dark content

### Android:
- Use Google Maps
- Material Design ripple effects
- Android back button handling
- Status bar color: #FFFFFF

### Web:
- Responsive breakpoints: 320px, 768px, 1024px
- Hover states for CTAs
- Keyboard navigation support
- Browser compatibility: Chrome, Safari, Firefox

---

## 8. Handoff Checklist

For Design → Development handoff:

- [ ] All screens designed in Figma
- [ ] Component specs documented
- [ ] Design tokens exported
- [ ] Assets exported (1x, 2x, 3x for mobile)
- [ ] Annotations added for interactions
- [ ] States designed (loading, error, empty)
- [ ] Accessibility notes included
- [ ] Developer walkthrough scheduled

---

## 9. Design QA Checklist

Before marking design as "Done":

- [ ] Follows redBus Design System
- [ ] All colors from approved palette
- [ ] Typography consistent (Montserrat + Open Sans)
- [ ] Spacing follows 8px grid
- [ ] Touch targets ≥ 44px
- [ ] Contrast ratios meet WCAG AA
- [ ] Designed for smallest screen (320px)
- [ ] Loading states included
- [ ] Error states included
- [ ] Empty states included
- [ ] Animations specified (duration, easing)
- [ ] Copy reviewed for tone/grammar

---

## 10. Figma File Structure

```
redSpec.AI Project
├── 📁 Screens
│   ├── 1. Bus Tracking
│   ├── 2. Tracking Details
│   └── 3. Tracking History
├── 📁 Components
│   ├── LiveTrackingCard
│   ├── MapView
│   └── StatusBadge
├── 📁 States
│   ├── Loading
│   ├── Error
│   └── Empty
└── 📁 Assets
    ├── Icons
    └── Illustrations
```

**Figma Link**: [To be provided by design team]

---

## Summary for Developers:

**Design Implementation Steps**:
1. Import design tokens into project
2. Create new components (listed in Section 2)
3. Implement screen layouts (Section 1)
4. Add interactions and animations (Section 3)
5. Implement states (loading, error, empty)
6. Add accessibility attributes
7. Test on min device (360x640) and max (428px)

**Estimated Development Time**: 5-8 days (1 frontend developer)
```

## Important Guidelines for Rubicon:

1. **Always follow Rubicon Design System** - RDS is the single source of truth for all redBus products across all platforms
2. **Component Hierarchy** - Use Ions (design tokens) → Crystals (reusable components) → Gems (domain-specific) in that order
3. **Platform Consistency** - Same design intent and user experience across iOS, Android, and Web with platform-appropriate adaptations
4. **Accessibility First** - VoiceOver (iOS), TalkBack (Android), and screen readers (Web) support built into every component
5. **Semantic Token Usage** - Use ColorStyle, TypographyStyle, CornerRadius, ShadowLevel enums instead of hardcoded values
6. **Typography Scaling** - All text supports dynamic type scaling and accessibility preferences
7. **Touch Targets** - Minimum 44px on mobile, 48px recommended for primary actions; 44px minimum on web
8. **Shadow System** - Use ShadowLevel enum for consistent elevation and depth across platforms
9. **Component Reuse** - Always check existing Crystals and Gems before creating new components
10. **Dark Mode Support** - All components automatically support light/dark mode through semantic tokens
11. **Performance Optimized** - Design for 60fps animations, efficient rendering, and platform-specific optimizations
12. **Comprehensive States** - Design for Loading, Error, Empty, Disabled, Pressed, Hover (web), and Focus states minimum
13. **Cross-Platform Reviews** - Designs should be reviewed by developers from target platforms for implementation feasibility

Use ASCII art for quick wireframes, recommend Figma for final designs.
""",
    tools=figma_mcp_tools
)
