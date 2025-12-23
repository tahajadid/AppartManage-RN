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

/**
 * Update an expense in an apartment
 */
export async function updateExpense(
  apartmentId: string,
  expenseId: string,
  updates: {
    type?: ExpenseType;
    amount?: number;
    date?: string; // "DD/MM/YYYY"
    description?: string;
  }
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

    // Get expenses document
    const expensesDocRef = doc(firestore, 'expenses', apartmentId);
    const expensesDoc = await getDoc(expensesDocRef);

    if (!expensesDoc.exists()) {
      return {
        success: false,
        error: 'Expenses document not found',
      };
    }

    const data = expensesDoc.data();
    const expenses: Expense[] = data.expenses || [];

    // Find the expense to update
    const expenseIndex = expenses.findIndex((exp) => exp.id === expenseId);

    if (expenseIndex === -1) {
      return {
        success: false,
        error: 'Expense not found',
      };
    }

    // Update the expense
    const updatedExpense: Expense = {
      ...expenses[expenseIndex],
      ...(updates.type && { type: updates.type }),
      ...(updates.amount !== undefined && { amount: updates.amount }),
      ...(updates.date && { date: updates.date }),
      ...(updates.description !== undefined && {
        ...(updates.description?.trim() ? { description: updates.description.trim() } : {}),
      }),
    };

    // Remove description if it's empty string
    if (updates.description === '') {
      delete updatedExpense.description;
    }

    expenses[expenseIndex] = updatedExpense;

    // Update the document
    await updateDoc(expensesDocRef, {
      expenses: expenses,
      updatedAt: new Date().toISOString(),
    });

    return {
      success: true,
      error: null,
    };
  } catch (error: any) {
    console.log('Error updating expense:', error);
    return {
      success: false,
      error: 'An error occurred, please try again',
    };
  }
}

/**
 * Delete an expense from an apartment
 */
export async function deleteExpense(
  apartmentId: string,
  expenseId: string
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

    // Get expenses document
    const expensesDocRef = doc(firestore, 'expenses', apartmentId);
    const expensesDoc = await getDoc(expensesDocRef);

    if (!expensesDoc.exists()) {
      return {
        success: false,
        error: 'Expenses document not found',
      };
    }

    const data = expensesDoc.data();
    const expenses: Expense[] = data.expenses || [];

    // Find the expense to delete
    const expenseToDelete = expenses.find((exp) => exp.id === expenseId);

    if (!expenseToDelete) {
      return {
        success: false,
        error: 'Expense not found',
      };
    }

    // Remove the expense from the array
    const updatedExpenses = expenses.filter((exp) => exp.id !== expenseId);

    // Update the document
    await updateDoc(expensesDocRef, {
      expenses: updatedExpenses,
      updatedAt: new Date().toISOString(),
    });

    return {
      success: true,
      error: null,
    };
  } catch (error: any) {
    console.log('Error deleting expense:', error);
    return {
      success: false,
      error: 'An error occurred, please try again',
    };
  }
}

