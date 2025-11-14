# CI/CD Deployment Guide

## Overview
This project uses GitHub Actions for automated CI/CD. When you push to `main` or `dev` branches, the workflow will:
1. Build Docker images for backend and frontend
2. Push images to DockerHub
3. Deploy to your VM via SSH
4. Verify deployment health

## Setup Instructions

### 1. GitHub Repository Secrets
Configure the following secrets in your GitHub repository:
- Go to: Settings → Secrets and variables → Actions → New repository secret

**Required Secrets:**
- `DOCKERHUB_USERNAME` - Your DockerHub username
- `DOCKERHUB_TOKEN` - DockerHub access token (create at https://hub.docker.com/settings/security)
- `VM_HOST` - Your server IP address (e.g., `103.173.99.253`)
- `VM_USERNAME` - SSH username (e.g., `root` or `ubuntu`)
- `VM_SSH_KEY` - Private SSH key for authentication

### 2. VM Setup

#### 2.1 Initial Setup on VM
```bash
# Create project directory
sudo mkdir -p /opt/content_creation_bot
cd /opt/content_creation_bot

# Clone repository (or copy files)
git clone <your-repo-url> .

# Create .env file from ENV_EXAMPLE.md
cp ENV_EXAMPLE.md .env
nano .env  # Edit and fill in all values

# Create docker-compose.yml (use production version)
# Update image names to match your DockerHub username
```

#### 2.2 Update docker-compose.yml on VM
The docker-compose.yml on your VM should use pre-built images:

```yaml
backend:
  image: your-dockerhub-username/content_creation_bot-backend:latest
  # ... rest of config

frontend:
  image: your-dockerhub-username/content_creation_bot-frontend:latest
  # ... rest of config
```

### 3. DockerHub Images
After the first successful build, images will be available at:
- `your-username/content_creation_bot-backend:latest`
- `your-username/content_creation_bot-frontend:latest`

### 4. Deployment Flow
1. Push code to `main` or `dev` branch
2. GitHub Actions automatically:
   - Builds Docker images
   - Pushes to DockerHub
   - SSH into your VM
   - Pulls latest images
   - Restarts containers
   - Verifies health

### 5. Manual Deployment (if needed)
```bash
# SSH into VM
ssh user@your-vm-ip

# Navigate to project
cd /opt/content_creation_bot

# Pull and restart
docker-compose pull
docker-compose down
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f
```

### 6. Troubleshooting

#### View GitHub Actions Logs
- Go to: Actions tab in GitHub
- Click on the latest workflow run
- View logs for each step

#### Check VM Logs
```bash
# View all container logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Check container status
docker-compose ps

# Check container health
docker-compose exec backend curl http://localhost:8000/health
```

#### Common Issues

**SSH Connection Failed:**
- Verify `VM_HOST`, `VM_USERNAME`, and `VM_SSH_KEY` secrets
- Test SSH connection manually: `ssh -i key user@host`
- Ensure SSH key has correct permissions: `chmod 600 key`

**DockerHub Authentication Failed:**
- Verify `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` secrets
- Ensure token has read/write permissions

**Deployment Directory Not Found:**
- Verify `/opt/content_creation_bot` exists on VM
- Update path in `.github/workflows/deploy.yml` if different

**Health Checks Failing:**
- Check if services are actually running: `docker-compose ps`
- Check logs: `docker-compose logs backend`
- Verify ports 8000 and 3000 are accessible
- Check firewall rules

### 7. Environment Variables
Copy `ENV_EXAMPLE.md` to `.env` on your VM and fill in all values:
```bash
cd /opt/content_creation_bot
cp ENV_EXAMPLE.md .env
nano .env
```

**Important:** Never commit `.env` file to git!

### 8. Monitoring
- **Backend Health:** http://your-vm-ip:8000/health
- **Frontend:** http://your-vm-ip:3000
- **API Docs:** http://your-vm-ip:8000/docs

## Rollback Procedure
If deployment fails, you can rollback to a previous version:

```bash
# On VM, pull specific version
docker-compose pull
docker tag your-username/content_creation_bot-backend:latest your-username/content_creation_bot-backend:previous
docker pull your-username/content_creation_bot-backend:<commit-sha>
docker tag your-username/content_creation_bot-backend:<commit-sha> your-username/content_creation_bot-backend:latest
docker-compose up -d
```

