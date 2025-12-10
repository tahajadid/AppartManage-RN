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
 * Generate a unique join code for an apartment (8 digits)
 */
function generateJoinCode(): string {
  // Generate an 8-digit numeric code
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += Math.floor(Math.random() * 10).toString();
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
          // For syndic-resident, the first resident is the syndic themselves
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
      // Resident: Find apartment by join code
      // Validate join code format (6 alphanumeric characters)
      const joinCodeRegex = /^[0-9]{8}$/;
      if (!joinCodeRegex.test(data.joinCode)) {
        return {
          success: false,
          error: 'Invalid join code format',
        };
      }

      // Query Firestore to find apartment with this join code
      const apartmentsRef = collection(firestore, 'apartments');
      const q = query(apartmentsRef, where('joinCode', '==', data.joinCode.toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return {
          success: false,
          error: 'Invalid join code. Please check and try again',
        };
      }

      // Get the first matching apartment
      const apartmentDoc = querySnapshot.docs[0];
      const apartmentData = apartmentDoc.data();
      const apartmentId = apartmentDoc.id;

      // Add user to residents array if not already present
      const residents = apartmentData.residents || [];
      if (!residents.includes(user.uid)) {
        residents.push(user.uid);
        await updateDoc(doc(firestore, 'apartments', apartmentId), {
          residents: residents,
          updatedAt: new Date().toISOString(),
        });
      }

      // Update user document with role and apartment info
      await updateDoc(userDocRef, {
        role: 'resident',
        apartmentId: apartmentId,
        onboardingCompleted: true,
        updatedAt: new Date().toISOString(),
      });

      return {
        success: true,
        error: null,
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

