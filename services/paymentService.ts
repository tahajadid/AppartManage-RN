import { auth, firestore } from '@/config/firebase';
import { Bill, Operation } from '@/data/types';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

/**
 * Get current month in "MM-YYYY" format
 */
export function getCurrentMonth(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${month}-${year}`;
}

/**
 * Get current date in "DD-MM-YYYY" format
 */
export function getCurrentDate(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Create monthly payment bills for all residents
 */
export async function createMonthlyBills(
  apartmentId: string,
  residents: Array<{ id: string; monthlyFee: number }>,
  syndicId: string
): Promise<{
  success: boolean;
  error: string | null;
  billsCreated?: number;
}> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    const currentMonth = getCurrentMonth();
    const currentDate = getCurrentDate();

    // Get or create payments document for this apartment
    const paymentsDocRef = doc(firestore, 'payments', apartmentId);
    const paymentsDoc = await getDoc(paymentsDocRef);

    let existingBills: Bill[] = [];
    if (paymentsDoc.exists()) {
      const data = paymentsDoc.data();
      existingBills = data.bills || [];
    }

    // Check if bills for current month already exist
    const billsForCurrentMonth = existingBills.filter(
      (bill) => bill.date === currentMonth
    );

    if (billsForCurrentMonth.length > 0) {
      return {
        success: false,
        error: 'Bills for this month already exist',
      };
    }

    // Create bills for all residents
    const newBills: Bill[] = residents.map((resident) => {
      const initialOperation: Operation = {
        date: currentDate,
        operation: 'creation',
      };

      return {
        ownerOfBill: resident.id,
        responsible: syndicId,
        status: 'unpaid',
        amount: resident.monthlyFee,
        date: currentMonth,
        listOfOperation: [initialOperation],
      };
    });

    // Merge with existing bills
    const allBills = [...existingBills, ...newBills];

    // Save to Firestore
    if (paymentsDoc.exists()) {
      await updateDoc(paymentsDocRef, {
        bills: allBills,
      });
    } else {
      await setDoc(paymentsDocRef, {
        bills: allBills,
      });
    }

    return {
      success: true,
      error: null,
      billsCreated: newBills.length,
    };
  } catch (error: any) {
    console.log('Error creating monthly bills:', error);
    return {
      success: false,
      error: 'An error occurred, please try again',
    };
  }
}

/**
 * Request payment for a specific bill
 */
export async function requestPayment(
  apartmentId: string,
  residentId: string,
  billDate: string
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

    const currentDate = getCurrentDate();
    const paymentsDocRef = doc(firestore, 'payments', apartmentId);
    const paymentsDoc = await getDoc(paymentsDocRef);

    if (!paymentsDoc.exists()) {
      return {
        success: false,
        error: 'Payment document not found',
      };
    }

    const data = paymentsDoc.data();
    const bills: Bill[] = data.bills || [];

    // Find the bill
    const billIndex = bills.findIndex(
      (bill) => bill.ownerOfBill === residentId && bill.date === billDate
    );

    if (billIndex === -1) {
      return {
        success: false,
        error: 'Bill not found',
      };
    }

    // Update bill status and add operation
    const updatedBill: Bill = {
      ...bills[billIndex],
      status: 'pending',
      listOfOperation: [
        ...bills[billIndex].listOfOperation,
        {
          date: currentDate,
          operation: 'request_payment',
        },
      ],
    };

    bills[billIndex] = updatedBill;

    await updateDoc(paymentsDocRef, {
      bills: bills,
    });

    return {
      success: true,
      error: null,
    };
  } catch (error: any) {
    console.log('Error requesting payment:', error);
    return {
      success: false,
      error: 'An error occurred, please try again',
    };
  }
}

/**
 * Get all bills for an apartment
 */
export async function getApartmentBills(apartmentId: string): Promise<{
  success: boolean;
  error: string | null;
  bills?: Bill[];
}> {
  try {
    const paymentsDocRef = doc(firestore, 'payments', apartmentId);
    const paymentsDoc = await getDoc(paymentsDocRef);

    if (!paymentsDoc.exists()) {
      return {
        success: true,
        error: null,
        bills: [],
      };
    }

    const data = paymentsDoc.data();
    const bills: Bill[] = data.bills || [];

    return {
      success: true,
      error: null,
      bills: bills,
    };
  } catch (error: any) {
    console.log('Error fetching apartment bills:', error);
    return {
      success: false,
      error: 'An error occurred, please try again',
    };
  }
}

/**
 * Update bill status
 */
export async function updateBillStatus(
  apartmentId: string,
  residentId: string,
  billDate: string,
  newStatus: 'unpaid' | 'pending' | 'paid'
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

    const currentDate = getCurrentDate();
    const paymentsDocRef = doc(firestore, 'payments', apartmentId);
    const paymentsDoc = await getDoc(paymentsDocRef);

    if (!paymentsDoc.exists()) {
      return {
        success: false,
        error: 'Payment document not found',
      };
    }

    const data = paymentsDoc.data();
    const bills: Bill[] = data.bills || [];

    // Find the bill
    const billIndex = bills.findIndex(
      (bill) => bill.ownerOfBill === residentId && bill.date === billDate
    );

    if (billIndex === -1) {
      return {
        success: false,
        error: 'Bill not found',
      };
    }

    // Determine operation type based on status
    let operationType: Operation['operation'] = 'creation';
    if (newStatus === 'pending') {
      operationType = 'request_payment';
    } else if (newStatus === 'paid') {
      operationType = 'payment_done';
    } else if (newStatus === 'unpaid') {
      operationType = 'payment_rejected';
    }

    // Get the bill amount before updating
    const billAmount = bills[billIndex].amount;
    const oldStatus = bills[billIndex].status;

    // Update bill status and add operation
    const updatedBill: Bill = {
      ...bills[billIndex],
      status: newStatus,
      listOfOperation: [
        ...bills[billIndex].listOfOperation,
        {
          date: currentDate,
          operation: operationType,
        },
      ],
    };

    bills[billIndex] = updatedBill;

    // Update apartment balance if status changed to "paid"
    if (newStatus === 'paid' && oldStatus !== 'paid') {
      // Get apartment document
      const apartmentDocRef = doc(firestore, 'apartments', apartmentId);
      const apartmentDoc = await getDoc(apartmentDocRef);
      
      if (apartmentDoc.exists()) {
        const apartmentData = apartmentDoc.data();
        const currentBalance = apartmentData.actualBalance || 0;
        const newBalance = currentBalance + billAmount;
        
        await updateDoc(apartmentDocRef, {
          actualBalance: newBalance,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    await updateDoc(paymentsDocRef, {
      bills: bills,
    });

    return {
      success: true,
      error: null,
    };
  } catch (error: any) {
    console.log('Error updating bill status:', error);
    return {
      success: false,
      error: 'An error occurred, please try again',
    };
  }
}


export { Bill };
