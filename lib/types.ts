export interface Listing {
  id: number;
  serialNumber: string;
  title: string;
  category: 'Server' | 'Networking' | 'Storage';
  description?: string;
  location?: string;
  condition: 'Excellent' | 'Good' | 'Fair';
  department: string;
  cpu?: string;
  ram?: string;
  storage?: string;
  ports?: string;
  otherSpecs?: string;
  status: 'available' | 'claimed' | 'approved' | 'expired';
  expirationDate: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Claim {
  id: number;
  listingId: number;
  listingTitle?: string;
  serialNumber?: string;
  category?: string;
  requestingDepartment: string;
  justification: string;
  status: 'pending_owner' | 'pending_security' | 'approved' | 'denied';
  requestedBy: string;
  requestedAt: string;
  ownerApprovedAt?: string;
  ownerApprovedBy?: string;
  securityApprovedAt?: string;
  securityApprovedBy?: string;
  deniedAt?: string;
  deniedBy?: string;
  denialReason?: string;
}
