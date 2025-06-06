#!/bin/bash

# Build the app
npm run build

# Create CNAME file in the docs directory
echo "alxli.dev" > docs/CNAME

# Add all files to git
git add .

# Commit changes
git commit -m "Deploy to GitHub Pages"

# Push to the main branch
git push origin main
