import { auth, firestore } from '@/config/firebase';
import { arrayUnion, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export type MeetingType = 'general' | 'budget' | 'administrative' | 'urgent';

export interface Meeting {
  id: string;
  apartmentId: string;
  reason: string;
  place: string;
  date: string; // "DD/MM/YYYY"
  time: string; // "HH:mm"
  type?: MeetingType; // Optional for backward compatibility
  createdAt: string; // ISO timestamp
  createdBy: string; // userId
}

/**
 * Add a meeting to an apartment
 */
export async function addMeeting(
  apartmentId: string,
  reason: string,
  place: string,
  date: string, // "DD/MM/YYYY"
  time: string, // "HH:mm"
  type: MeetingType
): Promise<{
  success: boolean;
  error: string | null;
  meetingId?: string;
}> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    // Generate meeting ID
    const meetingId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Build meeting object
    const meeting: Meeting = {
      id: meetingId,
      apartmentId: apartmentId,
      reason: reason.trim(),
      place: place.trim(),
      date: date,
      time: time,
      type: type,
      createdAt: new Date().toISOString(),
      createdBy: user.uid,
    };

    // Get or create meetings document for this apartment
    const meetingsDocRef = doc(firestore, 'meetings', apartmentId);
    const meetingsDoc = await getDoc(meetingsDocRef);

    if (meetingsDoc.exists()) {
      // Document exists, add meeting to the array
      await updateDoc(meetingsDocRef, {
        meetings: arrayUnion(meeting),
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Document doesn't exist, create it
      await setDoc(meetingsDocRef, {
        meetings: [meeting],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return {
      success: true,
      error: null,
      meetingId: meetingId,
    };
  } catch (error: any) {
    console.log('Error adding meeting:', error);
    return {
      success: false,
      error: 'An error occurred, please try again',
    };
  }
}

/**
 * Get all meetings for an apartment
 */
export async function getApartmentMeetings(apartmentId: string): Promise<{
  success: boolean;
  error: string | null;
  meetings?: Meeting[];
}> {
  try {
    const meetingsDocRef = doc(firestore, 'meetings', apartmentId);
    const meetingsDoc = await getDoc(meetingsDocRef);

    if (!meetingsDoc.exists()) {
      return {
        success: true,
        error: null,
        meetings: [],
      };
    }

    const data = meetingsDoc.data();
    const meetings: Meeting[] = data.meetings || [];

    return {
      success: true,
      error: null,
      meetings: meetings,
    };
  } catch (error: any) {
    console.log('Error fetching meetings:', error);
    return {
      success: false,
      error: 'An error occurred, please try again',
    };
  }
}

/**
 * Delete a meeting from an apartment
 */
export async function deleteMeeting(
  apartmentId: string,
  meetingId: string
): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    // Get meetings document
    const meetingsDocRef = doc(firestore, 'meetings', apartmentId);
    const meetingsDoc = await getDoc(meetingsDocRef);

    if (!meetingsDoc.exists()) {
      return {
        success: false,
        error: 'Meetings document not found',
      };
    }

    const data = meetingsDoc.data();
    const meetings: Meeting[] = data.meetings || [];

    // Find the meeting to delete
    const meetingToDelete = meetings.find((meeting) => meeting.id === meetingId);

    if (!meetingToDelete) {
      return {
        success: false,
        error: 'Meeting not found',
      };
    }

    // Remove the meeting from the array
    const updatedMeetings = meetings.filter((meeting) => meeting.id !== meetingId);

    // Update the document
    await updateDoc(meetingsDocRef, {
      meetings: updatedMeetings,
      updatedAt: new Date().toISOString(),
    });

    return {
      success: true,
      error: null,
    };
  } catch (error: any) {
    console.log('Error deleting meeting:', error);
    return {
      success: false,
      error: 'An error occurred, please try again',
    };
  }
}

