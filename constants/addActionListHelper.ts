import { ActionOption } from '@/data/types';
import {
  Calendar,
  CreditCard,
  Receipt,
  WarningCircle
} from 'phosphor-react-native';

/**
 * Get action options for resident role
 */
export const getResidentActionOptions = (
  t: (key: string) => string,
  colors: { green: string; rose: string }
): ActionOption[] => {
  return [
    {
      id: 'add-payment',
      icon: CreditCard,
      title: t('addPayment') || 'Add Payment',
      subtitle: t('addPaymentDescription') || 'Record a payment you made',
      route: '/(home)/payments/add-payment',
      iconColor: colors.green,
    },
    {
      id: 'add-issue',
      icon: WarningCircle,
      title: t('addIssue') || 'Report Issue',
      subtitle: t('addIssueDescription') || 'Report an apartment issue or problem',
      route: '/ui/addAction/issues/add-issue',
      iconColor: colors.rose,
    },
  ];
};

/**
 * Get action options for syndic role
 */
export const getSyndicActionOptions = (
  t: (key: string) => string,
  colors: { green: string; rose: string; primary: string; brightOrange: string }
): ActionOption[] => {
  return [
    {
      id: 'add-payment',
      icon: CreditCard,
      title: t('addPaymentForResident') || 'Add Payment for Resident',
      subtitle: t('addPaymentForResidentDescription') || 'Record a payment made by a resident',
      route: '/(home)/payments/add-payment',
      iconColor: colors.green,
    },
    {
      id: 'add-expense',
      icon: Receipt,
      title: t('addExpense') || 'Add Expense',
      subtitle: t('addExpenseDescription') || 'Record a new apartment expense',
      route: '/ui/addAction/expenses/add-expense',
      iconColor: colors.rose,
    },
    {
      id: 'add-meeting',
      icon: Calendar,
      title: t('addMeeting') || 'Add Meeting',
      subtitle: t('addMeetingDescription') || 'Schedule a meeting for all residents',
      route: '/ui/addAction/meetings/add-meeting',
      iconColor: colors.primary,
    },
    {
      id: 'add-issue',
      icon: WarningCircle,
      title: t('addIssue') || 'Report Issue',
      subtitle: t('addIssueDescription') || 'Report an apartment issue or problem',
      route: '/ui/addAction/issues/add-issue',
      iconColor: colors.brightOrange,
    }
  ];
};

