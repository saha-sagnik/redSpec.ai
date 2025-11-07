#!/bin/bash

# redSpec.AI Log Monitoring Script
# Monitors application logs in real-time

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Function to monitor Next.js logs
monitor_nextjs() {
    log_info "Monitoring Next.js development logs..."
    if pgrep -f "next dev" > /dev/null; then
        # Try to find the Next.js log file
        NEXTJS_LOG=$(find .next -name "*.log" 2>/dev/null | head -1)
        if [ -f "$NEXTJS_LOG" ]; then
            tail -f "$NEXTJS_LOG"
        else
            echo "Next.js log file not found. Looking for process output..."
            # Fallback: show process info
            ps aux | grep "next dev" | grep -v grep
            echo ""
            echo "To see live logs, run the server in another terminal:"
            echo "  npm run dev"
        fi
    else
        echo "❌ Next.js development server not running"
        echo "Start it with: make dev"
    fi
}

# Function to monitor Python agent logs
monitor_python() {
    log_info "Python agent logs will appear here when API calls are made..."
    echo "Agent execution logs are printed to stderr during API calls."
    echo ""
}

# Function to show system info
show_system_info() {
    echo "=== System Information ==="
    echo "Node.js: $(node --version)"
    echo "npm: $(npm --version)"

    if command -v python3.11 >/dev/null 2>&1; then
        echo "Python: $(python3.11 --version)"
    elif command -v python3.10 >/dev/null 2>&1; then
        echo "Python: $(python3.10 --version)"
    else
        echo "Python: Not found"
    fi

    echo ""
    echo "=== Process Status ==="
    if pgrep -f "next dev" >/dev/null; then
        echo "✅ Next.js dev server: Running"
        echo "   PID: $(pgrep -f "next dev")"
        echo "   Port: 3000"
    else
        echo "❌ Next.js dev server: Not running"
    fi

    if pgrep -f "python" >/dev/null; then
        echo "✅ Python processes: $(pgrep -f "python" | wc -l) running"
    else
        echo "ℹ️  Python processes: None active"
    fi

    echo ""
}

# Function to check API health
check_api_health() {
    echo "=== API Health Check ==="
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Frontend: http://localhost:3000"
    else
        echo "❌ Frontend: Not responding"
    fi

    if curl -s http://localhost:3000/api/chat > /dev/null 2>&1; then
        echo "✅ Chat API: Available"
    else
        echo "❌ Chat API: Not responding"
    fi

    echo ""
}

# Main monitoring function
main() {
    echo "🚀 redSpec.AI Log Monitor"
    echo "========================"

    case "$1" in
        "nextjs")
            monitor_nextjs
            ;;
        "python")
            monitor_python
            ;;
        "health")
            show_system_info
            check_api_health
            ;;
        "all")
            show_system_info
            check_api_health
            echo "=== Live Monitoring ==="
            echo "Press Ctrl+C to stop monitoring"
            echo ""
            monitor_nextjs
            ;;
        *)
            echo "Usage: $0 [nextjs|python|health|all]"
            echo ""
            echo "Commands:"
            echo "  nextjs    - Monitor Next.js development logs"
            echo "  python    - Show Python agent log info"
            echo "  health    - Show system and API health status"
            echo "  all       - Show everything and monitor logs"
            echo ""
            echo "Examples:"
            echo "  $0 health    # Quick status check"
            echo "  $0 all       # Full monitoring dashboard"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
