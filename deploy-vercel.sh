#!/bin/bash

# Vercel Deployment Script for Global Markets Platform
# Run this script to deploy your app to Vercel

echo "🚀 Global Markets Platform - Vercel Deployment"
echo "================================================"

# Check if we're in the right directory
if [ ! -f "vercel.json" ]; then
    echo "❌ Error: vercel.json not found. Please run this script from the globalmkt directory."
    exit 1
fi

echo "✅ Found vercel.json configuration"

# Check for Vercel CLI
if command -v vercel &> /dev/null; then
    echo "✅ Vercel CLI found"
else
    echo "⚠️  Vercel CLI not found. Please install it:"
    echo "   npm install -g vercel"
    echo ""
    echo "   Or use npx:"
    echo "   npx vercel --prod"
    exit 1
fi

echo ""
echo "🔐 Please login to Vercel..."
vercel login

echo ""
echo "🚀 Starting deployment..."
echo ""

# Deploy to production
vercel --prod

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "📋 Next Steps:"
echo "1. Copy your Vercel URL"
echo "2. Test all features in the deployed version"
echo "3. Set up custom domain if needed"
echo "4. Monitor performance in Vercel dashboard"
echo ""
echo "📚 For detailed information, check VERCEL_DEPLOYMENT.md"