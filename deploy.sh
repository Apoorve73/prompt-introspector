#!/bin/bash

# Prompt Introspector Deployment Script
# This script helps deploy both frontend and backend

set -e  # Exit on any error

echo "🚀 Prompt Introspector Deployment Script"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

echo ""
echo "Choose deployment option:"
echo "1) Deploy frontend to GitHub Pages"
echo "2) Deploy backend to Vercel"
echo "3) Deploy both"
echo "4) Setup GitHub Actions only"
echo "5) Exit"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo ""
        print_status "Deploying frontend to GitHub Pages..."
        cd frontend
        npm run build
        npm run deploy
        print_status "Frontend deployed to GitHub Pages!"
        ;;
    2)
        echo ""
        print_status "Deploying backend to Vercel..."
        cd backend
        if command -v vercel &> /dev/null; then
            vercel --prod
            print_status "Backend deployed to Vercel!"
        else
            print_error "Vercel CLI not found. Please install it first:"
            echo "npm i -g vercel"
        fi
        ;;
    3)
        echo ""
        print_status "Deploying both frontend and backend..."
        
        # Deploy frontend
        cd frontend
        npm run build
        npm run deploy
        print_status "Frontend deployed to GitHub Pages!"
        
        # Deploy backend
        cd ../backend
        if command -v vercel &> /dev/null; then
            vercel --prod
            print_status "Backend deployed to Vercel!"
        else
            print_warning "Vercel CLI not found. Please install it first:"
            echo "npm i -g vercel"
        fi
        ;;
    4)
        echo ""
        print_status "GitHub Actions workflows are already set up!"
        print_warning "Make sure to:"
        echo "1. Enable GitHub Pages in repository settings"
        echo "2. Set source to 'GitHub Actions'"
        echo "3. Push to main branch to trigger deployment"
        ;;
    5)
        echo "Goodbye! 👋"
        exit 0
        ;;
    *)
        print_error "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
print_status "Deployment completed! 🎉"
echo ""
echo "📋 Next steps:"
echo "1. Check GitHub Actions tab for deployment status"
echo "2. Verify your site is accessible"
echo "3. Test all functionality"
echo ""
echo "🔗 Useful links:"
echo "- GitHub Pages: https://apoorve73.github.io/prompt-introspector"
echo "- GitHub Actions: https://github.com/apoorve73/prompt-introspector/actions"
echo ""
