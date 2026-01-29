#!/bin/bash

# 3D Film Ribbon Portfolio - Deploy Script
# This script commits and pushes to GitHub for Netlify deployment

echo "🚀 Deploying 3D Film Ribbon Portfolio..."

# Navigate to project directory
cd /Users/samanthapresswood/Desktop/Joe_Portolio

# Create initial commit
echo "📝 Creating initial commit..."
git commit -m "🎬 Initial commit: 3D Film Ribbon Portfolio

- Implemented twisted figure-8 ribbon curve with banking
- Created three-state video cards (idle/hover/active)
- Added custom GLSL shaders (RGB glitch, wave distortion)
- Built camera system with tangent/normal/binormal rotation
- Integrated post-processing (Bloom, Chromatic Aberration, Film Grain)
- Added YouTube player modal
- Custom cursor with trail effect
- Fixed dependencies: Downgraded to React 18 for stability"

# Add GitHub remote
echo "🔗 Connecting to GitHub..."
git remote add origin https://github.com/islayah5/Joe_Portfolio.git

# Set main branch and push
echo "⬆️ Pushing to GitHub..."
git branch -M main
git push -u origin main

echo "✅ Done! Now go to Netlify to deploy:"
echo "   https://app.netlify.com"
echo "   → Import from GitHub → Select 'Joe_Portfolio'"
echo ""
echo "The project now uses standard React 18 dependencies."
echo "No special build flags are needed!"
