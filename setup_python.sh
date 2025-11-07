#!/bin/bash

# Setup script to install Python 3.10+ for redSpec.AI

echo "🔍 Checking Python version..."

# Check if Python 3.10+ is already installed
if command -v python3.11 &> /dev/null; then
    echo "✅ Python 3.11 found!"
    python3.11 --version
    exit 0
elif command -v python3.10 &> /dev/null; then
    echo "✅ Python 3.10 found!"
    python3.10 --version
    exit 0
fi

# Check current Python version
CURRENT_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo "Current Python version: $CURRENT_VERSION"

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew not found. Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

echo "📦 Installing Python 3.11 via Homebrew..."
brew install python@3.11

echo ""
echo "✅ Python 3.11 installed!"
echo ""
echo "⚠️  IMPORTANT: You need to update your PATH or use python3.11 explicitly"
echo ""
echo "Option 1: Use python3.11 directly (recommended for now)"
echo "  Update the code to use 'python3.11' instead of 'python3'"
echo ""
echo "Option 2: Add Python 3.11 to your PATH"
echo "  Add this to your ~/.zshrc:"
echo "  export PATH=\"/opt/homebrew/opt/python@3.11/bin:\$PATH\""
echo "  Then run: source ~/.zshrc"
echo ""
echo "After installing, restart your dev server!"

