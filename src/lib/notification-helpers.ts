#!/usr/bin/env tsx

// This is a helper utility to create notifications from anywhere in the app
// Import this file in any server action or API route to create notifications

import { createUserNotification, NotificationTemplates } from '@/lib/notifications';

// Example: Creating a notification when a member makes a contribution
export async function notifyContributionReceived(memberId: string) {
  await createUserNotification({
    memberId,
    type: 'CONTRIBUTION',
    title: 'Contribution Received',
    message: 'Your contribution has been received and is pending verification.',
    icon: '💰',
  });
}

// Example: Creating a notification when a contribution is verified
export async function notifyContributionVerified(memberId: string) {
  await createUserNotification({
    memberId,
    type: 'SUCCESS',
    title: 'Contribution Verified',
    message: 'Your contribution has been verified successfully.',
    icon: '✅',
  });
}

// Example: Creating a notification for welfare case approval
export async function notifyWelfareCaseApproved(memberId: string) {
  await createUserNotification({
    memberId,
    type: 'WELFARE',
    title: 'Welfare Case Approved',
    message: 'Your welfare case has been approved and will be processed.',
    icon: '❤️',
    link: '/member-dashboard/welfare',
  });
}

// Example: Creating a notification when member is approved
export async function notifyMemberApproved(memberId: string) {
  await createUserNotification({
    memberId,
    type: 'SUCCESS',
    title: 'Membership Approved',
    message: 'Your membership has been approved. Welcome to the SACCO!',
    icon: '🎉',
    link: '/member-dashboard',
  });
}

// Example: Creating a notification when member is rejected
export async function notifyMemberRejected(memberId: string, reason?: string) {
  await createUserNotification({
    memberId,
    type: 'WARNING',
    title: 'Membership Application Rejected',
    message: reason || 'Your membership application has been rejected. Please contact the SACCO office for more information.',
    icon: '❌',
  });
}

// Payment reminder notifications
export async function notifyUpcomingPayment(memberId: string, dueDate: Date) {
  const formattedDate = dueDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  await createUserNotification({
    memberId,
    type: 'WARNING',
    title: 'Payment Due Notice',
    message: `Your monthly contribution payment is due on ${formattedDate}. Please ensure timely payment to avoid any penalties.`,
    icon: '💰',
    link: '/member-dashboard/contributions',
  });
}

export async function notifyOverduePayment(memberId: string, dueDate: Date) {
  const formattedDate = dueDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  await createUserNotification({
    memberId,
    type: 'ERROR',
    title: 'Payment Overdue Notice',
    message: `Your monthly contribution payment for ${formattedDate} is overdue. Please make payment immediately to avoid further action.`,
    icon: '⚠️',
    link: '/member-dashboard/contributions',
  });
}

export async function notifyDefaultStatus(memberId: string, dueDate: Date) {
  const formattedDate = dueDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  await createUserNotification({
    memberId,
    type: 'ERROR',
    title: 'Member Marked as Default',
    message: `You have been marked as in default for failing to pay the contribution due on ${formattedDate}. Please contact the SACCO office immediately.`,
    icon: '❌',
    link: '/member-dashboard/contributions',
  });
}

// Example: Creating a system announcement for all members
import { createBulkNotifications } from '@/lib/notifications';
import { prisma } from '@/lib/db';

export async function notifyAllMembers(
  type: 'INFO' | 'WARNING' | 'ERROR',
  title: string,
  message: string
) {
  // Get all active members
  const members = await prisma.member.findMany({
    where: { memberStatus: 'ACTIVE' },
    select: { id: true },
  });

  // Create notifications for all members
  await createBulkNotifications(
    members.map((m) => m.id),
    {
      type,
      title,
      message,
      icon: type === 'INFO' ? 'ℹ️' : type === 'WARNING' ? '⚠️' : '❌',
    }
  );
}

// Example usage in API routes:
// import { notifyContributionReceived } from '@/lib/notification-helpers';
// await notifyContributionReceived(memberId);
