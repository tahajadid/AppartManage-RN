import { auth, firestore } from '@/config/firebase';
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';

export type UserRole = 'syndic' | 'syndic_resident' | 'resident';

export interface ResidentInfo {
  name: string;
  monthlyFee: number;
  remainingAmount: number;
  isSyndic?: boolean;
}

export interface SyndicOnboardingData {
  role: 'syndic' | 'syndic_resident';
  apartmentName: string;
  numberOfResidents: number;
  residents?: ResidentInfo[];
}

export interface ResidentOnboardingData {
  role: 'resident';
  joinCode: string;
}

export type OnboardingData = SyndicOnboardingData | ResidentOnboardingData;

export interface OnboardingResult {
  success: boolean;
  error: string | null;
  joinCode?: string;
}

/**
 * Generate a unique join code for an apartment (8 alphanumeric characters)
 */
function generateJoinCode(): string {
  // Generate an 8-character alphanumeric code (mixed letters and numbers)
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

/**
 * Complete onboarding for a user
 * Saves role and apartment data to Firestore
 */
export async function completeOnboarding(data: OnboardingData): Promise<OnboardingResult> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    const userDocRef = doc(firestore, 'users', user.uid);
    
    if (data.role === 'syndic' || data.role === 'syndic_resident') {
      // Generate a unique join code for the apartment
      const joinCode = generateJoinCode();
      
      // Create apartment document
      const apartmentId = `apartment_${Date.now()}`;
      const apartmentDocRef = doc(firestore, 'apartments', apartmentId);
      
      // Prepare residents data
      const residentsList = data.residents || [];
      const residentIds: string[] = [];
      
      // Create resident documents if provided
      if (residentsList.length > 0) {
        for (const resident of residentsList) {
          // For syndic-resident role: the first resident (index 0) is the syndic themselves
          // This resident is automatically linked to the syndic user account
          if (resident.isSyndic) {
            // Create resident document for the syndic (they are also a resident)
            const syndicResidentId = user.uid; // Use user.uid as the resident ID for syndic
            const syndicResidentDocRef = doc(firestore, 'residents', syndicResidentId);
            await setDoc(syndicResidentDocRef, {
              id: syndicResidentId,
              apartmentId: apartmentId,
              name: resident.name,
              monthlyFee: resident.monthlyFee,
              remainingAmount: resident.remainingAmount,
              isSyndic: true,
              userId: user.uid, // Link to the user account
              isLinkedWithUser: true, // AUTO-LINKED: Syndic-resident is automatically linked to their user account
              linkedUserId: user.uid, // AUTO-LINKED: Link to the syndic user (same as userId)
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
            residentIds.push(syndicResidentId);
            
            // Also update user document with resident info
            await updateDoc(userDocRef, {
              name: resident.name,
              monthlyFee: resident.monthlyFee,
            });
          } else {
            // Create resident document for other residents
            const residentId = `resident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const residentDocRef = doc(firestore, 'residents', residentId);
            await setDoc(residentDocRef, {
              id: residentId,
              apartmentId: apartmentId,
              name: resident.name,
              monthlyFee: resident.monthlyFee,
              remainingAmount: resident.remainingAmount,
              isSyndic: false,
              isLinkedWithUser: false, // Not linked yet
              linkedUserId: null, // No user linked yet
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
            residentIds.push(residentId);
          }
        }
      } else {
        // If no residents list provided, still add syndic as a resident
        // This handles the case when role is just 'syndic' (not 'syndic_resident')
        residentIds.push(user.uid);
      }
      
      await setDoc(apartmentDocRef, {
        id: apartmentId,
        name: data.apartmentName,
        numberOfResidents: data.numberOfResidents,
        joinCode: joinCode,
        syndicId: user.uid,
        residents: residentIds,
        residentsData: residentsList,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Update user document with role and apartment info
      await updateDoc(userDocRef, {
        role: data.role,
        apartmentId: apartmentId,
        onboardingCompleted: true,
        updatedAt: new Date().toISOString(),
      });

      return {
        success: true,
        error: null,
        joinCode: joinCode,
      };
    } else {
      // Resident: This function should not be called directly for residents
      // Residents should use linkResidentToUser instead after selecting their identity
      return {
        success: false,
        error: 'Please select your identity from the residents list',
      };
    }
  } catch (error: any) {
    console.log('Onboarding completion error:', error);
    return {
      success: false,
      error: 'An error occurred, please try again',
    };
  }
}

/**
 * Fetch apartment by join code with residents list
 */
export async function getApartmentByJoinCode(joinCode: string): Promise<{
  success: boolean;
  error: string | null;
  apartment?: {
    id: string;
    name: string;
    joinCode: string;
    numberOfResidents: number;
    residents: Array<{
      id: string;
      name: string;
      monthlyFee: number;
      remainingAmount: number;
      isLinkedWithUser: boolean;
      linkedUserId: string | null;
      isSyndic?: boolean;
    }>;
  };
}> {
  try {
    // Validate join code format (8 alphanumeric characters)
    const joinCodeRegex = /^[A-Z0-9]{8}$/;
    if (!joinCodeRegex.test(joinCode.toUpperCase())) {
      return {
        success: false,
        error: 'Invalid join code format',
        apartment: undefined,
      };
    }

    // Query Firestore to find apartment with this join code
    const apartmentsRef = collection(firestore, 'apartments');
    const q = query(apartmentsRef, where('joinCode', '==', joinCode.toUpperCase()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return {
        success: false,
        error: 'Invalid join code. Please check and try again',
        apartment: undefined,
      };
    }

    // Get the first matching apartment
    const apartmentDoc = querySnapshot.docs[0];
    const apartmentData = apartmentDoc.data();
    const apartmentId = apartmentDoc.id;

    // Fetch all residents for this apartment
    const residentIds = apartmentData.residents || [];
    const residentsList = [];

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
          isLinkedWithUser: residentData.isLinkedWithUser || false,
          linkedUserId: residentData.linkedUserId || null,
          isSyndic: residentData.isSyndic || false,
        });
      }
    }

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
    console.log('Error fetching apartment:', error);
    return {
      success: false,
      error: 'An error occurred, please try again',
      apartment: undefined,
    };
  }
}

/**
 * Link a resident to the current user
 */
export async function linkResidentToUser(residentId: string, apartmentId: string): Promise<OnboardingResult> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    // Get resident document
    const residentDocRef = doc(firestore, 'residents', residentId);
    const residentDoc = await getDoc(residentDocRef);

    if (!residentDoc.exists()) {
      return {
        success: false,
        error: 'Resident not found',
      };
    }

    const residentData = residentDoc.data();

    // Check if resident is already linked
    if (residentData.isLinkedWithUser === true) {
      return {
        success: false,
        error: 'This resident is already linked to another user',
      };
    }

    // Check if resident belongs to the apartment
    if (residentData.apartmentId !== apartmentId) {
      return {
        success: false,
        error: 'Resident does not belong to this apartment',
      };
    }

    // Link resident to user
    await updateDoc(residentDocRef, {
      isLinkedWithUser: true,
      linkedUserId: user.uid,
      userId: user.uid,
      updatedAt: new Date().toISOString(),
    });

    // Update user document with role and apartment info
    const userDocRef = doc(firestore, 'users', user.uid);
    await updateDoc(userDocRef, {
      role: 'resident',
      apartmentId: apartmentId,
      name: residentData.name,
      monthlyFee: residentData.monthlyFee,
      onboardingCompleted: true,
      updatedAt: new Date().toISOString(),
    });

    return {
      success: true,
      error: null,
    };
  } catch (error: any) {
    console.log('Error linking resident to user:', error);
    return {
      success: false,
      error: 'An error occurred, please try again',
    };
  }
}

/**
 * Check if user has completed onboarding
 */
export async function checkOnboardingStatus(): Promise<{
  completed: boolean;
  role: UserRole | null;
  apartmentId: string | null;
}> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return {
        completed: false,
        role: null,
        apartmentId: null,
      };
    }

    const userDocRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return {
        completed: false,
        role: null,
        apartmentId: null,
      };
    }

    const userData = userDoc.data();
    return {
      completed: userData.onboardingCompleted === true,
      role: (userData.role as UserRole) || null,
      apartmentId: userData.apartmentId || null,
    };
  } catch (error: any) {
    console.log('Error checking onboarding status:', error);
    return {
      completed: false,
      role: null,
      apartmentId: null,
    };
  }
}

