# Global Market Expansion Platform - Deployment Guide

This guide provides step-by-step instructions for deploying the Global Market Expansion Platform in various environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Production Deployment](#production-deployment)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [Docker Deployment](#docker-deployment)
6. [Environment Configuration](#environment-configuration)
7. [Monitoring and Logging](#monitoring-and-logging)
8. [Backup and Recovery](#backup-and-recovery)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

#### Hardware Requirements
- **CPU**: 4+ cores recommended
- **Memory**: 8GB+ RAM recommended
- **Storage**: 50GB+ available space
- **Network**: Stable internet connection

#### Software Requirements
- **Node.js**: Version 18.x or higher
- **npm**: Version 8.x or higher
- **Docker**: Version 20.x or higher (for containerized deployment)
- **kubectl**: Version 1.25+ (for Kubernetes deployment)
- **Git**: Version 2.x or higher

### Account Requirements
- **Docker Hub account** (for container registry)
- **Kubernetes cluster** (for production deployment)
- **Domain name** (for production deployment)
- **SSL certificate** (for production HTTPS)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/global-market-platform.git
cd global-market-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

```bash
cp .env.example .env
```

Edit the `.env` file with your local configuration:

```env
# Application
NODE_ENV=development
PORT=3000
HOSTNAME=localhost

# Database
DATABASE_URL="file:./dev.db"

# AI Services
ZAI_API_KEY=your-zai-api-key
ZAI_API_URL=https://api.z-ai.com

# Authentication
NEXTAUTH_SECRET=your-nextauth-secret

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

### 4. Database Setup

```bash
# Run database migrations
npm run db:push

# Seed database (optional)
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Production Deployment

### Option 1: Automated Deployment Script

Use the provided deployment script for automated deployment:

```bash
# Make script executable
chmod +x deploy.sh

# Deploy the application
./deploy.sh deploy
```

### Option 2: Manual Deployment

#### 1. Build the Application

```bash
# Install dependencies
npm ci

# Run tests
npm test

# Build the application
npm run build

# Run linting
npm run lint
```

#### 2. Database Setup

```bash
# Run database migrations
npm run db:push
```

#### 3. Start the Application

```bash
# Start the application
npm start
```

## Kubernetes Deployment

### 1. Prepare Kubernetes Cluster

Ensure you have a running Kubernetes cluster and `kubectl` configured:

```bash
# Verify cluster connection
kubectl cluster-info

# Verify kubectl configuration
kubectl config current-context
```

### 2. Configure Environment Variables

Update the Kubernetes configuration files with your environment-specific values:

#### ConfigMap (`k8s/configmap.yaml`)
```yaml
data:
  NODE_ENV: "production"
  DATABASE_URL: "your-production-database-url"
  ZAI_API_URL: "https://api.z-ai.com"
```

#### Secrets (`k8s/secrets.yaml`)
```bash
# Generate base64 encoded values
echo -n "your-secret-value" | base64
```

Update the secrets file with your encoded values.

### 3. Deploy to Kubernetes

```bash
# Apply namespace
kubectl apply -f k8s/namespace.yaml

# Apply configuration
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# Deploy Redis (if needed)
kubectl apply -f k8s/redis-deployment.yaml

# Deploy application
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
```

### 4. Verify Deployment

```bash
# Check deployment status
kubectl get pods -n global-market-platform

# Check services
kubectl get services -n global-market-platform

# Check ingress
kubectl get ingress -n global-market-platform

# Check HPA status
kubectl get hpa -n global-market-platform
```

### 5. Access the Application

Once the deployment is complete, access the application via the configured domain name or load balancer IP.

## Docker Deployment

### 1. Build Docker Image

```bash
# Build the Docker image
docker build -t global-market-platform:latest .

# Tag the image for registry
docker tag global-market-platform:latest your-registry/global-market-platform:latest
```

### 2. Push to Registry

```bash
# Push to Docker Hub
docker push your-registry/global-market-platform:latest
```

### 3. Run Container

```bash
# Run the container
docker run -d \
  --name global-market-platform \
  -p 3000:3000 \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e DATABASE_URL="your-database-url" \
  -e ZAI_API_KEY="your-api-key" \
  -e NEXTAUTH_SECRET="your-secret" \
  your-registry/global-market-platform:latest
```

### 4. Docker Compose (Optional)

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  app:
    image: your-registry/global-market-platform:latest
    ports:
      - "3000:3000"
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@db:5432/globalmarket
      - ZAI_API_KEY=your-api-key
      - NEXTAUTH_SECRET=your-secret
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=globalmarket
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

Run with Docker Compose:

```bash
docker-compose up -d
```

## Environment Configuration

### Production Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment | Yes | `production` |
| `PORT` | Application port | No | `3000` |
| `HOSTNAME` | Application host | No | `0.0.0.0` |
| `DATABASE_URL` | Database connection | Yes | `postgresql://...` |
| `ZAI_API_KEY` | Z-AI API key | Yes | `your-api-key` |
| `ZAI_API_URL` | Z-AI API URL | No | `https://api.z-ai.com` |
| `NEXTAUTH_SECRET` | NextAuth secret | Yes | `your-secret` |
| `REDIS_URL` | Redis connection | No | `redis://localhost:6379` |
| `MARKET_DATA_API_URL` | Market data API | No | `https://api.marketdata.com` |
| `ENABLE_METRICS` | Enable metrics | No | `true` |
| `METRICS_PORT` | Metrics port | No | `9090` |

### Security Considerations

1. **Never commit secrets to version control**
2. **Use strong, randomly generated secrets**
3. **Rotate secrets regularly**
4. **Use environment-specific configurations**
5. **Enable SSL/TLS in production**

## Monitoring and Logging

### Application Monitoring

#### Health Checks

The application includes built-in health checks:

```bash
# Application health
curl http://localhost:3000/api/health

# Database health
curl http://localhost:3000/api/health/database

# AI services health
curl http://localhost:3000/api/health/ai
```

#### Metrics Collection

The application exposes metrics at `/metrics` endpoint:

```bash
# Get application metrics
curl http://localhost:9090/metrics
```

### Logging

#### Structured Logging

The application uses structured logging in JSON format:

```javascript
// Example log entry
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "level": "info",
  "message": "User login successful",
  "userId": "123",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0..."
}
```

#### Log Aggregation

For production deployment, configure log aggregation:

1. **ELK Stack**: Elasticsearch, Logstash, Kibana
2. **Splunk**: Commercial log management
3. **Datadog**: Cloud-based monitoring
4. **Prometheus + Grafana**: Open-source monitoring

### Alerting

Configure alerts for critical conditions:

- **High error rates** (> 5%)
- **High response times** (> 2s)
- **Low memory** (< 10% available)
- **High CPU** (> 80%)
- **Database connection issues**

## Backup and Recovery

### Database Backups

#### Automated Backups

Configure automated database backups:

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="globalmarket"

# Create backup
pg_dump $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Keep only last 30 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

#### Backup Schedule

| Frequency | Retention | Type |
|-----------|-----------|------|
| Daily | 30 days | Full backup |
| Weekly | 12 weeks | Full backup |
| Monthly | 12 months | Full backup |
| Yearly | 7 years | Full backup |

### Recovery Procedures

#### Database Recovery

```bash
# Stop application
kubectl scale deployment global-market-platform --replicas=0

# Restore database
gunzip < backup_20240101_000000.sql.gz | psql $DB_NAME

# Restart application
kubectl scale deployment global-market-platform --replicas=3
```

#### Disaster Recovery

1. **Infrastructure Recovery**
   - Restore from infrastructure backups
   - Recreate Kubernetes cluster
   - Restore persistent volumes

2. **Application Recovery**
   - Deploy application from latest backup
   - Restore database
   - Verify functionality

3. **Data Recovery**
   - Restore from database backups
   - Verify data integrity
   - Test application functionality

## Troubleshooting

### Common Issues

#### 1. Application Fails to Start

**Symptoms**: Container crashes, application not accessible

**Solutions**:
```bash
# Check container logs
kubectl logs -f deployment/global-market-platform -n global-market-platform

# Check pod status
kubectl get pods -n global-market-platform

# Describe pod for detailed information
kubectl describe pod <pod-name> -n global-market-platform
```

#### 2. Database Connection Issues

**Symptoms**: Database connection errors, slow queries

**Solutions**:
```bash
# Check database pod status
kubectl get pods -l app=postgres -n global-market-platform

# Check database logs
kubectl logs -f deployment/postgres -n global-market-platform

# Test database connection
kubectl exec -it <pod-name> -n global-market-platform -- psql $DATABASE_URL -c "SELECT 1"
```

#### 3. High Memory Usage

**Symptoms**: Pods being OOM killed, high memory usage

**Solutions**:
```bash
# Check resource usage
kubectl top pods -n global-market-platform

# Check HPA status
kubectl get hpa -n global-market-platform

# Adjust resource limits
kubectl edit deployment global-market-platform -n global-market-platform
```

#### 4. AI Service Issues

**Symptoms**: AI predictions failing, slow responses

**Solutions**:
```bash
# Check AI service configuration
kubectl get configmap global-market-platform-config -n global-market-platform

# Check secrets
kubectl get secrets global-market-platform-secrets -n global-market-platform

# Test AI service connectivity
kubectl exec -it <pod-name> -n global-market-platform -- curl $ZAI_API_URL
```

### Performance Issues

#### 1. Slow Response Times

**Diagnosis**:
```bash
# Check response times
kubectl logs -f deployment/global-market-platform -n global-market-platform | grep "response time"

# Check resource usage
kubectl top pods -n global-market-platform

# Check HPA scaling
kubectl get hpa -n global-market-platform
```

**Solutions**:
- Increase replica count
- Optimize database queries
- Add caching
- Scale resources

#### 2. High Error Rates

**Diagnosis**:
```bash
# Check error logs
kubectl logs -f deployment/global-market-platform -n global-market-platform | grep "ERROR"

# Check error rate metrics
curl http://localhost:9090/metrics | grep "error_rate"
```

**Solutions**:
- Identify error sources
- Fix application bugs
- Add error handling
- Implement retries

### Maintenance Commands

#### 1. Rolling Restart

```bash
# Restart deployment with zero downtime
kubectl rollout restart deployment/global-market-platform -n global-market-platform
```

#### 2. Rollback Deployment

```bash
# Rollback to previous revision
kubectl rollout undo deployment/global-market-platform -n global-market-platform
```

#### 3. Scale Application

```bash
# Scale up
kubectl scale deployment/global-market-platform --replicas=5 -n global-market-platform

# Scale down
kubectl scale deployment/global-market-platform --replicas=1 -n global-market-platform
```

#### 4. Port Forwarding

```bash
# Forward local port to application
kubectl port-forward svc/global-market-platform-service 3000:80 -n global-market-platform
```

## Support

For additional support:

1. **Documentation**: Check the comprehensive documentation in `/docs`
2. **GitHub Issues**: Report bugs and request features
3. **Community**: Join our community forum
4. **Enterprise Support**: Contact our enterprise support team

---

This deployment guide provides comprehensive instructions for deploying the Global Market Expansion Platform in various environments. For specific questions or issues, please refer to the troubleshooting section or contact the support team.