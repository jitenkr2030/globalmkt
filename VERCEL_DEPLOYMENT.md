# Vercel Deployment Guide

This guide will help you deploy the Global Markets Trading Platform to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Node.js**: Ensure you're using Node.js 18+ locally

## Pre-Deployment Setup

### 1. Environment Variables

Set the following environment variables in your Vercel dashboard:

```
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### 2. Build Configuration

The project includes:
- `vercel.json`: Vercel configuration
- Modified `next.config.ts`: Vercel-optimized settings
- `src/types/socket.ts`: Type definitions for Socket.IO
- `src/lib/socket-client.ts`: Client-side socket management

## Deployment Steps

### Method 1: Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   cd globalmkt
   vercel --prod
   ```

### Method 2: GitHub Integration

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Connect Repository**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect it as a Next.js project

3. **Configure Settings**:
   - Framework Preset: Next.js
   - Root Directory: `./` (if in a subdirectory)
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Deploy**: Click "Deploy"

## Important Considerations

### Socket.IO Limitations

⚠️ **Note**: Vercel has limitations with persistent WebSocket connections:

1. **Connection Limits**: Socket.IO connections may timeout on Vercel's serverless functions
2. **State Persistence**: WebSocket connections are not persistent across function invocations
3. **Real-time Data**: For production real-time trading data, consider:
   - Using a dedicated WebSocket service (like Pusher, Ably, or Supabase Realtime)
   - Implementing server-sent events (SSE) for one-way communication
   - Using third-party real-time market data providers

### Database Considerations

- Current setup uses SQLite with Prisma
- For Vercel, consider upgrading to PostgreSQL via:
  - Vercel Postgres
  - PlanetScale
  - Supabase
  - Railway

### Performance Optimizations

The deployment includes:
- ✅ Image optimization
- ✅ Gzip compression
- ✅ Security headers
- ✅ CORS handling for API routes
- ✅ Optimized package imports

## Post-Deployment

### 1. Test Your Deployment

1. Visit your Vercel URL
2. Test all major features:
   - Navigation
   - Market data displays
   - Responsive design
   - API endpoints

### 2. Monitor Performance

Use Vercel's analytics to monitor:
- Core Web Vitals
- Error rates
- Function invocations
- Edge function performance

### 3. SSL Certificate

Vercel automatically provides SSL certificates for custom domains.

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check Node.js version (use 18+)
   - Ensure all dependencies are properly declared in `package.json`
   - Review build logs in Vercel dashboard

2. **Socket.IO Connection Issues**:
   - The socket implementation is designed for demo purposes
   - For production, implement a dedicated real-time service

3. **Database Connection Issues**:
   - Update Prisma to use a cloud database
   - Ensure environment variables are set correctly

4. **CORS Issues**:
   - Already configured in `vercel.json`
   - Check API route handlers for proper headers

### Environment-Specific Notes

- **Development**: Use `npm run dev` locally
- **Production**: Uses Vercel's Edge Network
- **Staging**: Create preview deployments for testing

## Alternative Real-Time Solutions

For production trading applications, consider:

1. **Pusher**: Real-time WebSocket service
2. **Ably**: Global messaging platform
3. **Supabase Realtime**: PostgreSQL-based real-time
4. **AWS WebSocket API**: For custom infrastructure
5. **Third-party Market Data**: Bloomberg, Alpha Vantage, etc.

## Security Recommendations

1. **API Keys**: Store sensitive API keys in Vercel environment variables
2. **Authentication**: Implement proper user authentication
3. **Rate Limiting**: Add rate limiting to API routes
4. **SSL**: Always use HTTPS in production
5. **Content Security Policy**: Implement CSP headers

---

**Note**: This application is designed for demonstration and educational purposes. For actual trading applications, ensure compliance with financial regulations and implement appropriate security measures.