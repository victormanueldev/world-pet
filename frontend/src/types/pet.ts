/**
 * Pet-related TypeScript types and interfaces
 */

export type PetSpecies = 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
export type PetSex = 'male' | 'female' | 'unknown';
export type PetStatus = 'available_for_adoption' | 'owned' | 'inactive';

export interface Pet {
  id: number;
  tenant_id: number;
  name: string;
  species: PetSpecies;
  breed?: string | null;
  sex: PetSex;
  birth_date?: string | null; // ISO date string
  weight?: number | null; // kg
  sterilized: boolean;
  owner_id?: number | null;
  status: PetStatus;
  photo_url?: string | null;
  photo_key?: string | null;
  adopted_at?: string | null; // ISO datetime string
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by?: number | null;
}

export interface PetCreate {
  name: string;
  species: PetSpecies;
  breed?: string | null;
  sex: PetSex;
  birth_date?: string | null;
  weight?: number | null;
  sterilized?: boolean;
  photo_key?: string | null;
  owner_id?: number | null;
  status?: PetStatus;
}

export interface PetUpdate {
  name?: string;
  breed?: string | null;
  sex?: PetSex;
  birth_date?: string | null;
  weight?: number | null;
  sterilized?: boolean;
  photo_key?: string | null;
  status?: PetStatus;
}

export interface PaginatedPetResponse {
  items: Pet[];
  total: number;
  page: number;
  limit: number;
}

export interface PresignedUploadRequest {
  filename: string;
  content_type: string;
  file_size: number;
}

export interface PresignedUploadResponse {
  upload_url: string;
  fields: Record<string, string>;
  photo_key: string;
  cdn_url: string;
}

export interface PetFilters {
  owner_id?: number;
  status?: PetStatus;
  species?: PetSpecies;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdoptPetRequest {
  owner_id: number;
}

// Helper function to calculate pet age
export function calculateAge(birthDate: string | null | undefined): string {
  if (!birthDate) return 'Unknown';
  
  const birth = new Date(birthDate);
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  
  if (years === 0 && months === 0) {
    const days = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    return `${days} day${days !== 1 ? 's' : ''}`;
  }
  
  if (years === 0) {
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
  
  if (months < 0) {
    return `${years - 1} year${years !== 2 ? 's' : ''}, ${12 + months} month${12 + months !== 1 ? 's' : ''}`;
  }
  
  if (months === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`;
  }
  
  return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}`;
}

// Helper to format species display name
export function formatSpecies(species: PetSpecies): string {
  return species.charAt(0).toUpperCase() + species.slice(1);
}

// Helper to format sex display name
export function formatSex(sex: PetSex): string {
  return sex.charAt(0).toUpperCase() + sex.slice(1);
}

// Helper to format status display name
export function formatStatus(status: PetStatus): string {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
