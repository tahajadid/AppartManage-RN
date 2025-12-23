import { auth, firestore } from '@/config/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';

export type IssueType = 'plumbing' | 'electrical' | 'heating' | 'elevator' | 'security' | 'cleaning' | 'other';

export interface Issue {
  id: string;
  apartmentId: string;
  type: IssueType;
  description: string;
  nameOfReported: string; // Name of the person who reported the issue
  images?: string[]; // Array of image URLs (will be populated after image upload implementation)
  status: 'open' | 'closed';
  reportedBy: string; // userId
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

/**
 * Create a new issue for an apartment
 */
export async function createIssue(
  apartmentId: string,
  type: IssueType,
  description: string,
  nameOfReported: string,
  images?: string[] // Will be empty array for now, populated later after image upload
): Promise<{
  success: boolean;
  error: string | null;
  issueId?: string;
}> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    // Generate issue ID
    const issueId = `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Build issue object
    const issue: Issue = {
      id: issueId,
      apartmentId,
      type,
      description: description.trim(),
      nameOfReported: nameOfReported.trim(),
      images: images || [],
      status: 'open',
      reportedBy: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Get or create issues document for this apartment
    const issuesDocRef = doc(firestore, 'issues', apartmentId);
    const issuesDoc = await getDoc(issuesDocRef);

    if (issuesDoc.exists()) {
      // Document exists, add issue to the array
      await updateDoc(issuesDocRef, {
        issues: arrayUnion(issue),
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Document doesn't exist, create it
      await setDoc(issuesDocRef, {
        issues: [issue],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return {
      success: true,
      error: null,
      issueId: issueId,
    };
  } catch (error: any) {
    console.log('Error creating issue:', error);
    return {
      success: false,
      error: 'An error occurred, please try again',
    };
  }
}

/**
 * Get all issues for an apartment
 */
export async function getApartmentIssues(apartmentId: string): Promise<{
  success: boolean;
  error: string | null;
  issues?: Issue[];
}> {
  try {
    const issuesDocRef = doc(firestore, 'issues', apartmentId);
    const issuesDoc = await getDoc(issuesDocRef);

    if (!issuesDoc.exists()) {
      return {
        success: true,
        error: null,
        issues: [],
      };
    }

    const data = issuesDoc.data();
    const issues: Issue[] = data.issues || [];

    return {
      success: true,
      error: null,
      issues: issues,
    };
  } catch (error: any) {
    console.log('Error fetching issues:', error);
    return {
      success: false,
      error: 'An error occurred, please try again',
    };
  }
}

