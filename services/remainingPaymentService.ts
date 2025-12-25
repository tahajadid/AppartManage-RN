import { auth, firestore } from '@/config/firebase';
import { RemainingPayment } from '@/data/types';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// Re-export for convenience
export type { RemainingPayment };

/**
 * Create a remaining payment (by resident - starts as PENDING)
 */
export async function createRemainingPayment(
  apartmentId: string,
  residentId: string,
  residentName: string,
  amount: number
): Promise<{
  success: boolean;
  error: string | null;
  paymentId?: string;
}> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    // Validate amount
    if (amount <= 0) {
      return {
        success: false,
        error: 'Amount must be greater than 0',
      };
    }

    // Get resident data to check remaining amount
    const residentDocRef = doc(firestore, 'residents', residentId);
    const residentDoc = await getDoc(residentDocRef);

    if (!residentDoc.exists()) {
      return {
        success: false,
        error: 'Resident not found',
      };
    }

    const residentData = residentDoc.data();
    const currentRemainingAmount = residentData.remainingAmount || 0;

    if (amount > currentRemainingAmount) {
      return {
        success: false,
        error: 'Payment amount cannot exceed remaining balance',
      };
    }

    // Generate payment ID
    const paymentId = `remaining_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Build remaining payment object
    const remainingPayment: RemainingPayment = {
      id: paymentId,
      apartmentId,
      residentId,
      residentName: residentName.trim(),
      amount,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user.uid,
    };

    // Get or create payments document for this apartment
    const paymentsDocRef = doc(firestore, 'payments', apartmentId);
    const paymentsDoc = await getDoc(paymentsDocRef);

    let existingBills: any[] = [];
    let existingRemainingPayments: RemainingPayment[] = [];

    if (paymentsDoc.exists()) {
      const data = paymentsDoc.data();
      existingBills = data.bills || [];
      existingRemainingPayments = data.remainingPayments || [];
    }

    // Add new remaining payment to the array
    const updatedRemainingPayments = [...existingRemainingPayments, remainingPayment];

    // Update payments document with both bills and remainingPayments
    if (paymentsDoc.exists()) {
      await updateDoc(paymentsDocRef, {
        bills: existingBills,
        remainingPayments: updatedRemainingPayments,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await setDoc(paymentsDocRef, {
        bills: [],
        remainingPayments: [remainingPayment],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Reduce resident's remaining amount (even though payment is pending)
    const newRemainingAmount = currentRemainingAmount - amount;
    await updateDoc(residentDocRef, {
      remainingAmount: newRemainingAmount,
      updatedAt: new Date().toISOString(),
    });

    return {
      success: true,
      error: null,
      paymentId: paymentId,
    };
  } catch (error: any) {
    console.log('Error creating remaining payment:', error);
    return {
      success: false,
      error: 'An error occurred, please try again',
    };
  }
}

/**
 * Create a remaining payment by syndic (automatically PAID)
 */
export async function createRemainingPaymentBySyndic(
  apartmentId: string,
  residentId: string,
  residentName: string,
  amount: number
): Promise<{
  success: boolean;
  error: string | null;
  paymentId?: string;
}> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    // Validate amount
    if (amount <= 0) {
      return {
        success: false,
        error: 'Amount must be greater than 0',
      };
    }

    // Get resident data to check remaining amount
    const residentDocRef = doc(firestore, 'residents', residentId);
    const residentDoc = await getDoc(residentDocRef);

    if (!residentDoc.exists()) {
      return {
        success: false,
        error: 'Resident not found',
      };
    }

    const residentData = residentDoc.data();
    const currentRemainingAmount = residentData.remainingAmount || 0;

    if (amount > currentRemainingAmount) {
      return {
        success: false,
        error: 'Payment amount cannot exceed remaining balance',
      };
    }

    // Generate payment ID
    const paymentId = `remaining_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const paidAt = new Date().toISOString();

    // Build remaining payment object (automatically PAID)
    const remainingPayment: RemainingPayment = {
      id: paymentId,
      apartmentId,
      residentId,
      residentName: residentName.trim(),
      amount,
      status: 'paid',
      createdAt: paidAt,
      updatedAt: paidAt,
      createdBy: user.uid,
      paidAt: paidAt,
    };

    // Get or create payments document for this apartment
    const paymentsDocRef = doc(firestore, 'payments', apartmentId);
    const paymentsDoc = await getDoc(paymentsDocRef);

    let existingBills: any[] = [];
    let existingRemainingPayments: RemainingPayment[] = [];

    if (paymentsDoc.exists()) {
      const data = paymentsDoc.data();
      existingBills = data.bills || [];
      existingRemainingPayments = data.remainingPayments || [];
    }

    // Add new remaining payment to the array
    const updatedRemainingPayments = [...existingRemainingPayments, remainingPayment];

    // Update payments document with both bills and remainingPayments
    if (paymentsDoc.exists()) {
      await updateDoc(paymentsDocRef, {
        bills: existingBills,
        remainingPayments: updatedRemainingPayments,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await setDoc(paymentsDocRef, {
        bills: [],
        remainingPayments: [remainingPayment],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Reduce resident's remaining amount
    const newRemainingAmount = currentRemainingAmount - amount;
    await updateDoc(residentDocRef, {
      remainingAmount: newRemainingAmount,
      updatedAt: new Date().toISOString(),
    });

    // Update apartment balance (add the paid amount)
    const apartmentDocRef = doc(firestore, 'apartments', apartmentId);
    const apartmentDoc = await getDoc(apartmentDocRef);

    if (apartmentDoc.exists()) {
      const apartmentData = apartmentDoc.data();
      const currentBalance = apartmentData.actualBalance || 0;
      const newBalance = currentBalance + amount;

      await updateDoc(apartmentDocRef, {
        actualBalance: newBalance,
        updatedAt: new Date().toISOString(),
      });
    }

    return {
      success: true,
      error: null,
      paymentId: paymentId,
    };
  } catch (error: any) {
    console.log('Error creating remaining payment by syndic:', error);
    return {
      success: false,
      error: 'An error occurred, please try again',
    };
  }
}

/**
 * Validate a remaining payment (change status from PENDING to PAID)
 */
export async function validateRemainingPayment(
  apartmentId: string,
  paymentId: string
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

    const paymentsDocRef = doc(firestore, 'payments', apartmentId);
    const paymentsDoc = await getDoc(paymentsDocRef);

    if (!paymentsDoc.exists()) {
      return {
        success: false,
        error: 'Payments document not found',
      };
    }

    const data = paymentsDoc.data();
    const existingBills = data.bills || [];
    const remainingPayments: RemainingPayment[] = data.remainingPayments || [];

    // Find the payment
    const paymentIndex = remainingPayments.findIndex((p) => p.id === paymentId);

    if (paymentIndex === -1) {
      return {
        success: false,
        error: 'Payment not found',
      };
    }

    const payment = remainingPayments[paymentIndex];

    if (payment.status === 'paid') {
      return {
        success: false,
        error: 'Payment is already paid',
      };
    }

    // Update payment status to PAID
    const paidAt = new Date().toISOString();
    const updatedPayment: RemainingPayment = {
      ...payment,
      status: 'paid',
      updatedAt: paidAt,
      paidAt: paidAt,
    };

    remainingPayments[paymentIndex] = updatedPayment;

    // Update payments document with both bills and remainingPayments
    await updateDoc(paymentsDocRef, {
      bills: existingBills,
      remainingPayments: remainingPayments,
      updatedAt: new Date().toISOString(),
    });

    // Update apartment balance (add the paid amount)
    const apartmentDocRef = doc(firestore, 'apartments', apartmentId);
    const apartmentDoc = await getDoc(apartmentDocRef);

    if (apartmentDoc.exists()) {
      const apartmentData = apartmentDoc.data();
      const currentBalance = apartmentData.actualBalance || 0;
      const newBalance = currentBalance + payment.amount;

      await updateDoc(apartmentDocRef, {
        actualBalance: newBalance,
        updatedAt: new Date().toISOString(),
      });
    }

    return {
      success: true,
      error: null,
    };
  } catch (error: any) {
    console.log('Error validating remaining payment:', error);
    return {
      success: false,
      error: 'An error occurred, please try again',
    };
  }
}

/**
 * Get all remaining payments for an apartment
 */
export async function getApartmentRemainingPayments(apartmentId: string): Promise<{
  success: boolean;
  error: string | null;
  payments?: RemainingPayment[];
}> {
  try {
    const paymentsDocRef = doc(firestore, 'payments', apartmentId);
    const paymentsDoc = await getDoc(paymentsDocRef);

    if (!paymentsDoc.exists()) {
      return {
        success: true,
        error: null,
        payments: [],
      };
    }

    const data = paymentsDoc.data();
    const payments: RemainingPayment[] = data.remainingPayments || [];

    return {
      success: true,
      error: null,
      payments: payments,
    };
  } catch (error: any) {
    console.log('Error fetching remaining payments:', error);
    return {
      success: false,
      error: 'An error occurred, please try again',
    };
  }
}

/**
 * Get remaining payments for a specific resident
 */
export async function getResidentRemainingPayments(
  apartmentId: string,
  residentId: string
): Promise<{
  success: boolean;
  error: string | null;
  payments?: RemainingPayment[];
}> {
  try {
    const result = await getApartmentRemainingPayments(apartmentId);

    if (!result.success || !result.payments) {
      return result;
    }

    // Filter payments for this resident
    const residentPayments = result.payments.filter((p) => p.residentId === residentId);

    return {
      success: true,
      error: null,
      payments: residentPayments,
    };
  } catch (error: any) {
    console.log('Error fetching resident remaining payments:', error);
    return {
      success: false,
      error: 'An error occurred, please try again',
    };
  }
}

