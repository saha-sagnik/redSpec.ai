"""
redSpec.AI Agents
Complete multi-agent system for automated product specification generation
"""

from .context_extraction_agent import context_extraction_agent
from .codebase_fetcher_agent import codebase_fetcher_agent
from .conversational_prd_agent import conversational_prd_agent
from .code_impact_agent import code_impact_agent
from .story_point_calculator_agent import story_point_calculator_agent
from .analytics_tracking_agent import analytics_tracking_agent
from .prd_validator_agent import prd_validator_agent
from .design_wireframe_agent import design_wireframe_agent
from .figma_import_agent import figma_import_agent
from .figma_automation_agent import figma_automation_agent
from .jira_integration_agent import jira_integration_agent
from .release_notes_agent import release_notes_agent

__all__ = [
    # Phase 1: Context Gathering
    'context_extraction_agent',      # Agent 1: Company context & knowledge
    'codebase_fetcher_agent',        # Agent 2: GitHub repo fetching & indexing
    'release_notes_agent',           # Agent 3: Historical release analysis

    # Phase 2: PRD Generation
    'conversational_prd_agent',      # Agent 4: Interactive PRD generation

    # Phase 3: Technical Analysis
    'code_impact_agent',             # Agent 5: Real code impact analysis
    'story_point_calculator_agent',  # Agent 6: Agile story point estimation

    # Phase 4: Design & Tracking
    'design_wireframe_agent',        # Agent 7: Wireframes & design specs
    'figma_import_agent',            # Agent 7.1: Figma Make prompts
    'figma_automation_agent',        # Agent 7.2: Figma automation
    'analytics_tracking_agent',      # Agent 8: GA events & tracking

    # Phase 5: Validation & Integration
    'prd_validator_agent',           # Agent 9: PRD quality validation
    'jira_integration_agent',        # Agent 10: JIRA ticket creation
]
