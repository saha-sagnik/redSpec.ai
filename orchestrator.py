"""
redSpec.AI Orchestrator
Coordinates all 10 agents to generate comprehensive product specifications
"""

import os
import asyncio
from typing import Dict, List, Any, Optional, AsyncIterator
from datetime import datetime
from dataclasses import dataclass, asdict
from enum import Enum
from dotenv import load_dotenv
from google.adk.runners import InMemoryRunner

# Load environment variables
load_dotenv()

# Import all agents
from agents import (
    context_extraction_agent,
    codebase_fetcher_agent,
    release_notes_agent,
    conversational_prd_agent,
    code_impact_agent,
    story_point_calculator_agent,
    design_wireframe_agent,
    analytics_tracking_agent,
    prd_validator_agent,
    jira_integration_agent,
)


class AgentPhase(Enum):
    """Phases of the redSpec.AI workflow"""
    CONTEXT_GATHERING = "context_gathering"
    PRD_GENERATION = "prd_generation"
    TECHNICAL_ANALYSIS = "technical_analysis"
    DESIGN_TRACKING = "design_tracking"
    VALIDATION_INTEGRATION = "validation_integration"


@dataclass
class AgentProgress:
    """Progress update from an agent"""
    agent_name: str
    phase: AgentPhase
    status: str  # "started", "running", "completed", "error"
    message: str
    progress_percent: int
    data: Optional[Dict] = None


@dataclass
class WorkflowResult:
    """Complete workflow result"""
    timestamp: str
    product_idea: str
    github_repo: Optional[str]

    # Phase 1 outputs
    company_context: Optional[str] = None
    codebase_info: Optional[str] = None
    release_history: Optional[str] = None

    # Phase 2 output
    prd: Optional[str] = None

    # Phase 3 outputs
    code_impact: Optional[str] = None
    story_points: Optional[str] = None

    # Phase 4 outputs
    design_specs: Optional[str] = None
    analytics_plan: Optional[str] = None

    # Phase 5 outputs
    prd_validation: Optional[str] = None
    jira_tickets: Optional[str] = None

    # Metadata
    total_story_points: Optional[int] = None
    validation_score: Optional[int] = None
    errors: List[str] = None


class RedSpecOrchestrator:
    """
    Orchestrator for the complete redSpec.AI workflow
    Manages all 10 agents and coordinates their execution
    """

    def __init__(self):
        """Initialize orchestrator with all agent runners"""
        self.runners = {
            # Phase 1: Context Gathering
            "context": InMemoryRunner(agent=context_extraction_agent),
            "codebase": InMemoryRunner(agent=codebase_fetcher_agent),
            "release_notes": InMemoryRunner(agent=release_notes_agent),

            # Phase 2: PRD Generation
            "prd": InMemoryRunner(agent=conversational_prd_agent),

            # Phase 3: Technical Analysis
            "code_impact": InMemoryRunner(agent=code_impact_agent),
            "story_points": InMemoryRunner(agent=story_point_calculator_agent),

            # Phase 4: Design & Tracking
            "design": InMemoryRunner(agent=design_wireframe_agent),
            "analytics": InMemoryRunner(agent=analytics_tracking_agent),

            # Phase 5: Validation & Integration
            "validator": InMemoryRunner(agent=prd_validator_agent),
            "jira": InMemoryRunner(agent=jira_integration_agent),
        }

    async def run_agent(
        self,
        agent_name: str,
        prompt: str,
        progress_callback: Optional[callable] = None
    ) -> str:
        """
        Run a single agent and return its output

        Args:
            agent_name: Name of the agent to run
            prompt: Input prompt for the agent
            progress_callback: Optional callback for progress updates

        Returns:
            Agent output as string
        """
        runner = self.runners[agent_name]

        if progress_callback:
            await progress_callback(AgentProgress(
                agent_name=agent_name,
                phase=self._get_phase_for_agent(agent_name),
                status="started",
                message=f"Starting {agent_name} agent...",
                progress_percent=0
            ))

        try:
            events = await runner.run_debug(prompt)

            # Extract final response
            output = ""
            for event in events:
                if event.is_final_response():
                    output = event.content.parts[0].text
                    break

            if progress_callback:
                await progress_callback(AgentProgress(
                    agent_name=agent_name,
                    phase=self._get_phase_for_agent(agent_name),
                    status="completed",
                    message=f"{agent_name} completed",
                    progress_percent=100,
                    data={"output_length": len(output)}
                ))

            return output

        except Exception as e:
            if progress_callback:
                await progress_callback(AgentProgress(
                    agent_name=agent_name,
                    phase=self._get_phase_for_agent(agent_name),
                    status="error",
                    message=f"Error: {str(e)}",
                    progress_percent=0
                ))
            raise

    def _get_phase_for_agent(self, agent_name: str) -> AgentPhase:
        """Map agent name to its phase"""
        phase_map = {
            "context": AgentPhase.CONTEXT_GATHERING,
            "codebase": AgentPhase.CONTEXT_GATHERING,
            "release_notes": AgentPhase.CONTEXT_GATHERING,
            "prd": AgentPhase.PRD_GENERATION,
            "code_impact": AgentPhase.TECHNICAL_ANALYSIS,
            "story_points": AgentPhase.TECHNICAL_ANALYSIS,
            "design": AgentPhase.DESIGN_TRACKING,
            "analytics": AgentPhase.DESIGN_TRACKING,
            "validator": AgentPhase.VALIDATION_INTEGRATION,
            "jira": AgentPhase.VALIDATION_INTEGRATION,
        }
        return phase_map.get(agent_name, AgentPhase.CONTEXT_GATHERING)

    async def generate_spec(
        self,
        product_idea: str,
        github_repo: Optional[str] = None,
        progress_callback: Optional[callable] = None,
        skip_phases: Optional[List[AgentPhase]] = None
    ) -> WorkflowResult:
        """
        Run the complete workflow to generate product specification

        Args:
            product_idea: The rough product idea or PRD draft
            github_repo: Optional GitHub repository URL
            progress_callback: Optional callback for progress updates
            skip_phases: Optional list of phases to skip

        Returns:
            WorkflowResult with all outputs
        """
        skip_phases = skip_phases or []
        result = WorkflowResult(
            timestamp=datetime.now().isoformat(),
            product_idea=product_idea,
            github_repo=github_repo,
            errors=[]
        )

        try:
            # ============================================================
            # PHASE 1: CONTEXT GATHERING
            # ============================================================
            if AgentPhase.CONTEXT_GATHERING not in skip_phases:
                if progress_callback:
                    await progress_callback(AgentProgress(
                        agent_name="orchestrator",
                        phase=AgentPhase.CONTEXT_GATHERING,
                        status="running",
                        message="Phase 1: Gathering context...",
                        progress_percent=10
                    ))

                # Agent 1: Context Extraction
                try:
                    context_prompt = "Get the complete redBus company context including product principles, tech stack, and design system"
                    result.company_context = await self.run_agent(
                        "context",
                        context_prompt,
                        progress_callback
                    )
                except Exception as e:
                    result.errors.append(f"Context extraction error: {str(e)}")

                # Agent 2: Codebase Fetcher (if GitHub repo provided)
                if github_repo:
                    try:
                        codebase_prompt = f"Fetch and analyze this GitHub repository: {github_repo}"
                        result.codebase_info = await self.run_agent(
                            "codebase",
                            codebase_prompt,
                            progress_callback
                        )
                    except Exception as e:
                        result.errors.append(f"Codebase fetch error: {str(e)}")

                # Agent 3: Release Notes (with context about the feature)
                try:
                    release_prompt = f"Analyze past release notes for features related to: {product_idea}"
                    result.release_history = await self.run_agent(
                        "release_notes",
                        release_prompt,
                        progress_callback
                    )
                except Exception as e:
                    result.errors.append(f"Release notes error: {str(e)}")

            # ============================================================
            # PHASE 2: PRD GENERATION
            # ============================================================
            if AgentPhase.PRD_GENERATION not in skip_phases:
                if progress_callback:
                    await progress_callback(AgentProgress(
                        agent_name="orchestrator",
                        phase=AgentPhase.PRD_GENERATION,
                        status="running",
                        message="Phase 2: Generating PRD...",
                        progress_percent=30
                    ))

                # Agent 4: Conversational PRD Generator
                try:
                    prd_prompt = f"""
Product Idea: {product_idea}

Company Context:
{result.company_context if result.company_context else 'Using default redBus context'}

Historical Context:
{result.release_history if result.release_history else 'No historical context available'}

Please generate a comprehensive PRD for this feature. Follow the redBus PRD template with all 14 sections.
"""
                    result.prd = await self.run_agent(
                        "prd",
                        prd_prompt,
                        progress_callback
                    )
                except Exception as e:
                    result.errors.append(f"PRD generation error: {str(e)}")
                    return result  # Can't continue without PRD

            # ============================================================
            # PHASE 3: TECHNICAL ANALYSIS
            # ============================================================
            if AgentPhase.TECHNICAL_ANALYSIS not in skip_phases and result.prd:
                if progress_callback:
                    await progress_callback(AgentProgress(
                        agent_name="orchestrator",
                        phase=AgentPhase.TECHNICAL_ANALYSIS,
                        status="running",
                        message="Phase 3: Analyzing technical impact...",
                        progress_percent=50
                    ))

                # Agent 5: Code Impact Analyzer
                try:
                    impact_prompt = f"""
PRD:
{result.prd}

Codebase Information:
{result.codebase_info if result.codebase_info else 'No codebase information available - provide generic analysis'}

Analyze the code impact for this PRD. Identify specific files, components, and systems that will be affected.
"""
                    result.code_impact = await self.run_agent(
                        "code_impact",
                        impact_prompt,
                        progress_callback
                    )
                except Exception as e:
                    result.errors.append(f"Code impact analysis error: {str(e)}")

                # Agent 6: Story Point Calculator
                try:
                    points_prompt = f"""
PRD:
{result.prd}

Code Impact Analysis:
{result.code_impact if result.code_impact else 'No impact analysis available'}

Calculate story points for each user story using the Fibonacci scale. Consider complexity, impact area, dependencies, and risk.
"""
                    result.story_points = await self.run_agent(
                        "story_points",
                        points_prompt,
                        progress_callback
                    )

                    # Extract total story points (if possible)
                    if result.story_points and "Total" in result.story_points:
                        # Simple extraction - could be made more robust
                        import re
                        match = re.search(r'Total.*?(\d+)', result.story_points)
                        if match:
                            result.total_story_points = int(match.group(1))

                except Exception as e:
                    result.errors.append(f"Story point calculation error: {str(e)}")

            # ============================================================
            # PHASE 4: DESIGN & TRACKING
            # ============================================================
            if AgentPhase.DESIGN_TRACKING not in skip_phases and result.prd:
                if progress_callback:
                    await progress_callback(AgentProgress(
                        agent_name="orchestrator",
                        phase=AgentPhase.DESIGN_TRACKING,
                        status="running",
                        message="Phase 4: Creating design specs and analytics plan...",
                        progress_percent=70
                    ))

                # Agent 7: Design & Wireframe Generator
                try:
                    design_prompt = f"""
PRD:
{result.prd}

Generate wireframes and design specifications aligned with redBus Design System. Include ASCII wireframes, component specs, and design tokens.
"""
                    result.design_specs = await self.run_agent(
                        "design",
                        design_prompt,
                        progress_callback
                    )
                except Exception as e:
                    result.errors.append(f"Design generation error: {str(e)}")

                # Agent 8: Analytics Tracking
                try:
                    analytics_prompt = f"""
PRD:
{result.prd}

Define comprehensive analytics tracking strategy including GA4 events, Mixpanel events, conversion funnels, and success metrics.
"""
                    result.analytics_plan = await self.run_agent(
                        "analytics",
                        analytics_prompt,
                        progress_callback
                    )
                except Exception as e:
                    result.errors.append(f"Analytics planning error: {str(e)}")

            # ============================================================
            # PHASE 5: VALIDATION & INTEGRATION
            # ============================================================
            if AgentPhase.VALIDATION_INTEGRATION not in skip_phases and result.prd:
                if progress_callback:
                    await progress_callback(AgentProgress(
                        agent_name="orchestrator",
                        phase=AgentPhase.VALIDATION_INTEGRATION,
                        status="running",
                        message="Phase 5: Validating PRD and creating JIRA tickets...",
                        progress_percent=85
                    ))

                # Agent 9: PRD Validator
                try:
                    validation_prompt = f"""
PRD to validate:
{result.prd}

Validate this PRD against redBus standards. Provide a quality score (0-100) and detailed feedback.
"""
                    result.prd_validation = await self.run_agent(
                        "validator",
                        validation_prompt,
                        progress_callback
                    )

                    # Extract validation score
                    if result.prd_validation:
                        import re
                        match = re.search(r'Score:?\s*(\d+)', result.prd_validation)
                        if match:
                            result.validation_score = int(match.group(1))

                except Exception as e:
                    result.errors.append(f"PRD validation error: {str(e)}")

                # Agent 10: JIRA Integration
                try:
                    jira_prompt = f"""
PRD:
{result.prd}

Story Points:
{result.story_points if result.story_points else 'No story points available'}

Code Impact:
{result.code_impact if result.code_impact else 'No impact analysis available'}

Create complete JIRA ticket structure including epic, stories, tasks, and sub-tasks with story points and acceptance criteria.
"""
                    result.jira_tickets = await self.run_agent(
                        "jira",
                        jira_prompt,
                        progress_callback
                    )
                except Exception as e:
                    result.errors.append(f"JIRA integration error: {str(e)}")

            # ============================================================
            # WORKFLOW COMPLETE
            # ============================================================
            if progress_callback:
                await progress_callback(AgentProgress(
                    agent_name="orchestrator",
                    phase=AgentPhase.VALIDATION_INTEGRATION,
                    status="completed",
                    message="Workflow completed successfully!",
                    progress_percent=100,
                    data={
                        "total_story_points": result.total_story_points,
                        "validation_score": result.validation_score,
                        "errors_count": len(result.errors)
                    }
                ))

            return result

        except Exception as e:
            result.errors.append(f"Orchestrator error: {str(e)}")
            if progress_callback:
                await progress_callback(AgentProgress(
                    agent_name="orchestrator",
                    phase=AgentPhase.VALIDATION_INTEGRATION,
                    status="error",
                    message=f"Workflow failed: {str(e)}",
                    progress_percent=0
                ))
            return result

    def generate_spec_sync(
        self,
        product_idea: str,
        github_repo: Optional[str] = None,
        output_dir: str = "output"
    ) -> WorkflowResult:
        """
        Synchronous wrapper for generate_spec

        Args:
            product_idea: The product idea
            github_repo: Optional GitHub repository
            output_dir: Directory to save outputs

        Returns:
            WorkflowResult
        """
        async def run_with_save():
            result = await self.generate_spec(product_idea, github_repo)

            # Save outputs to files
            os.makedirs(output_dir, exist_ok=True)
            timestamp = result.timestamp.replace(":", "-").replace(".", "-")

            if result.prd:
                with open(f"{output_dir}/prd_{timestamp}.md", "w") as f:
                    f.write(result.prd)

            if result.code_impact:
                with open(f"{output_dir}/code_impact_{timestamp}.md", "w") as f:
                    f.write(result.code_impact)

            if result.story_points:
                with open(f"{output_dir}/story_points_{timestamp}.md", "w") as f:
                    f.write(result.story_points)

            if result.design_specs:
                with open(f"{output_dir}/design_specs_{timestamp}.md", "w") as f:
                    f.write(result.design_specs)

            if result.analytics_plan:
                with open(f"{output_dir}/analytics_{timestamp}.md", "w") as f:
                    f.write(result.analytics_plan)

            if result.prd_validation:
                with open(f"{output_dir}/validation_{timestamp}.md", "w") as f:
                    f.write(result.prd_validation)

            if result.jira_tickets:
                with open(f"{output_dir}/jira_{timestamp}.md", "w") as f:
                    f.write(result.jira_tickets)

            # Save summary
            with open(f"{output_dir}/summary_{timestamp}.txt", "w") as f:
                f.write(f"redSpec.AI Summary\n")
                f.write(f"==================\n\n")
                f.write(f"Product Idea: {result.product_idea}\n")
                f.write(f"GitHub Repo: {result.github_repo}\n")
                f.write(f"Total Story Points: {result.total_story_points}\n")
                f.write(f"Validation Score: {result.validation_score}/100\n")
                f.write(f"Errors: {len(result.errors)}\n")
                if result.errors:
                    f.write(f"\nErrors:\n")
                    for error in result.errors:
                        f.write(f"  - {error}\n")

            return result

        return asyncio.run(run_with_save())


# Convenience function
async def redspec(
    product_idea: str,
    github_repo: Optional[str] = None,
    progress_callback: Optional[callable] = None
) -> WorkflowResult:
    """
    Quick function to run redSpec.AI workflow

    Args:
        product_idea: The product idea
        github_repo: Optional GitHub repository URL
        progress_callback: Optional progress callback

    Returns:
        WorkflowResult
    """
    orchestrator = RedSpecOrchestrator()
    return await orchestrator.generate_spec(product_idea, github_repo, progress_callback)


def redspec_sync(product_idea: str, github_repo: Optional[str] = None) -> WorkflowResult:
    """Synchronous version of redspec()"""
    orchestrator = RedSpecOrchestrator()
    return orchestrator.generate_spec_sync(product_idea, github_repo)


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python orchestrator.py 'Your product idea' [github_repo_url]")
        sys.exit(1)

    idea = sys.argv[1]
    repo = sys.argv[2] if len(sys.argv) > 2 else None

    print(f"\n🚀 Running redSpec.AI for: {idea}\n")
    result = redspec_sync(idea, repo)

    print(f"\n✅ Complete!")
    print(f"Story Points: {result.total_story_points}")
    print(f"Validation Score: {result.validation_score}/100")
    print(f"Outputs saved to: output/")
