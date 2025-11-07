#!/bin/bash

# Figma Automation Setup Script
# Installs browser automation tools for Figma Make integration

set -e

echo "🎨 Setting up Figma Automation for redSpec.ai"
echo "==========================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Playwright is already available
if python3.11 -c "import playwright" 2>/dev/null; then
    echo "✅ Playwright is already installed!"
else
    echo "📦 Installing Playwright (recommended for Figma automation)..."
    if python3.11 -m pip install --user playwright 2>/dev/null; then
        echo "✅ Playwright installed successfully!"
    else
        echo "❌ Playwright installation failed. Please run manually:"
        echo "    python3.11 -m pip install --user playwright"
    fi
fi

# Check if browsers are installed (simple check)
BROWSER_DIR="$HOME/Library/Caches/ms-playwright"
if [ -d "$BROWSER_DIR" ] && [ "$(ls -A $BROWSER_DIR 2>/dev/null)" ]; then
    echo "✅ Playwright browsers are ready!"
else
    echo "🎭 Installing Playwright browsers..."
    # Try to find and run playwright install
    if command_exists playwright; then
        playwright install
    elif [ -f "$HOME/Library/Python/3.11/bin/playwright" ]; then
        $HOME/Library/Python/3.11/bin/playwright install
    elif [ -f "$HOME/.local/bin/playwright" ]; then
        $HOME/.local/bin/playwright install
    else
        echo "⚠️  Playwright browsers not installed. Please run manually:"
        echo "    python3.11 -m pip install --user playwright"
        echo "    python3.11 -m playwright install"
    fi
fi

# Check for Chrome (for Selenium fallback)
if command_exists google-chrome || command_exists chromium-browser || command_exists chromium; then
    echo "✅ Chrome/Chromium found for Selenium fallback"
else
    echo "⚠️  Chrome not found. Selenium will not be available as fallback."
    echo "   To install Chrome: brew install --cask google-chrome"
fi

# Install Selenium (optional fallback)
echo "📦 Installing Selenium (optional fallback)..."
python3.11 -m pip install --user selenium

echo ""
echo "🎯 Figma Automation Setup Complete!"
echo "==================================="
echo ""
echo "Now your redSpec.ai system can:"
echo "• Generate Rubicon-compliant Figma Make prompts"
echo "• Automatically paste prompts into Figma Make"
echo "• Generate actual wireframes"
echo "• Return Figma links and screenshots for PRDs"
echo ""
echo "Test it by running:"
echo "  python3.11 -c \"from agents.figma_automation_agent import automate_figma_make; print('Ready!')\""
echo ""
echo "🚀 Your wireframe workflow is now fully automated!"
