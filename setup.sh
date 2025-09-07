#!/bin/bash

# Prompt Introspector Setup Script
# This script sets up the development environment

set -e

echo "🚀 Setting up Prompt Introspector..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js $(node --version) is installed"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm 9+"
        exit 1
    fi
    
    NPM_VERSION=$(npm --version | cut -d'.' -f1)
    if [ "$NPM_VERSION" -lt 9 ]; then
        print_warning "npm version 9+ is recommended. Current version: $(npm --version)"
    fi
    
    print_success "npm $(npm --version) is installed"
}

# Install backend dependencies
setup_backend() {
    print_status "Setting up backend..."
    cd backend
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in backend directory"
        exit 1
    fi
    
    print_status "Installing backend dependencies..."
    npm install
    
    # Copy environment file if it doesn't exist
    if [ ! -f ".env" ]; then
        if [ -f "env.example" ]; then
            cp env.example .env
            print_success "Created .env file from env.example"
            print_warning "Please edit backend/.env and add your OpenAI API key"
        else
            print_warning "No env.example found, creating basic .env file"
            cat > .env << EOF
PORT=3001
NODE_ENV=development
OPENAI_API_KEY=your_openai_api_key_here
LOG_LEVEL=info
EOF
        fi
    else
        print_success ".env file already exists"
    fi
    
    cd ..
    print_success "Backend setup complete"
}

# Install frontend dependencies
setup_frontend() {
    print_status "Setting up frontend..."
    cd frontend
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in frontend directory"
        exit 1
    fi
    
    print_status "Installing frontend dependencies..."
    npm install
    
    # Copy environment file if it doesn't exist
    if [ ! -f ".env" ]; then
        if [ -f "env.example" ]; then
            cp env.example .env
            print_success "Created .env file from env.example"
        else
            print_warning "No env.example found, creating basic .env file"
            cat > .env << EOF
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_DEBUG=false
EOF
        fi
    else
        print_success ".env file already exists"
    fi
    
    cd ..
    print_success "Frontend setup complete"
}

# Run linting and formatting
setup_code_quality() {
    print_status "Setting up code quality tools..."
    
    # Backend
    cd backend
    if npm list eslint &> /dev/null; then
        print_status "Running backend linting..."
        npm run lint:fix || print_warning "Backend linting had issues"
    fi
    
    if npm list prettier &> /dev/null; then
        print_status "Formatting backend code..."
        npm run format || print_warning "Backend formatting had issues"
    fi
    cd ..
    
    # Frontend
    cd frontend
    if npm list eslint &> /dev/null; then
        print_status "Running frontend linting..."
        npm run lint:fix || print_warning "Frontend linting had issues"
    fi
    
    if npm list prettier &> /dev/null; then
        print_status "Formatting frontend code..."
        npm run format || print_warning "Frontend formatting had issues"
    fi
    cd ..
    
    print_success "Code quality setup complete"
}

# Main setup function
main() {
    echo "🔍 Prompt Introspector Setup"
    echo "=========================="
    echo ""
    
    # Check prerequisites
    check_node
    check_npm
    echo ""
    
    # Setup backend and frontend
    setup_backend
    echo ""
    setup_frontend
    echo ""
    
    # Setup code quality
    setup_code_quality
    echo ""
    
    # Final instructions
    print_success "🎉 Setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Edit backend/.env and add your OpenAI API key (optional)"
    echo "2. Start the backend: cd backend && npm run dev"
    echo "3. Start the frontend: cd frontend && npm start"
    echo "4. Open http://localhost:3000 in your browser"
    echo ""
    echo "For more information, see README.md"
}

# Run main function
main "$@"
