import { auth, firestore } from '@/config/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';

export type ExpenseType = 'electricity' | 'water' | 'elevator' | 'security' | 'clean' | 'other';

export interface Expense {
  id: string;
  type: ExpenseType;
  amount: number;
  date: string; // "DD/MM/YYYY"
  description?: string; // Optional description
  createdAt: string; // ISO timestamp
  createdBy: string; // userId
}

/**
 * Add an expense to an apartment
 */
export async function addExpense(
  apartmentId: string,
  type: ExpenseType,
  amount: number,
  date: string, // "DD/MM/YYYY"
  description?: string
): Promise<{
  success: boolean;
  error: string | null;
  expenseId?: string;
}> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    // Generate expense ID
    const expenseId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Build expense object, only include description if it has a value
    const expense: Expense = {
      id: expenseId,
      type,
      amount,
      date: date,
      createdAt: new Date().toISOString(),
      createdBy: user.uid,
      ...(description?.trim() && { description: description.trim() }),
    };

    // Get or create expenses document for this apartment
    const expensesDocRef = doc(firestore, 'expenses', apartmentId);
    const expensesDoc = await getDoc(expensesDocRef);

    if (expensesDoc.exists()) {
      // Document exists, add expense to the array
      await updateDoc(expensesDocRef, {
        expenses: arrayUnion(expense),
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Document doesn't exist, create it
      await setDoc(expensesDocRef, {
        expenses: [expense],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return {
      success: true,
      error: null,
      expenseId: expenseId,
    };
  } catch (error: any) {
    console.log('Error adding expense:', error);
    return {
      success: false,
      error: 'An error occurred, please try again',
    };
  }
}

/**
 * Get all expenses for an apartment
 */
export async function getApartmentExpenses(apartmentId: string): Promise<{
  success: boolean;
  error: string | null;
  expenses?: Expense[];
}> {
  try {
    const expensesDocRef = doc(firestore, 'expenses', apartmentId);
    const expensesDoc = await getDoc(expensesDocRef);

    if (!expensesDoc.exists()) {
      return {
        success: true,
        error: null,
        expenses: [],
      };
    }

    const data = expensesDoc.data();
    const expenses: Expense[] = data.expenses || [];

    return {
      success: true,
      error: null,
      expenses: expenses,
    };
  } catch (error: any) {
    console.log('Error fetching expenses:', error);
    return {
      success: false,
      error: 'An error occurred, please try again',
    };
  }
}

