import { auth, firestore } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export interface Resident {
  id: string;
  name: string;
  monthlyFee: number;
  remainingAmount: number;
  isSyndic?: boolean;
  isLinkedWithUser: boolean;
  linkedUserId: string | null;
}

export interface ApartmentData {
  id: string;
  name: string;
  joinCode: string;
  numberOfResidents: number;
  residents: Resident[];
}

/**
 * Fetch apartment data with residents list
 */
export async function getApartmentData(apartmentId: string): Promise<{
  success: boolean;
  error: string | null;
  apartment?: ApartmentData;
}> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    // Get apartment document
    const apartmentDocRef = doc(firestore, 'apartments', apartmentId);
    const apartmentDoc = await getDoc(apartmentDocRef);

    if (!apartmentDoc.exists()) {
      return {
        success: false,
        error: 'Apartment not found',
      };
    }

    const apartmentData = apartmentDoc.data();
    const residentIds = apartmentData.residents || [];
    const residentsList: Resident[] = [];

    // Fetch all residents for this apartment
    for (const residentId of residentIds) {
      const residentDocRef = doc(firestore, 'residents', residentId);
      const residentDoc = await getDoc(residentDocRef);
      
      if (residentDoc.exists()) {
        const residentData = residentDoc.data();
        residentsList.push({
          id: residentId,
          name: residentData.name || '',
          monthlyFee: residentData.monthlyFee || 0,
          remainingAmount: residentData.remainingAmount || 0,
          isSyndic: residentData.isSyndic || false,
          isLinkedWithUser: residentData.isLinkedWithUser || false,
          linkedUserId: residentData.linkedUserId || null,
        });
      }
    }

    // Sort residents: syndic first, then others
    residentsList.sort((a, b) => {
      if (a.isSyndic && !b.isSyndic) return -1;
      if (!a.isSyndic && b.isSyndic) return 1;
      return 0;
    });

    return {
      success: true,
      error: null,
      apartment: {
        id: apartmentId,
        name: apartmentData.name || '',
        joinCode: apartmentData.joinCode || '',
        numberOfResidents: apartmentData.numberOfResidents || 0,
        residents: residentsList,
      },
    };
  } catch (error: any) {
    console.log('Error fetching apartment data:', error);
    return {
      success: false,
      error: 'An error occurred, please try again',
    };
  }
}
