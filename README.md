# R-Cycle - Internal Hardware Marketplace

<img width="540" height="540" alt="image" src="https://github.com/user-attachments/assets/0cd0ac0a-147e-4762-9ac0-4f4ffc563152" />

[![License](https://img.shields.io/badge/license-Internal-green.svg)]()
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)]()
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)]()
[![Docker](https://img.shields.io/badge/Docker-ready-blue.svg)]()

> A proof-of-concept internal marketplace for decommissioned hardware, reducing waste and saving budget by facilitating hardware reuse across departments.

**Live Demo:** [r-cycle.vercel.app](https://r-cycle.vercel.app)

[Quick Start](#quick-start) • [Features](#key-features) • [Deployment](#deployment) • [Docker](#docker-deployment)

---

## Overview

R-Cycle enables departments to list decommissioned hardware for internal reuse before disposal, promoting sustainability and cost savings. This POC demonstrates core functionality while being production-ready for deployment in air-gapped, enterprise Kubernetes environments.

**Key Value Proposition:**
- Reduce hardware waste through internal reuse
- Save budget by avoiding unnecessary purchases
- Enforce security policies (storage media removal)
- Track hardware lifecycle with approval workflows

## ✨ Key Features

### 🔍 **Hardware Listing Management**
- Serial number lookup with auto-fetch specifications
- Storage media detection and blocking (security enforcement)
- Expiration date tracking to prevent hardware languishing
- Department ownership and visibility

### 🛒 **Browse & Discovery**
- Search by serial number, title, or department
- Category filtering (Servers, Networking, Storage)
- Real-time availability status
- Clean, professional UI with green branding

### ✅ **Two-Stage Approval Workflow**
- Request hardware with business justification
- Owner approval (first stage)
- Security team review (second stage)
- Full audit trail with timestamps

### 🔒 **Security & Compliance**
- Automatic blocking of hardware containing storage media
- Policy enforcement at technical level
- Air-gapped deployment ready
- No external CDN dependencies

### 🐳 **Production Ready**
- Docker containerization with multi-stage builds
- Kubernetes deployment manifests
- Automatic versioning system
- Environment-agnostic configuration

## 🚀 Quick Start

### Option 1: Local Development

```bash
# Clone the repository
git clone https://github.com/kofadam/r-cycle.git
cd r-cycle

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL

# Run with local PostgreSQL
docker-compose up -d

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Option 2: Docker Quick Start

```bash
# Build the container
docker build -t r-cycle:latest .

# Run with your database
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  r-cycle:latest
```

### Option 3: Deploy to Vercel (Demo)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kofadam/r-cycle)

1. Click "Deploy" button
2. Add Vercel Postgres database
3. Application auto-deploys with environment variables configured

See [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) for detailed instructions.

## 💻 Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | Next.js 14, React 18, TypeScript |
| **Styling** | Tailwind CSS with custom green theme |
| **Backend** | Next.js API Routes (serverless-ready) |
| **Database** | PostgreSQL 15+ (Neon, local, or enterprise) |
| **Auth** | Mock (Keycloak OIDC ready) |
| **Container** | Docker with multi-stage builds |
| **Orchestration** | Kubernetes ready |
| **Deployment** | Vercel (demo), Kubernetes (production) |

## 📁 Project Structure

```
r-cycle/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── listings/         # Hardware CRUD operations
│   │   ├── claims/           # Request/approval workflow
│   │   └── hardware/         # Serial number lookup (mock)
│   ├── page.tsx              # Main marketplace dashboard
│   ├── post/                 # Post hardware form
│   ├── my-listings/          # Manage your listings
│   ├── my-requests/          # Track your requests
│   └── globals.css           # Global styles with green theme
├── components/               # React components
│   └── Sidebar.tsx           # Navigation with version display
├── lib/                      # Core utilities
│   ├── db.ts                 # PostgreSQL connection pool
│   ├── auth.ts               # Mock auth (Keycloak placeholder)
│   ├── hardware-api.ts       # Hardware lookup API (mock)
│   ├── types.ts              # TypeScript definitions
│   └── version.ts            # Version management
├── public/                   # Static assets
│   └── logo-green.svg        # R-Cycle logo
├── docker-compose.yml        # Local development setup
├── Dockerfile                # Production container image
├── schema.sql                # Database schema
└── package.json              # Dependencies and scripts
```

## 📊 Database Schema

### Core Tables

**listings** - Hardware inventory
```sql
- id, serial_number (unique), title, category
- specs: cpu, ram, storage, ports, other_specs
- location, condition, department
- status: available | claimed | approved | expired
- expiration_date, created_by, timestamps
```

**claims** - Hardware requests
```sql
- id, listing_id, requesting_department
- justification, requested_by
- status: pending_owner | pending_security | approved | denied
- approval tracking: owner_approved_by, security_approved_by
- denial tracking: denied_by, denial_reason
- timestamps for each stage
```

**Indexes optimized for:**
- Status filtering
- Department queries
- Date-based expiration checks
- Full-text search on titles/descriptions

## 🐳 Docker Deployment

### Build with Versioning

```bash
# Using the automated script
./build-versioned.sh 1.0.0

# Or manually
docker build \
  --build-arg APP_VERSION=1.0.0 \
  --build-arg BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ") \
  --build-arg GIT_COMMIT=$(git rev-parse --short HEAD) \
  -t r-cycle:1.0.0 \
  .
```

### Run Container

```bash
# With Neon/Vercel Postgres
docker run -d -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host/db?sslmode=require" \
  --name r-cycle \
  r-cycle:1.0.0

# With docker-compose
docker-compose up -d
```

### Air-Gapped Deployment

```bash
# 1. Build on internet-connected machine
docker build -t r-cycle:1.0.0 .

# 2. Export to tar file
docker save r-cycle:1.0.0 -o r-cycle-v1.0.0.tar

# 3. Transfer to air-gapped environment

# 4. Load and deploy
docker load -i r-cycle-v1.0.0.tar
docker tag r-cycle:1.0.0 internal-registry/r-cycle:1.0.0
docker push internal-registry/r-cycle:1.0.0
```

See [DOCKER_GUIDE.md](docs/DOCKER_GUIDE.md) for comprehensive instructions.

## ☸️ Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: r-cycle
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: r-cycle
        image: registry.company.com/r-cycle:1.0.0
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: r-cycle-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

Full K8s manifests available in [DOCKER_GUIDE.md](docs/DOCKER_GUIDE.md).

## 🔧 Configuration

### Environment Variables

```bash
# Required
DATABASE_URL=postgresql://user:password@host:5432/database

# Optional - Versioning (automatically injected at build)
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_BUILD_DATE=2025-11-08T10:00:00Z
NEXT_PUBLIC_GIT_COMMIT=abc123

# Future - Keycloak Integration
# KEYCLOAK_ISSUER=https://keycloak.company.com/realms/your-realm
# KEYCLOAK_CLIENT_ID=r-cycle
# KEYCLOAK_CLIENT_SECRET=your-secret
```

### Mock Hardware Data

Test serial numbers available in `lib/hardware-api.ts`:
- `SRV001-DELL-R730` - Dell server (no storage, will post successfully)
- `SRV002-HP-DL380` - HP server (has storage, will be blocked)
- `NET001-CISCO-2960` - Cisco switch (no storage)
- `NET002-CISCO-ASR` - Cisco router (no storage)

Add more mock devices by editing the `mockDatabase` object.

## 🎯 Development Workflow

### Git Commit Convention

This project uses conventional commits:

```bash
git commit -m "feat(ui): add version display to sidebar"
git commit -m "fix(api): resolve database connection timeout"
git commit -m "docs: update deployment guide"
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Adding Features

1. Create feature branch: `git checkout -b feat/your-feature`
2. Make changes following project patterns
3. Test locally: `npm run dev`
4. Commit with conventional format
5. Push and create PR

### Code Quality

- Pre-commit hooks check TypeScript compilation
- Pre-commit hooks scan for console.log statements
- Commit messages validated against conventional format

## 📈 Roadmap

### ✅ Phase 1: POC (Complete)
- Core marketplace functionality
- Two-stage approval workflow
- Storage media security blocking
- Docker containerization
- Versioning system
- Green branding and professional UI

### 🚧 Phase 2: Production Integration (Next)
- [ ] Keycloak OIDC authentication
- [ ] Real hardware tracking API integration
- [ ] Email notifications (claim alerts, approvals)
- [ ] ServiceNow integration for shipping
- [ ] Analytics dashboard

### 🔮 Phase 3: Advanced Features (Future)
- [ ] Bulk hardware uploads
- [ ] Department watchlists/alerts
- [ ] Advanced search and filtering
- [ ] Hardware lifecycle analytics
- [ ] Mobile-responsive enhancements

## 🔐 Security Considerations

1. **Storage Media Enforcement**
   - Technical controls prevent listing hardware with storage
   - Policy compliance automated at code level

2. **Two-Stage Approval**
   - Owner must approve sharing hardware
   - Security team reviews before final approval

3. **Data Protection**
   - SQL injection prevention via parameterized queries
   - Input validation on all API routes
   - Air-gap deployment capability

4. **Audit Trail**
   - All actions timestamped
   - Approval/denial reasons tracked
   - Full claim lifecycle visibility

## 🐛 Troubleshooting

### Database Connection Refused
```bash
# Check DATABASE_URL is set
docker exec r-cycle printenv DATABASE_URL

# Verify database is accessible
docker exec r-cycle node -e "const {Pool}=require('pg'); new Pool({connectionString:process.env.DATABASE_URL}).query('SELECT 1')"
```

### Version Not Displaying
```bash
# Check build args were passed
docker inspect r-cycle:latest | grep APP_VERSION

# Verify version file exists
docker exec r-cycle cat /app/lib/version.ts
```

### Build Fails
```bash
# Clear cache and rebuild
docker build --no-cache -t r-cycle:latest .

# Check Dockerfile syntax
docker build --dry-run -t r-cycle:latest .
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [DOCKER_GUIDE.md](docs/DOCKER_GUIDE.md) | Complete Docker and K8s deployment guide |
| [VERSIONING_GUIDE.md](docs/VERSIONING_GUIDE.md) | Version management and build strategies |
| [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) | Vercel and production deployment |
| [QUICK_SETUP.md](docs/QUICK_SETUP.md) | Database setup and quick start |

## 🎤 Presenting to Stakeholders

When demonstrating R-Cycle:

1. **Problem Statement** - Hardware destruction despite potential reuse
2. **Live Demo** - Post hardware with serial lookup
3. **Security Feature** - Show storage media blocking in action
4. **Workflow** - Request → Owner Approval → Security Review
5. **UI Polish** - Professional branding, versioning, clean interface
6. **Deployment Ready** - Docker, Kubernetes, air-gap capable
7. **Cost/Benefit** - Calculate potential savings from reuse

## 🤝 Contributing

This is a POC for internal use. For production deployment:

1. Get stakeholder approval
2. Coordinate with IT Security (Keycloak integration)
3. Coordinate with Infrastructure (PostgreSQL, K8s)
4. Integrate with hardware tracking API
5. Connect ServiceNow for workflow automation

## 📄 License

Internal organizational use only. Not licensed for external distribution.

## 📞 Contact

For questions about deployment or production integration, contact your development team lead or IT infrastructure team.

---

**Version:** 1.0.0  
**Last Updated:** November 2025  
**Status:** Production Ready (POC)
