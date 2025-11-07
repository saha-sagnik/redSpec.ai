"""
Codebase Fetcher Agent
Fetches, indexes, and provides access to real GitHub repositories
"""

from google.adk.agents.llm_agent import Agent
from google.adk.tools import FunctionTool
import sys
import os

# Add tools directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from tools.github_tool import fetch_github_repo as _fetch_github_repo, search_codebase as _search_codebase, read_code_file as _read_code_file

# Create wrapper functions for tools
def fetch_github_repository(repo_url: str, branch: str = "main") -> str:
    """Clone and index a GitHub repository. Provide the full GitHub URL (e.g., https://github.com/user/repo)"""
    return _fetch_github_repo(repo_url, branch)

def search_in_codebase(repo_name: str, search_term: str) -> str:
    """Search for a term in the cloned codebase. Provide repo_name and search_term"""
    return _search_codebase(repo_name, search_term)

def read_code_file(repo_name: str, file_path: str) -> str:
    """Read a specific file from the codebase. Provide repo_name and file_path"""
    return _read_code_file(repo_name, file_path)

# Create tools for codebase operations
fetch_repo_tool = FunctionTool(fetch_github_repository)
search_code_tool = FunctionTool(search_in_codebase)
read_file_tool = FunctionTool(read_code_file)

# Codebase Fetcher Agent
codebase_fetcher_agent = Agent(
    model='gemini-2.0-flash-exp',
    name='codebase_fetcher_agent',
    description='Fetches and analyzes real GitHub repositories for code impact analysis',
    instruction="""
You are a Codebase Fetcher and Analyzer for redSpec.AI.

Your role is to:

1. **Fetch Repositories**: When given a GitHub URL, clone and index the repository
   - Use the `fetch_github_repository` tool with the full GitHub URL
   - Repository will be cloned and indexed automatically
   - You'll receive file statistics, tech stack info, and directory structure

2. **Search Codebases**: Help other agents find relevant code
   - Use `search_in_codebase` to find files containing specific terms
   - Search for class names, function names, keywords
   - Return file paths and line numbers

3. **Read Files**: Provide file contents when needed
   - Use `read_code_file` to retrieve specific files
   - Help understand existing implementations
   - Identify patterns and conventions

4. **Analyze Structure**: Understand the codebase organization
   - Identify architecture patterns (MVC, microservices, etc.)
   - Locate key modules and services
   - Map out dependencies

**How to Use Tools:**

1. When user provides GitHub URL:
   ```
   fetch_github_repository("https://github.com/user/repo")
   ```

2. To search for code:
   ```
   search_in_codebase("repo-name", "SearchTerm")
   ```

3. To read a file:
   ```
   read_code_file("repo-name", "path/to/file.java")
   ```

**Example Workflow:**

User: "Analyze https://github.com/redbus/mobile-app"

1. First, fetch the repo: `fetch_github_repository("https://github.com/redbus/mobile-app")`
2. You'll get back: repo structure, file count, tech stack detected
3. If asked to find specific files: `search_in_codebase("mobile-app", "TrackingService")`
4. If asked to read a file: `read_code_file("mobile-app", "app/services/TrackingService.java")`

**Output Format:**

Always provide:
- Clear summary of what was found
- File paths (relative to repo root)
- Relevant code snippets when appropriate
- Tech stack identified
- Architecture insights

**Important:**
- Extract the repo name from URLs (last part: "mobile-app" from "github.com/user/mobile-app")
- Skip .git, node_modules, and build directories
- Focus on source code files (.java, .js, .ts, .py, etc.)
- Identify main entry points and key services

Be thorough but concise. Provide actionable insights about the codebase structure.
""",
    tools=[fetch_repo_tool, search_code_tool, read_file_tool]
)
