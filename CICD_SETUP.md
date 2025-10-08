# CI/CD Setup Documentation

This document outlines the CI/CD setup for the Tajneed Frontend project.

## 🚀 Overview

The project includes comprehensive CI/CD workflows using GitHub Actions for:
- Continuous Integration (CI)
- Continuous Deployment (CD)
- Docker containerization
- Security scanning
- Dependency updates

## 📁 Workflow Files

### 1. CI Workflow (`.github/workflows/ci.yml`)
- **Triggers**: Push to main/develop, Pull requests
- **Features**:
  - Multi-node version testing (Node 18, 20)
  - Linting and formatting checks
  - Type checking
  - Build verification
  - Security auditing
  - Unused dependency detection

### 2. Deploy Workflow (`.github/workflows/deploy.yml`)
- **Triggers**: Push to main, Manual dispatch
- **Features**:
  - Staging deployment (develop branch)
  - Production deployment (main branch)
  - Environment-specific builds
  - Netlify deployment integration

### 3. Docker Workflow (`.github/workflows/docker.yml`)
- **Triggers**: Push to main/develop, Tags, Pull requests
- **Features**:
  - Multi-platform Docker builds (AMD64, ARM64)
  - Container registry publishing
  - Security vulnerability scanning
  - Build caching

### 4. Dependency Update Workflow (`.github/workflows/dependency-update.yml`)
- **Triggers**: Weekly schedule, Manual dispatch
- **Features**:
  - Automatic dependency updates
  - Security fix application
  - Pull request creation for updates

## 🐳 Docker Configuration

### Dockerfile
- Multi-stage build for optimized production images
- Node.js 20 Alpine base image
- Nginx for serving static files
- Security-hardened with non-root user

### Docker Compose
- Local development setup
- Production-ready configuration
- Health checks included

## 🔐 Required Secrets

Configure these secrets in your GitHub repository settings:

### Netlify Deployment
```
NETLIFY_AUTH_TOKEN=your_netlify_auth_token
NETLIFY_PRODUCTION_SITE_ID=your_production_site_id
NETLIFY_STAGING_SITE_ID=your_staging_site_id
```

### API URLs
```
PRODUCTION_API_URL=https://api.yourdomain.com
STAGING_API_URL=https://staging-api.yourdomain.com
PRODUCTION_URL=https://yourdomain.com
```

## 🌍 Environment Variables

### Development
Copy `env.example` to `.env.local` and configure:
```bash
cp env.example .env.local
```

### Production
Set environment variables in your deployment platform:
- `VITE_API_URL`: Backend API URL
- `VITE_APP_ENV`: Environment (production/staging)
- `VITE_CLERK_PUBLISHABLE_KEY`: Authentication key
- `VITE_CLOUDINARY_CLOUD_NAME`: Image upload service

## 🚀 Deployment Process

### Automatic Deployment
1. **Staging**: Push to `develop` branch → Auto-deploy to staging
2. **Production**: Push to `main` branch → Auto-deploy to production

### Manual Deployment
1. Go to Actions tab in GitHub
2. Select "Deploy" workflow
3. Click "Run workflow"
4. Choose environment (staging/production)

## 🐳 Docker Deployment

### Local Development
```bash
# Build and run with Docker Compose
docker-compose up --build

# Run in production mode
docker-compose --profile production up --build
```

### Production Deployment
```bash
# Build production image
docker build -t tajneed-frontend .

# Run container
docker run -p 3000:3000 \
  -e VITE_API_URL=https://api.yourdomain.com \
  -e VITE_APP_ENV=production \
  tajneed-frontend
```

## 🔍 Monitoring and Health Checks

### Health Check Endpoint
- URL: `/health`
- Returns: `200 OK` with "healthy" message
- Used by Docker health checks and load balancers

### Security Scanning
- Trivy vulnerability scanner runs on Docker images
- Results uploaded to GitHub Security tab
- Audit CI checks for npm vulnerabilities

## 📊 Build Optimization

### Caching
- Node modules cached in CI
- Docker layer caching enabled
- Build artifacts cached between runs

### Performance
- Multi-stage Docker builds
- Gzip compression enabled
- Static asset caching (1 year)
- Client-side routing support

## 🛠️ Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review linting and type errors

2. **Deployment Issues**
   - Verify Netlify secrets are correct
   - Check environment variables
   - Review deployment logs

3. **Docker Issues**
   - Ensure Docker is running
   - Check port availability
   - Verify image build logs

### Debug Commands
```bash
# Check Docker logs
docker-compose logs tajneed-frontend

# Test build locally
npm run build

# Run security audit
npm audit

# Check for unused dependencies
npm run knip
```

## 📈 Best Practices

1. **Branch Protection**
   - Require PR reviews
   - Require status checks to pass
   - Require branches to be up to date

2. **Security**
   - Regular dependency updates
   - Security scanning in CI
   - Secrets management

3. **Performance**
   - Build caching
   - Multi-stage Docker builds
   - Optimized static assets

## 🔄 Maintenance

### Weekly Tasks
- Review dependency updates
- Check security advisories
- Monitor build performance

### Monthly Tasks
- Update base Docker images
- Review and update workflows
- Performance optimization review

## 📞 Support

For issues with CI/CD setup:
1. Check GitHub Actions logs
2. Review this documentation
3. Check Docker and Netlify documentation
4. Create an issue in the repository
