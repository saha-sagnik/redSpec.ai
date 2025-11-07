"""
GitHub Integration Tool
Fetches and analyzes real codebases from GitHub repositories
"""

import os
import tempfile
import shutil
from pathlib import Path
from typing import Dict, List, Optional
import subprocess
import json


class GitHubTool:
    """Tool for fetching and analyzing GitHub repositories"""

    def __init__(self, cache_dir: str = None):
        """
        Initialize GitHub tool

        Args:
            cache_dir: Directory to cache cloned repos (default: temp directory)
        """
        self.cache_dir = cache_dir or os.path.join(tempfile.gettempdir(), "redspec_repos")
        os.makedirs(self.cache_dir, exist_ok=True)

    def clone_repository(self, repo_url: str, branch: str = "main") -> Dict:
        """
        Clone a GitHub repository

        Args:
            repo_url: GitHub repository URL
            branch: Branch to clone (default: main)

        Returns:
            Dictionary with repo info and local path
        """
        try:
            # Extract repo name from URL
            repo_name = repo_url.rstrip('/').split('/')[-1].replace('.git', '')
            local_path = os.path.join(self.cache_dir, repo_name)

            # Remove if exists
            if os.path.exists(local_path):
                shutil.rmtree(local_path)

            # Clone the repository
            print(f"📥 Cloning repository: {repo_url}")
            result = subprocess.run(
                ['git', 'clone', '--depth', '1', '--branch', branch, repo_url, local_path],
                capture_output=True,
                text=True,
                timeout=120
            )

            if result.returncode != 0:
                # Try with master branch if main fails
                if branch == "main":
                    return self.clone_repository(repo_url, branch="master")
                raise Exception(f"Git clone failed: {result.stderr}")

            print(f"✅ Repository cloned to: {local_path}")

            return {
                "success": True,
                "repo_name": repo_name,
                "local_path": local_path,
                "repo_url": repo_url,
                "branch": branch
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "repo_url": repo_url
            }

    def index_repository(self, local_path: str) -> Dict:
        """
        Index files in a repository

        Args:
            local_path: Local path to the cloned repo

        Returns:
            Dictionary with file structure and statistics
        """
        try:
            print(f"📇 Indexing repository: {local_path}")

            file_index = {
                "total_files": 0,
                "files_by_type": {},
                "directories": [],
                "files": []
            }

            # Walk through directory
            for root, dirs, files in os.walk(local_path):
                # Skip .git directory
                if '.git' in root:
                    continue

                # Skip node_modules, __pycache__, etc.
                if any(skip in root for skip in ['node_modules', '__pycache__', '.next', 'build', 'dist']):
                    continue

                rel_root = os.path.relpath(root, local_path)
                if rel_root != '.':
                    file_index["directories"].append(rel_root)

                for file in files:
                    file_path = os.path.join(root, file)
                    rel_path = os.path.relpath(file_path, local_path)

                    # Get file extension
                    ext = Path(file).suffix or 'no_extension'

                    # Count by type
                    if ext not in file_index["files_by_type"]:
                        file_index["files_by_type"][ext] = 0
                    file_index["files_by_type"][ext] += 1

                    # Add to files list
                    try:
                        size = os.path.getsize(file_path)
                        file_index["files"].append({
                            "path": rel_path,
                            "name": file,
                            "extension": ext,
                            "size": size
                        })
                        file_index["total_files"] += 1
                    except:
                        pass

            print(f"✅ Indexed {file_index['total_files']} files")

            return {
                "success": True,
                "index": file_index
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def search_files(self, local_path: str, pattern: str) -> List[str]:
        """
        Search for files matching a pattern

        Args:
            local_path: Local path to the repository
            pattern: Search pattern (e.g., "*.java", "Service.ts")

        Returns:
            List of matching file paths
        """
        from fnmatch import fnmatch

        matching_files = []

        for root, dirs, files in os.walk(local_path):
            if '.git' in root or 'node_modules' in root:
                continue

            for file in files:
                if fnmatch(file, pattern):
                    file_path = os.path.join(root, file)
                    rel_path = os.path.relpath(file_path, local_path)
                    matching_files.append(rel_path)

        return matching_files

    def read_file(self, local_path: str, file_path: str) -> Optional[str]:
        """
        Read a file from the repository

        Args:
            local_path: Local path to the repository
            file_path: Relative path to the file

        Returns:
            File content as string, or None if error
        """
        try:
            full_path = os.path.join(local_path, file_path)
            with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read()
        except Exception as e:
            print(f"❌ Error reading file {file_path}: {e}")
            return None

    def search_in_files(self, local_path: str, search_term: str, file_pattern: str = "*") -> List[Dict]:
        """
        Search for a term in files

        Args:
            local_path: Local path to the repository
            search_term: Term to search for
            file_pattern: File pattern to search in (default: all files)

        Returns:
            List of matches with file path and line numbers
        """
        matches = []

        for root, dirs, files in os.walk(local_path):
            if '.git' in root or 'node_modules' in root:
                continue

            for file in files:
                from fnmatch import fnmatch
                if not fnmatch(file, file_pattern):
                    continue

                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, local_path)

                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        for line_num, line in enumerate(f, 1):
                            if search_term.lower() in line.lower():
                                matches.append({
                                    "file": rel_path,
                                    "line": line_num,
                                    "content": line.strip(),
                                    "term": search_term
                                })
                except:
                    pass

        return matches

    def get_file_structure(self, local_path: str, max_depth: int = 3) -> Dict:
        """
        Get a tree-like structure of the repository

        Args:
            local_path: Local path to the repository
            max_depth: Maximum depth to traverse

        Returns:
            Dictionary representing file tree
        """
        def build_tree(path, current_depth=0):
            if current_depth >= max_depth:
                return None

            tree = {"name": os.path.basename(path), "type": "directory", "children": []}

            try:
                items = sorted(os.listdir(path))
                for item in items:
                    if item.startswith('.') or item in ['node_modules', '__pycache__']:
                        continue

                    item_path = os.path.join(path, item)

                    if os.path.isdir(item_path):
                        child_tree = build_tree(item_path, current_depth + 1)
                        if child_tree:
                            tree["children"].append(child_tree)
                    else:
                        tree["children"].append({
                            "name": item,
                            "type": "file",
                            "extension": Path(item).suffix
                        })
            except PermissionError:
                pass

            return tree

        return build_tree(local_path)

    def analyze_tech_stack(self, local_path: str) -> Dict:
        """
        Analyze the tech stack of the repository

        Args:
            local_path: Local path to the repository

        Returns:
            Dictionary with detected technologies
        """
        tech_stack = {
            "languages": set(),
            "frameworks": set(),
            "build_tools": set(),
            "dependencies": {}
        }

        # Check for common files
        files_to_check = {
            "package.json": "Node.js/JavaScript",
            "pom.xml": "Java/Maven",
            "build.gradle": "Java/Gradle",
            "requirements.txt": "Python",
            "Gemfile": "Ruby",
            "go.mod": "Go",
            "Cargo.toml": "Rust"
        }

        for file, tech in files_to_check.items():
            if os.path.exists(os.path.join(local_path, file)):
                tech_stack["languages"].add(tech)

                # Parse dependencies
                if file == "package.json":
                    try:
                        with open(os.path.join(local_path, file), 'r') as f:
                            pkg = json.load(f)
                            tech_stack["dependencies"]["npm"] = list(pkg.get("dependencies", {}).keys())

                            # Detect frameworks
                            deps = pkg.get("dependencies", {})
                            if "react" in deps:
                                tech_stack["frameworks"].add("React")
                            if "next" in deps:
                                tech_stack["frameworks"].add("Next.js")
                            if "vue" in deps:
                                tech_stack["frameworks"].add("Vue.js")
                            if "angular" in deps:
                                tech_stack["frameworks"].add("Angular")
                    except:
                        pass

        # Convert sets to lists for JSON serialization
        tech_stack["languages"] = list(tech_stack["languages"])
        tech_stack["frameworks"] = list(tech_stack["frameworks"])
        tech_stack["build_tools"] = list(tech_stack["build_tools"])

        return tech_stack


# Tool functions for Google ADK
def fetch_github_repo(repo_url: str, branch: str = "main") -> str:
    """Fetch a GitHub repository and return repo info"""
    tool = GitHubTool()
    result = tool.clone_repository(repo_url, branch)

    if result["success"]:
        index = tool.index_repository(result["local_path"])
        tech_stack = tool.analyze_tech_stack(result["local_path"])

        return json.dumps({
            **result,
            "index": index.get("index", {}),
            "tech_stack": tech_stack
        }, indent=2)
    else:
        return json.dumps(result, indent=2)


def search_codebase(repo_name: str, search_term: str) -> str:
    """Search for a term in the codebase"""
    tool = GitHubTool()
    local_path = os.path.join(tool.cache_dir, repo_name)

    if not os.path.exists(local_path):
        return json.dumps({"error": "Repository not found. Please clone it first."})

    matches = tool.search_in_files(local_path, search_term)
    return json.dumps(matches, indent=2)


def read_code_file(repo_name: str, file_path: str) -> str:
    """Read a specific file from the codebase"""
    tool = GitHubTool()
    local_path = os.path.join(tool.cache_dir, repo_name)

    if not os.path.exists(local_path):
        return "Error: Repository not found. Please clone it first."

    content = tool.read_file(local_path, file_path)
    return content if content else f"Error: Could not read file {file_path}"
