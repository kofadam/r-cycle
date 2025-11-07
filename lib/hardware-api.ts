/**
 * Mock Hardware API
 * 
 * Simulates the organizational hardware API that returns specs by serial number
 * 
 * PRODUCTION NOTE:
 * Replace this with actual API integration to your hardware tracking system
 * The mock returns realistic data structure for POC demonstration
 */

export interface HardwareSpecs {
  serialNumber: string;
  model: string;
  manufacturer: string;
  category: 'Server' | 'Networking' | 'Storage';
  specs: {
    cpu?: string;
    ram?: string;
    storage?: string[];  // Array to detect storage media
    ports?: string;
    other?: string;
  };
}

// Mock database of hardware
const mockHardwareDatabase: Record<string, HardwareSpecs> = {
  'SRV-DELL-R740-001': {
    serialNumber: 'SRV-DELL-R740-001',
    model: 'Dell PowerEdge R740',
    manufacturer: 'Dell',
    category: 'Server',
    specs: {
      cpu: '2x Intel Xeon Gold 6140 (18-core, 2.3GHz)',
      ram: '384GB DDR4 ECC',
      storage: ['4x 1.2TB SAS HDD', '2x 960GB SATA SSD'],  // BLOCKED - contains storage
      ports: '4x 1GbE, 2x 10GbE SFP+',
      other: 'Dual 1100W PSU, iDRAC9 Enterprise, GPU-ready'
    }
  },
  'SRV-HP-DL360-002': {
    serialNumber: 'SRV-HP-DL360-002',
    model: 'HP ProLiant DL360 Gen10',
    manufacturer: 'HP',
    category: 'Server',
    specs: {
      cpu: '2x Intel Xeon Silver 4214 (12-core, 2.2GHz)',
      ram: '128GB DDR4 ECC',
      storage: [],  // No storage - safe to list
      ports: '4x 1GbE',
      other: 'Dual 800W PSU, iLO 5, drives removed'
    }
  },
  'NET-CISCO-3850-001': {
    serialNumber: 'NET-CISCO-3850-001',
    model: 'Cisco Catalyst 3850-48P',
    manufacturer: 'Cisco',
    category: 'Networking',
    specs: {
      ports: '48x 1GbE PoE+, 4x 10G SFP+',
      other: 'LAN Base license, dual power supply, stacking ready'
    }
  },
  'NET-JUNIPER-EX4300-001': {
    serialNumber: 'NET-JUNIPER-EX4300-001',
    model: 'Juniper EX4300-48T',
    manufacturer: 'Juniper',
    category: 'Networking',
    specs: {
      ports: '48x 1GbE, 4x 10GbE SFP+',
      other: 'JUNOS Enhanced Layer 3, redundant power, QSFP+ uplink'
    }
  },
  'STG-NETAPP-FAS2650-001': {
    serialNumber: 'STG-NETAPP-FAS2650-001',
    model: 'NetApp FAS2650',
    manufacturer: 'NetApp',
    category: 'Storage',
    specs: {
      storage: ['24x 1.8TB SAS HDD'],  // BLOCKED - storage system
      ports: '4x 10GbE, 2x 16Gb FC',
      other: 'Dual controller, ONTAP 9.x'
    }
  },
  'STG-DISK-SHELF-001': {
    serialNumber: 'STG-DISK-SHELF-001',
    model: 'NetApp DS4246 Disk Shelf',
    manufacturer: 'NetApp',
    category: 'Storage',
    specs: {
      storage: [],  // Shelf only, no drives
      ports: '2x SAS connections',
      other: '24-bay 3.5" disk shelf, dual IOM6 modules, no drives included'
    }
  },
};

/**
 * Simulate API call to hardware tracking system
 * @param serialNumber - Hardware serial number to lookup
 * @returns Hardware specifications or null if not found
 */
export async function fetchHardwareSpecs(serialNumber: string): Promise<HardwareSpecs | null> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Normalize serial number (remove spaces, uppercase)
  const normalizedSN = serialNumber.trim().toUpperCase();
  
  // Check mock database
  const hardware = mockHardwareDatabase[normalizedSN];
  
  if (!hardware) {
    return null;
  }
  
  return hardware;
}

/**
 * Check if hardware contains storage media (security policy)
 * @param specs - Hardware specifications
 * @returns true if storage media detected
 */
export function hasStorageMedia(specs: HardwareSpecs): boolean {
  return specs.specs.storage !== undefined && specs.specs.storage.length > 0;
}

/**
 * Get user-friendly error message for storage media detection
 */
export function getStorageBlockMessage(specs: HardwareSpecs): string {
  return `This hardware contains storage media: ${specs.specs.storage?.join(', ')}. 
  
Per corporate security policy, hardware with storage media cannot be transferred through the marketplace. 
  
Please:
1. Remove all storage media (HDDs, SSDs) from the hardware
2. Ensure drives are sent through secure decommission process
3. Re-list the hardware once storage is removed

If this is a storage system that cannot have drives removed, it must go through the standard decommission process.`;
}
