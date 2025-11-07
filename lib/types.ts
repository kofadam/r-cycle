/**
 * Type Definitions
 * 
 * Core types for the hardware marketplace application
 */

export type HardwareCategory = 'Server' | 'Networking' | 'Storage';
export type HardwareCondition = 'Excellent' | 'Good' | 'Fair';
export type ListingStatus = 'available' | 'claimed' | 'approved' | 'shipped' | 'expired';
export type ClaimStatus = 'pending_owner' | 'pending_security' | 'approved' | 'denied';

export interface Listing {
  id: number;
  serialNumber: string;
  title: string;
  category: HardwareCategory;
  description: string | null;
  location: string | null;
  condition: HardwareCondition | null;
  department: string;
  
  // Hardware specs
  cpu: string | null;
  ram: string | null;
  storage: string | null;
  ports: string | null;
  otherSpecs: string | null;
  
  // Status tracking
  status: ListingStatus;
  expirationDate: string;  // ISO date string
  
  // Metadata
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface Claim {
  id: number;
  listingId: number;
  requestingDepartment: string;
  justification: string;
  status: ClaimStatus;
  requestedBy: number;
  requestedAt: string;
  
  // Approval tracking
  ownerApprovedAt: string | null;
  ownerApprovedBy: number | null;
  securityApprovedAt: string | null;
  securityApprovedBy: number | null;
  
  // Denial tracking
  deniedAt: string | null;
  deniedBy: number | null;
  denialReason: string | null;
}

export interface ListingWithClaim extends Listing {
  claim?: Claim;
}

export interface User {
  id: number;
  email: string;
  name: string;
  department: string;
}
