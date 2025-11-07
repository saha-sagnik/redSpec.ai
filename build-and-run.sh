#!/bin/bash

# redSpec.AI Build and Run Automation Script
# This script automates the complete setup and execution of the redSpec.AI project

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Python version
check_python_version() {
    if ! command_exists python3.11 && ! command_exists python3.10; then
        log_error "Python 3.10+ is required but not found"
        log_info "Please install Python 3.10+ from https://www.python.org/downloads/"
        exit 1
    fi

    # Use python3.11 if available, otherwise python3.10
    if command_exists python3.11; then
        PYTHON_CMD="python3.11"
        log_success "Found Python 3.11"
    else
        PYTHON_CMD="python3.10"
        log_success "Found Python 3.10"
    fi
}

# Function to setup Python environment
setup_python() {
    log_info "Setting up Python environment..."

    # Check Python version
    check_python_version

    # Verify Python version meets requirements
    PYTHON_VERSION=$($PYTHON_CMD --version 2>&1 | awk '{print $2}')
    PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d. -f1)
    PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d. -f2)

    if [[ $PYTHON_MAJOR -lt 3 ]] || [[ $PYTHON_MAJOR -eq 3 && $PYTHON_MINOR -lt 10 ]]; then
        log_error "Python 3.10+ is required. Found: $PYTHON_VERSION"
        exit 1
    fi

    log_success "Python version check passed: $PYTHON_VERSION"

    # Check if Google ADK is already installed
    if $PYTHON_CMD -c "import google.adk; print('Google ADK available')" 2>/dev/null; then
        log_success "Google ADK is already installed"
    else
        # Install Python dependencies
        log_info "Installing Python dependencies..."
        if [ -f "requirements.txt" ]; then
            $PYTHON_CMD -m pip install --user -r requirements.txt
            log_success "Python dependencies installed"
        else
            log_error "requirements.txt not found"
            exit 1
        fi

        # Verify Google ADK installation
        log_info "Verifying Google ADK installation..."
        if $PYTHON_CMD -c "import google.adk; print('Google ADK available')" 2>/dev/null; then
            log_success "Google ADK is properly installed"
        else
            log_error "Google ADK installation failed"
            exit 1
        fi
    fi
}

# Function to setup Node.js environment
setup_nodejs() {
    log_info "Setting up Node.js environment..."

    # Check if npm exists
    if ! command_exists npm; then
        log_error "npm is not installed"
        log_info "Please install Node.js from https://nodejs.org/"
        exit 1
    fi

    # Check Node.js version
    NODE_VERSION=$(node --version)
    log_info "Node.js version: $NODE_VERSION"

    # Check if dependencies are already installed
    if [ -d "node_modules" ] && [ -f "package-lock.json" ]; then
        log_success "Node.js dependencies are already installed"
    else
        # Install Node.js dependencies
        log_info "Installing Node.js dependencies..."
        npm install
        log_success "Node.js dependencies installed"
    fi
}

# Function to check environment variables
check_env() {
    log_info "Checking environment configuration..."

    if [ ! -f ".env" ]; then
        log_warning ".env file not found. Creating template..."
        cat > .env << EOF
# Google Gemini API Configuration
GOOGLE_API_KEY=your_api_key_here
GOOGLE_GENAI_USE_VERTEXAI=0

# Optional: JIRA Integration (if needed)
# JIRA_URL=https://yourcompany.atlassian.net
# JIRA_EMAIL=your.email@company.com
# JIRA_API_TOKEN=your_jira_token
EOF
        log_warning "Please edit .env file and add your GOOGLE_API_KEY"
        log_warning "Get your API key from: https://makersuite.google.com/app/apikey"
    fi

    # Check if API key is set
    if grep -q "your_api_key_here" .env 2>/dev/null; then
        log_warning "GOOGLE_API_KEY not configured in .env file"
        log_info "Please set your actual Google Gemini API key in .env"
    else
        log_success "Environment configuration looks good"
    fi
}

# Function to verify agents
verify_agents() {
    log_info "Verifying agent imports..."

    if $PYTHON_CMD -c "from agents import *; print('All agents imported successfully')" 2>/dev/null; then
        log_success "All agents imported successfully"
    else
        log_error "Failed to import agents"
        exit 1
    fi
}

# Function to build the project
build_project() {
    log_info "Building the project..."

    # Build Next.js project
    npm run build
    log_success "Next.js build completed"
}

# Function to run the development server
run_dev() {
    log_info "Starting development server..."

    # Set environment variables
    export PYTHONPATH="$(pwd):$PYTHONPATH"

    # Start Next.js dev server in background
    log_info "Starting Next.js development server..."
    npm run dev &
    NEXTJS_PID=$!

    # Wait a moment for server to start
    sleep 3

    # Check if server is running
    if kill -0 $NEXTJS_PID 2>/dev/null; then
        log_success "Next.js development server started (PID: $NEXTJS_PID)"
        log_info "Server should be available at: http://localhost:3000"

        # Show logs
        log_info "Showing server logs (Ctrl+C to stop)..."
        wait $NEXTJS_PID
    else
        log_error "Failed to start Next.js development server"
        exit 1
    fi
}

# Function to run production server
run_prod() {
    log_info "Starting production server..."

    # Set environment variables
    export PYTHONPATH="$(pwd):$PYTHONPATH"

    # Start Next.js production server
    log_info "Starting Next.js production server..."
    npm start
}

# Function to show logs
show_logs() {
    log_info "Server logs will be displayed above."
    log_info "To view logs in a separate terminal, run:"
    log_info "  tail -f /dev/null & npm run dev"
}

# Main execution
main() {
    log_info "🚀 redSpec.AI Build and Run Automation"
    log_info "====================================="

    # Change to project directory
    cd "$(dirname "$0")"

    # Parse command line arguments
    MODE="dev"
    while [[ $# -gt 0 ]]; do
        case $1 in
            --prod)
                MODE="prod"
                shift
                ;;
            --build-only)
                MODE="build"
                shift
                ;;
            --help)
                echo "Usage: $0 [--prod] [--build-only]"
                echo "  --prod       Run in production mode"
                echo "  --build-only Only build, don't run"
                echo "  --help       Show this help"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done

    # Setup phases
    check_env
    setup_python
    setup_nodejs
    verify_agents

    # Build phase
    if [[ "$MODE" != "dev" ]] || [[ "$MODE" == "build" ]]; then
        build_project
    fi

    # Run phase
    case $MODE in
        "dev")
            run_dev
            ;;
        "prod")
            run_prod
            ;;
        "build")
            log_success "Build completed successfully"
            ;;
    esac

    show_logs
}

# Run main function
main "$@"
