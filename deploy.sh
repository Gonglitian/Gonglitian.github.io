#!/bin/bash

# Deploy script for GitHub Pages
# This script builds the project, pushes source code to main branch, 
# and then pushes the built files to gh-pages branch

set -e  # Exit on error

# Save current directory
PROJECT_ROOT=$(pwd)

echo "🚀 Starting deployment process..."

# Load nvm if available
if [ -s "$HOME/.nvm/nvm.sh" ]; then
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

# Check Node.js version
NODE_VERSION=$(node --version)
echo "✅ Using Node.js $NODE_VERSION"

# Initialize and update submodules (e.g. Litian_CV)
echo "📦 Initializing submodules..."
git submodule update --init --recursive

# Push Litian_CV submodule if it has changes
echo "📄 Checking Litian_CV for changes..."
cd Litian_CV
if ! git diff --quiet || ! git diff --staged --quiet || [ -n "$(git ls-files --others --exclude-standard)" ]; then
    git add -A
    git commit -m "Update CV - $(date +%Y-%m-%d\ %H:%M:%S)"
    git push origin main
    echo "✅ Litian_CV pushed"
    cd "$PROJECT_ROOT"
    # Update submodule reference in main project
    git add Litian_CV
else
    echo "⚠️  No changes in Litian_CV"
    cd "$PROJECT_ROOT"
fi

# Build the project (API routes are automatically excluded by the build script)
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ ! -d "out" ]; then
    echo "❌ Build failed: 'out' directory not found"
    exit 1
fi

echo "✅ Build completed successfully"

# Step 1: Push source code to main branch
echo ""
echo "📤 Step 1: Pushing source code to main branch..."
echo "📦 Staging source files..."
git add -A

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "⚠️  No source code changes to commit"
else
    COMMIT_MSG="Update source code - $(date +%Y-%m-%d\ %H:%M:%S)"
    echo "💾 Committing source code changes: $COMMIT_MSG"
    git commit -m "$COMMIT_MSG"
    
    echo "🚀 Pushing to main branch..."
    git push origin main
    echo "✅ Source code pushed to main branch"
fi

# Step 2: Push out directory to gh-pages branch
echo ""
echo "📤 Step 2: Pushing build files to gh-pages branch..."

# Create .nojekyll file if it doesn't exist
if [ ! -f "out/.nojekyll" ]; then
    echo "📝 Creating .nojekyll file..."
    touch out/.nojekyll
fi

# Navigate to out directory
cd out

# Initialize git if needed
if [ ! -d ".git" ]; then
    echo "🔧 Initializing git repository in out directory..."
    git init
    git branch -m gh-pages
fi

# Set remote URL
echo "🔗 Setting remote repository..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/Gonglitian/Gonglitian.github.io.git

# Fetch remote branches
git fetch origin || true

# Checkout or create gh-pages branch
if git ls-remote --heads origin gh-pages | grep -q gh-pages; then
    echo "📥 Fetching gh-pages branch..."
    git fetch origin gh-pages:gh-pages 2>/dev/null || true
    git checkout gh-pages 2>/dev/null || git checkout -b gh-pages
else
    echo "🌿 Creating new gh-pages branch..."
    git checkout -b gh-pages 2>/dev/null || git checkout gh-pages
fi

# Add all files
echo "📦 Staging build files..."
git add -A

# Commit changes
COMMIT_MSG="Deploy website - $(date +%Y-%m-%d\ %H:%M:%S)"
echo "💾 Committing build files: $COMMIT_MSG"
if git diff --staged --quiet; then
    echo "⚠️  No build files changes to commit"
else
    git commit -m "$COMMIT_MSG"
    
    # Push to gh-pages branch
    echo "🚀 Pushing to gh-pages branch..."
    git push -f origin gh-pages:gh-pages
    
    echo "✅ Build files pushed to gh-pages branch"
fi

# Return to project root
cd "$PROJECT_ROOT"

echo ""
echo "✅ Deployment completed successfully!"
echo "📝 Source code: main branch"
echo "🌐 Website: gh-pages branch"
echo "🔗 Your website should be available at: https://Gonglitian.github.io"

