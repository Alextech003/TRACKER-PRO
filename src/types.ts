export type ServiceType = 'BLOQUEIO' | 'TELEMETRIA' | 'ALARME' | 'OUTROS';

export interface ServiceRecord {
  id: string;
  userId: string;
  serviceType: ServiceType;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear?: string;
  blockPoint?: string; // e.g. "Bomba de Combustível", "Ignição"
  date: string; // ISO string 8601
  notes?: string;
  photoUrl?: string; // base64 or storage url
  vehiclePhotoUrl?: string; // base64 or storage url
  videoUrl?: string; // base64 or storage url
  createdAt?: Date;
  updatedAt?: Date;
}
