/**
 * Blood Request module types and interfaces
 */

export interface CreateBloodRequestDto {
  requesterId: string;
  requiredBloodGroup: any;
  unitsNeeded?: number;
  hospitalName?: string;
  hospitalAddress?: string;
  latitude: number;
  longitude: number;
  urgency?: any;
  notes?: string;
}

export interface NearbyDonorSummary {
  id: string;
  fullName: string;
  bloodGroup: any;
  distanceKm: number;
}

export interface CreateRequestWorkflowResult {
  bloodRequest: any;
  matchingDonorsCount: number;
  nearbyDonors: NearbyDonorSummary[];
}
