# HardwareHub - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Prerequisites
- Node.js 18+ installed
- Docker Desktop running

### Step 2: Navigate to Project
```bash
cd hardware-marketplace
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Start Database
```bash
docker-compose up -d
```

Wait 10 seconds for PostgreSQL to start, then:

### Step 5: Setup Database
```bash
npm run db:setup
```

You should see:
```
✓ Schema created successfully
✓ Sample data inserted successfully

Database setup complete!
Sample users created:
  - john.doe@company.com (IT Infrastructure)
  - jane.smith@company.com (Data Center Operations)
  - bob.johnson@company.com (Development Team)
  - alice.williams@company.com (Security Team)

Sample hardware listings: 6 items
```

### Step 6: Start Application
```bash
npm run dev
```

### Step 7: Open Browser
Navigate to: **http://localhost:3000**

## 🎯 What to Try

### Browse the Marketplace
- View available hardware (6 sample items loaded)
- Use search and category filters
- See hardware specifications

### Post Hardware (Test Serial Number Lookup)
1. Click "Post Hardware"
2. Try these serial numbers:
   - `SRV-HP-DL360-002` - ✅ Will work (no storage)
   - `SRV-DELL-R740-001` - ❌ Will be blocked (has storage media)
   - `NET-CISCO-3850-001` - ✅ Will work (networking equipment)

### View My Listings
- See hardware you've posted
- One item already has a pending claim from "QA Team"
- Try approving/denying the request

### My Requests
- View hardware you've requested
- See approval workflow status

## 🧪 POC Features Demonstrated

✅ **Serial Number Lookup**: Auto-fetch hardware specs from mock API
✅ **Storage Media Blocking**: Security policy enforcement
✅ **Browse & Search**: Find available hardware
✅ **Request Workflow**: Claim hardware with justification
✅ **Approval Tracking**: Visualize multi-stage approval process
✅ **Expiration Management**: Hardware has deadline for claiming

## 📝 Sample Data Overview

**Users (mock authentication)**:
- IT Infrastructure department (you)
- Data Center Operations
- Development Team
- Security Team

**Hardware Listings**:
1. Dell PowerEdge R730 - Server (available)
2. HP ProLiant DL380 - Server (available)
3. Cisco Catalyst 2960-X - Switch (available)
4. Cisco ASR 1001-X - Router (available)
5. NetApp DS4246 - Disk Shelf (available)
6. Dell PowerEdge R630 - Server (claimed by QA Team)

## 🔧 Troubleshooting

**Database won't start?**
```bash
docker-compose down -v
docker-compose up -d
# Wait 10 seconds
npm run db:setup
```

**Port 3000 already in use?**
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9
npm run dev
```

**Can't connect to database?**
```bash
# Check if PostgreSQL is running
docker ps

# View logs
docker logs hardware-marketplace-db
```

## 📊 Next Steps for Production

After demonstrating POC to stakeholders:

1. **Integrate with Keycloak OIDC** - Replace mock auth
2. **Connect to Real Hardware API** - Replace mock serial lookup
3. **ServiceNow Integration** - Automate approval and shipping workflows
4. **Deploy to Kubernetes** - See DEPLOYMENT.md

## 📁 Project Structure

```
hardware-marketplace/
├── app/                # Next.js pages and API routes
├── components/         # React components
├── lib/               # Utilities (database, auth, mock API)
├── scripts/           # Database setup
├── README.md          # Full documentation
├── DEPLOYMENT.md      # Production deployment guide
└── docker-compose.yml # Local PostgreSQL
```

## 💡 Tips for Demo

1. **Start with the problem**: "We destroy $X in hardware annually"
2. **Show storage blocking**: Try listing hardware with drives
3. **Demonstrate expiration**: "Hardware won't sit forever"
4. **Explain approval flow**: Owner → Security → Shipping
5. **Highlight integration points**: "Ready for ServiceNow, Keycloak, real API"

## 🤝 Questions?

- Check README.md for full documentation
- Check DEPLOYMENT.md for production deployment
- Review code comments for implementation details

**Prepared for:**
- ✅ Air-gapped deployment
- ✅ Kubernetes
- ✅ PostgreSQL (organizational instance)
- ✅ Keycloak OIDC
- ✅ ServiceNow integration (documented)

---

**Ready to impress those decision makers!** 🎉
