/**
 * Donor module types and interfaces
 */

export interface ScheduleAppointmentDto {
  donorId: string;
  requestId: string;
  scheduledTime: string | Date;
}

export interface DonorAvailabilityDto {
  donorId: string;
  isDonorAvailable: boolean;
}
