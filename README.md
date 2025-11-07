# HardwareHub - Internal Hardware Marketplace

A proof-of-concept internal marketplace for decommissioned hardware, built to demonstrate value to organizational decision makers before full integration.

## Overview

HardwareHub allows departments to list decommissioned hardware for internal reuse before destruction, reducing waste and saving budget. The POC focuses on core functionality while preparing for future integrations with Keycloak OIDC, PostgreSQL, and Kubernetes deployment.

## Tech Stack

- **Frontend**: Next.js 14 with React and TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (prepared for organizational instance)
- **Auth**: Mock auth (prepared for Keycloak OIDC integration)
- **Deployment**: Docker + Kubernetes ready

## Key Features

✅ **Hardware Listing Management**
- Serial number lookup with mock API (ready for real API integration)
- Auto-fetch hardware specifications
- Storage media blocking (security policy enforcement)
- Expiration date tracking

✅ **Browse & Discovery**
- Search by serial number, title, or department
- Category filtering (Servers, Networking, Storage)
- Real-time availability status

✅ **Claim & Request Workflow**
- Request hardware with justification
- Approval workflow visualization (Owner → Security → Shipped)
- Status tracking for both requesters and listers

✅ **Air-Gap Environment Ready**
- All assets bundled locally
- No external CDN dependencies
- Self-contained deployment

## Quick Start

### Prerequisites

- Node.js 18+ 
- Docker and Docker Compose
- PostgreSQL (via Docker or local installation)

### Local Development Setup

1. **Clone and Install Dependencies**
   ```bash
   cd hardware-marketplace
   npm install
   ```

2. **Start PostgreSQL Database**
   ```bash
   docker-compose up -d
   ```

3. **Setup Database Schema and Sample Data**
   ```bash
   npm run db:setup
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access Application**
   Open http://localhost:3000

### Sample Data

The database setup script creates:
- **4 sample users** from different departments
- **6 hardware listings** (servers, networking, storage)
- **1 sample claim** showing the approval workflow

## Project Structure

```
hardware-marketplace/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── listings/         # Hardware listings CRUD
│   │   ├── claims/           # Claim/request management
│   │   └── hardware/         # Mock hardware lookup API
│   ├── page.tsx              # Dashboard/Marketplace
│   ├── post/                 # Post Hardware form
│   ├── my-listings/          # Manage your listings
│   └── my-requests/          # Track your requests
├── components/               # React components
│   └── Sidebar.tsx           # Navigation sidebar
├── lib/                      # Utilities and helpers
│   ├── db.ts                 # PostgreSQL connection pool
│   ├── auth.ts               # Auth utilities (Keycloak placeholder)
│   ├── hardware-api.ts       # Mock hardware API
│   └── types.ts              # TypeScript type definitions
├── scripts/                  # Database and deployment scripts
│   └── setup-db.js           # Schema creation and seeding
├── docker-compose.yml        # Local PostgreSQL setup
├── Dockerfile                # Production container image
└── README.md                 # This file
```

## Database Schema

### Tables

**users**
- Mock user table (will be replaced by Keycloak)
- Stores department information

**listings**
- Hardware postings with specifications
- Tracks status (available, claimed, approved, shipped, expired)
- Expiration date enforcement

**claims**
- Hardware requests/claims
- Approval workflow tracking (owner, security)
- Denial tracking with reasons

## Production Deployment

### Environment Variables

Create a `.env` file for production:

```bash
# Database (point to your organizational PostgreSQL)
DATABASE_URL=postgresql://user:password@postgres-host:5432/hardware_marketplace

# Keycloak OIDC (to be implemented)
# KEYCLOAK_ISSUER=https://keycloak.company.com/realms/your-realm
# KEYCLOAK_CLIENT_ID=hardware-marketplace
# KEYCLOAK_CLIENT_SECRET=your-secret
# NEXTAUTH_URL=https://hardware.company.com
# NEXTAUTH_SECRET=your-nextauth-secret

NODE_ENV=production
```

### Docker Build

```bash
# Build the Docker image
docker build -t hardware-marketplace:latest .

# Tag for internal registry
docker tag hardware-marketplace:latest registry.company.com/hardware-marketplace:latest

# Push to internal registry (for air-gap deployment)
docker push registry.company.com/hardware-marketplace:latest
```

### Kubernetes Deployment

Basic deployment example:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hardware-marketplace
spec:
  replicas: 2
  selector:
    matchLabels:
      app: hardware-marketplace
  template:
    metadata:
      labels:
        app: hardware-marketplace
    spec:
      containers:
      - name: hardware-marketplace
        image: registry.company.com/hardware-marketplace:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: hardware-marketplace-secrets
              key: database-url
        - name: NODE_ENV
          value: "production"
---
apiVersion: v1
kind: Service
metadata:
  name: hardware-marketplace
spec:
  selector:
    app: hardware-marketplace
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
```

## Integration Roadmap

### Phase 1: POC (Current)
- ✅ Mock authentication
- ✅ Mock hardware API
- ✅ Basic workflow demonstration
- ✅ PostgreSQL schema
- ✅ Docker/K8s ready

### Phase 2: Production Ready
- [ ] **Keycloak OIDC Integration**
  - Install next-auth: `npm install next-auth`
  - Configure Keycloak provider
  - Add authentication middleware
  - Replace mock users with real sessions

- [ ] **Real Hardware API Integration**
  - Update `lib/hardware-api.ts`
  - Replace mock data with actual API calls
  - Add API authentication/authorization

- [ ] **ServiceNow Integration**
  - Approval workflow automation
  - Shipping request generation
  - Status synchronization

- [ ] **Email Notifications**
  - Claim notifications to owners
  - Approval status updates
  - Expiration warnings

### Phase 3: Enhanced Features
- [ ] Advanced search and filtering
- [ ] Analytics dashboard
- [ ] Bulk listing uploads
- [ ] Department hardware watchlists
- [ ] Automated expiration handling

## Architecture Notes

### Authentication Strategy

**Current (POC):**
- Simple mock user selection
- Department-based filtering

**Production:**
```typescript
// Example Keycloak integration
import KeycloakProvider from "next-auth/providers/keycloak"

providers: [
  KeycloakProvider({
    clientId: process.env.KEYCLOAK_CLIENT_ID,
    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
    issuer: process.env.KEYCLOAK_ISSUER,
  })
]
```

### API Integration Strategy

**Current:**
Mock API in `lib/hardware-api.ts` returns predefined hardware specs.

**Production:**
Replace with actual HTTP calls to your hardware tracking system:

```typescript
export async function fetchHardwareSpecs(serialNumber: string) {
  const response = await fetch(
    `${process.env.HARDWARE_API_URL}/hardware/${serialNumber}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.HARDWARE_API_TOKEN}`
      }
    }
  );
  return await response.json();
}
```

### Security Considerations

1. **Storage Media Policy**
   - Automatic blocking of hardware with storage devices
   - Configurable in `lib/hardware-api.ts`

2. **Approval Workflow**
   - Two-stage: Owner approval → Security review
   - Configurable role-based permissions

3. **Data Validation**
   - Server-side validation on all API routes
   - SQL injection protection via parameterized queries

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps

# View PostgreSQL logs
docker logs hardware-marketplace-db

# Recreate database
docker-compose down -v
docker-compose up -d
npm run db:setup
```

### Mock Data Issues

```bash
# Reset and re-seed database
npm run db:setup
```

### Build Issues

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

## POC Demonstration Tips

When presenting to decision makers:

1. **Start with the problem**: Show value of hardware being destroyed
2. **Walk through posting flow**: Demonstrate serial number lookup and storage blocking
3. **Show discovery**: Browse, search, filter by category
4. **Demonstrate claims**: Request hardware with justification
5. **Explain approval flow**: Owner → Security → Shipping (visualized but not fully automated in POC)
6. **Highlight expiration**: Show how hardware doesn't languish
7. **Discuss integration points**: ServiceNow, Keycloak, real hardware API

## Contributing

This is a POC for internal organizational use. After stakeholder approval:

1. Review and approve integration approach
2. Coordinate with IT Security for Keycloak setup
3. Coordinate with Infrastructure for PostgreSQL provisioning
4. Work with API team for hardware tracking integration
5. Coordinate with ServiceNow team for workflow integration

## License

Internal organizational use only.

## Contact

For questions about this POC or to discuss production deployment, contact your development team lead.
