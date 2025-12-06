import { Apartment } from '../models/Apartment';

// Example: Fetch apartments from API
export async function fetchApartments(): Promise<Apartment[]> {
  // Replace URL with your API endpoint
  const response = await fetch('/api/apartments');
  if (!response.ok) {
    throw new Error('Failed to fetch apartments');
  }
  return response.json();
}
