// Mock hardware tracking API
// Replace with real API integration for production

export async function fetchHardwareSpecs(serialNumber: string) {
  // For POC, return mock data
  // In production, this would call your hardware tracking system
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock hardware database
  const mockDatabase: Record<string, any> = {
    'SRV001-DELL-R730': {
      manufacturer: 'Dell',
      model: 'PowerEdge R730',
      category: 'Server',
      specs: {
        cpu: '2x Intel Xeon E5-2630 v4 (10-core, 2.2GHz)',
        ram: '128GB DDR4 ECC',
        storage: ['No drives installed'],
        ports: '4x 1GbE, 2x 10GbE'
      },
      hasStorageMedia: false
    },
    'SRV002-HP-DL380': {
      manufacturer: 'HP',
      model: 'ProLiant DL380 Gen9',
      category: 'Server',
      specs: {
        cpu: '2x Intel Xeon E5-2660 v3 (10-core, 2.6GHz)',
        ram: '64GB DDR4 ECC',
        storage: ['2x 1TB SSD'],
        ports: '4x 1GbE'
      },
      hasStorageMedia: true
    },
    'NET001-CISCO-2960': {
      manufacturer: 'Cisco',
      model: 'Catalyst 2960-X',
      category: 'Networking',
      specs: {
        ports: '24x 1GbE, 4x 1GbE SFP',
        other: '48Gbps switching capacity'
      },
      hasStorageMedia: false
    },
    'NET002-CISCO-ASR': {
      manufacturer: 'Cisco',
      model: 'ASR 1001-X',
      category: 'Networking',
      specs: {
        ram: '8GB',
        ports: '6x 1GbE, 2x 10GbE SFP+',
        other: 'Dual power supplies'
      },
      hasStorageMedia: false
    }
  };
  
  return mockDatabase[serialNumber] || null;
}

export function hasStorageMedia(hardwareSpecs: any): boolean {
  return hardwareSpecs?.hasStorageMedia === true;
}

export function getStorageBlockMessage(hardwareSpecs: any): string {
  const storageList = hardwareSpecs?.specs?.storage?.join(', ') || 'storage media';
  return `⚠️ WARNING: This hardware contains storage media (${storageList}). Per security policy, storage media must be removed before listing.`;
}
