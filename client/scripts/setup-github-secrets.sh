#!/bin/bash

# Exit on error
set -e

# Load environment variables
source .env.prod

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "GitHub CLI is not installed. Please install it first."
    exit 1
fi

# Check if logged in to GitHub
if ! gh auth status &> /dev/null; then
    echo "Please login to GitHub first using: gh auth login"
    exit 1
fi

# Set secrets
echo "Setting up GitHub secrets..."

# Docker secrets
gh secret set DOCKER_USERNAME --body "$DOCKER_USERNAME"
gh secret set DOCKER_TOKEN --body "$DOCKER_TOKEN"

# Deployment secrets
gh secret set DEPLOY_USER --body "$DEPLOY_USER"
gh secret set DEPLOY_HOST --body "$DEPLOY_HOST"
gh secret set SSH_PRIVATE_KEY --body "$(cat ~/.ssh/id_rsa)"
gh secret set SSH_KNOWN_HOSTS --body "$(ssh-keyscan -H $DEPLOY_HOST)"

# Application secrets
gh secret set VITE_API_URL --body "$VITE_API_URL"
gh secret set VITE_WS_URL --body "$VITE_WS_URL"
gh secret set VITE_YOUTUBE_API_KEY --body "$VITE_YOUTUBE_API_KEY"
gh secret set VITE_SENTRY_DSN --body "$VITE_SENTRY_DSN"

# Database secrets
gh secret set DB_PASSWORD --body "$DB_PASSWORD"
gh secret set JWT_SECRET --body "$JWT_SECRET"

echo "GitHub secrets have been set up successfully!" 