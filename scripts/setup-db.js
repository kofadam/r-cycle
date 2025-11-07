/**
 * Database Setup Script
 * 
 * Creates tables and seeds initial data for POC
 * Run: npm run db:setup
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/hardware_marketplace',
});

const schema = `
-- Users table (simplified for POC - will integrate with Keycloak OIDC later)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  department VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hardware listings table
CREATE TABLE IF NOT EXISTS listings (
  id SERIAL PRIMARY KEY,
  serial_number VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  condition VARCHAR(50),
  department VARCHAR(255) NOT NULL,
  
  -- Hardware specifications
  cpu VARCHAR(255),
  ram VARCHAR(255),
  storage VARCHAR(255),
  ports VARCHAR(255),
  other_specs TEXT,
  
  -- Status and dates
  status VARCHAR(50) DEFAULT 'available',
  expiration_date DATE NOT NULL,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Claims/requests table
CREATE TABLE IF NOT EXISTS claims (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
  requesting_department VARCHAR(255) NOT NULL,
  justification TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending_owner',
  requested_by INTEGER REFERENCES users(id),
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Approval tracking
  owner_approved_at TIMESTAMP,
  owner_approved_by INTEGER REFERENCES users(id),
  security_approved_at TIMESTAMP,
  security_approved_by INTEGER REFERENCES users(id),
  
  -- Denial tracking
  denied_at TIMESTAMP,
  denied_by INTEGER REFERENCES users(id),
  denial_reason TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_department ON listings(department);
CREATE INDEX IF NOT EXISTS idx_listings_expiration ON listings(expiration_date);
CREATE INDEX IF NOT EXISTS idx_claims_listing ON claims(listing_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
`;

const sampleData = `
-- Sample users for POC
INSERT INTO users (email, name, department) VALUES
  ('john.doe@company.com', 'John Doe', 'IT Infrastructure'),
  ('jane.smith@company.com', 'Jane Smith', 'Data Center Operations'),
  ('bob.johnson@company.com', 'Bob Johnson', 'Development Team'),
  ('alice.williams@company.com', 'Alice Williams', 'Security Team')
ON CONFLICT (email) DO NOTHING;

-- Sample hardware listings
INSERT INTO listings (
  serial_number, title, category, description, location, condition, department,
  cpu, ram, storage, ports, other_specs, expiration_date, created_by, status
) VALUES
  (
    'SRV001-DELL-R730',
    'Dell PowerEdge R730 Server',
    'Server',
    'Dual-socket server, good for development workloads',
    'Building A, Floor 3, Rack 12',
    'Good',
    'IT Infrastructure',
    '2x Intel Xeon E5-2630 v4 (10-core, 2.2GHz)',
    '128GB DDR4 ECC',
    'No drives installed (removed per security policy)',
    '4x 1GbE, 2x 10GbE',
    'Dual 750W PSU, iDRAC Enterprise',
    CURRENT_DATE + INTERVAL '30 days',
    1,
    'available'
  ),
  (
    'SRV002-HP-DL380',
    'HP ProLiant DL380 Gen9',
    'Server',
    'Reliable workhorse server, rack-ready',
    'Building B, Floor 2, Rack 5',
    'Fair',
    'Data Center Operations',
    '2x Intel Xeon E5-2660 v3 (10-core, 2.6GHz)',
    '64GB DDR4 ECC',
    'No drives installed',
    '4x 1GbE',
    'Dual 500W PSU, iLO 4 Advanced',
    CURRENT_DATE + INTERVAL '21 days',
    2,
    'available'
  ),
  (
    'NET001-CISCO-2960',
    'Cisco Catalyst 2960-X Switch',
    'Networking',
    '48-port gigabit switch with 4x SFP+ uplinks',
    'Building A, Floor 1, Network Closet',
    'Excellent',
    'IT Infrastructure',
    'N/A',
    'N/A',
    'N/A',
    '48x 1GbE, 4x 10G SFP+',
    'PoE+ support, LAN Base license',
    CURRENT_DATE + INTERVAL '45 days',
    1,
    'available'
  ),
  (
    'NET002-CISCO-ASR',
    'Cisco ASR 1001-X Router',
    'Networking',
    'Enterprise router, minimal usage hours',
    'Building C, Data Center',
    'Good',
    'Data Center Operations',
    'N/A',
    'N/A',
    'N/A',
    '6x 1GbE, 2x 10GbE SFP+',
    'IP Base license, dual AC power',
    CURRENT_DATE + INTERVAL '14 days',
    2,
    'available'
  ),
  (
    'STG001-NETAPP-SHELF',
    'NetApp DS4246 Disk Shelf',
    'Storage',
    'Disk shelf only - no drives included',
    'Building B, Floor 2, Rack 8',
    'Good',
    'IT Infrastructure',
    'N/A',
    'N/A',
    'No drives - shelf only',
    '2x SAS connections',
    '24-bay 3.5" disk shelf, dual IOM6 modules',
    CURRENT_DATE + INTERVAL '20 days',
    1,
    'available'
  ),
  (
    'SRV003-DELL-R630',
    'Dell PowerEdge R630 Server',
    'Server',
    'Compact 1U server, recently decommissioned',
    'Building A, Floor 3, Rack 15',
    'Excellent',
    'Development Team',
    '2x Intel Xeon E5-2680 v4 (14-core, 2.4GHz)',
    '256GB DDR4 ECC',
    'No drives installed',
    '4x 1GbE, 2x 10GbE',
    'Dual 495W PSU, iDRAC Enterprise, 8x 2.5" bays',
    CURRENT_DATE + INTERVAL '25 days',
    3,
    'claimed'
  )
ON CONFLICT (serial_number) DO NOTHING;

-- Sample claim for the claimed server
INSERT INTO claims (
  listing_id, requesting_department, justification, status, requested_by
) VALUES
  (
    (SELECT id FROM listings WHERE serial_number = 'SRV003-DELL-R630'),
    'QA Team',
    'Need for automated testing infrastructure expansion',
    'pending_owner',
    4
  )
ON CONFLICT DO NOTHING;
`;

async function setupDatabase() {
  try {
    console.log('Creating database schema...');
    await pool.query(schema);
    console.log('✓ Schema created successfully');

    console.log('Seeding sample data...');
    await pool.query(sampleData);
    console.log('✓ Sample data inserted successfully');

    console.log('\nDatabase setup complete!');
    console.log('Sample users created:');
    console.log('  - john.doe@company.com (IT Infrastructure)');
    console.log('  - jane.smith@company.com (Data Center Operations)');
    console.log('  - bob.johnson@company.com (Development Team)');
    console.log('  - alice.williams@company.com (Security Team)');
    console.log('\nSample hardware listings: 6 items');

  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
