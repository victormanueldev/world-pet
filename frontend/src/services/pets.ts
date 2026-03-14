/**
 * Pet Management Service
 *
 * API client for pet CRUD operations, photo uploads, and adoption workflow
 */
import { api } from './api';
import type {
  Pet,
  PetCreate,
  PetUpdate,
  PaginatedPetResponse,
  PresignedUploadRequest,
  PresignedUploadResponse,
  PetFilters,
  AdoptPetRequest,
} from '@/types/pet';

/**
 * Request a presigned S3 upload URL for pet photo
 */
export async function getUploadUrl(request: PresignedUploadRequest): Promise<PresignedUploadResponse> {
  const response = await api.post<PresignedUploadResponse>('/pets/upload-url', request);
  return response.data;
}

/**
 * Upload photo directly to S3 using presigned URL
 */
export async function uploadToS3(
  presignedUrl: string,
  fields: Record<string, string>,
  file: File,
  onProgress?: (progress: number) => void
): Promise<void> {
  const formData = new FormData();

  // Add all presigned fields first
  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value);
  });

  // Add file last (required by S3)
  formData.append('file', file);

  // Upload to S3 directly (not through our API)
  await fetch(presignedUrl, {
    method: 'POST',
    body: formData,
  });
}

/**
 * Create a new pet
 */
export async function createPet(pet: PetCreate): Promise<Pet> {
  const response = await api.post<Pet>('/pets', pet);
  return response.data;
}

/**
 * List pets with optional filters
 */
export async function listPets(filters?: PetFilters): Promise<PaginatedPetResponse> {
  const params = new URLSearchParams();

  if (filters?.owner_id) params.append('owner_id', filters.owner_id.toString());
  if (filters?.status) params.append('status', filters.status);
  if (filters?.species) params.append('species', filters.species);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const response = await api.get<PaginatedPetResponse>(`/pets?${params.toString()}`);
  return response.data;
}

/**
 * Get a single pet by ID
 */
export async function getPet(petId: number): Promise<Pet> {
  const response = await api.get<Pet>(`/pets/${petId}`);
  return response.data;
}

/**
 * Update a pet
 */
export async function updatePet(petId: number, updates: PetUpdate): Promise<Pet> {
  const response = await api.put<Pet>(`/pets/${petId}`, updates);
  return response.data;
}

/**
 * Adopt a pet (assign owner) - Admin only
 */
export async function adoptPet(petId: number, request: AdoptPetRequest): Promise<Pet> {
  const response = await api.patch<Pet>(`/pets/${petId}/adopt`, request);
  return response.data;
}

/**
 * Delete a pet (soft delete) - Admin only
 */
export async function deletePet(petId: number): Promise<void> {
  await api.delete(`/pets/${petId}`);
}

/**
 * Complete photo upload flow: get presigned URL, upload to S3, return photo key
 */
export async function uploadPetPhoto(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  // Step 1: Get presigned URL
  const uploadData = await getUploadUrl({
    filename: file.name,
    content_type: file.type,
    file_size: file.size,
  });

  // Step 2: Upload to S3
  await uploadToS3(uploadData.upload_url, uploadData.fields, file, onProgress);

  // Step 3: Return photo key for pet creation/update
  return uploadData.photo_key;
}
