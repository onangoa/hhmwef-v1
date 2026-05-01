#!/usr/bin/env tsx

// This is a helper utility to create notifications from anywhere in the app
// Import this file in any server action or API route to create notifications

import { createUserNotification, NotificationTemplates } from '@/lib/notifications';
import { sendEmailAsync } from '@/lib/email';
import { sendSms } from '@/lib/sms';

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
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { phoneNumber: true }
  });

  await createUserNotification({
    memberId,
    type: 'SUCCESS',
    title: 'Contribution Verified',
    message: 'Your contribution has been verified successfully.',
    icon: '✅',
  });

  if (member && member.phoneNumber) {
    const formattedPhone = member.phoneNumber.startsWith('0')
      ? '254' + member.phoneNumber.slice(1)
      : member.phoneNumber;

    sendSms({
      message: 'HHS Welfare: Your contribution has been verified successfully.',
      recipients: [formattedPhone],
    });
  }
}

// Example: Creating a notification for welfare case approval
export async function notifyWelfareCaseApproved(memberId: string) {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { phoneNumber: true }
  });

  await createUserNotification({
    memberId,
    type: 'WELFARE',
    title: 'Welfare Case Approved',
    message: 'Your welfare case has been approved and will be processed.',
    icon: '❤️',
    link: '/member-dashboard/welfare',
  });

  if (member && member.phoneNumber) {
    const formattedPhone = member.phoneNumber.startsWith('0')
      ? '254' + member.phoneNumber.slice(1)
      : member.phoneNumber;

    sendSms({
      message: 'HHS Welfare: Your welfare case has been approved and will be processed.',
      recipients: [formattedPhone],
    });
  }
}

// Example: Creating a notification when member is approved
export async function notifyMemberApproved(memberId: string, password?: string) {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { email: true, firstName: true, phoneNumber: true }
  });

  await createUserNotification({
    memberId,
    type: 'SUCCESS',
    title: 'Membership Approved',
    message: 'Your membership has been approved. Welcome to the HHS Welfare!',
    icon: '🎉',
    link: '/member-dashboard',
  });

  if (member && member.email && password) {
    sendEmailAsync({
      to: member.email,
      subject: 'HHS Welfare: Membership Approved',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #1d4ed8;">Membership Approved</h2>
          <p>Hello ${member.firstName},</p>
          <p>Your membership has been approved. Welcome to the HHS Welfare!</p>
          <p><strong>Login Details:</strong></p>
          <p>Email: ${member.email}<br>Password: ${password}</p>
          <p>Please log in and change your password.</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/member-dashboard" style="display: inline-block; padding: 10px 20px; background-color: #1d4ed8; color: white; text-decoration: none; border-radius: 5px;">Login Now</a></p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">This is an automated notification from HHS Welfare System.</p>
        </div>
      `
    });
  }

  if (member && member.phoneNumber) {
    const formattedPhone = member.phoneNumber.startsWith('0') 
      ? '254' + member.phoneNumber.slice(1) 
      : member.phoneNumber;

    const smsMessage = password
      ? `HHS Welfare: Your membership has been approved. Login: Email: ${member.email}, Password: ${password}. Please change your password after login.`
      : `HHS Welfare: Your membership has been approved. Welcome to the HHS Welfare!`;

    sendSms({
      message: smsMessage,
      recipients: [formattedPhone],
    });
  }
}

// Example: Creating a notification when member is rejected
export async function notifyMemberRejected(memberId: string, reason?: string) {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { phoneNumber: true }
  });

  await createUserNotification({
    memberId,
    type: 'WARNING',
    title: 'Membership Application Rejected',
    message: reason || 'Your membership application has been rejected. Please contact the SACCO office for more information.',
    icon: '❌',
  });

  if (member && member.phoneNumber) {
    const formattedPhone = member.phoneNumber.startsWith('0')
      ? '254' + member.phoneNumber.slice(1)
      : member.phoneNumber;

    sendSms({
      message: `HHS Welfare: Your membership application has been rejected. ${reason || 'Please contact the office for more information.'}`,
      recipients: [formattedPhone],
    });
  }
}

// Payment reminder notifications
export async function notifyUpcomingPayment(memberId: string, dueDate: Date) {
  const formattedDate = dueDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { phoneNumber: true }
  });

  await createUserNotification({
    memberId,
    type: 'WARNING',
    title: 'Payment Due Notice',
    message: `Your monthly contribution payment is due on ${formattedDate}. Please ensure timely payment to avoid any penalties.`,
    icon: '💰',
    link: '/member-dashboard/contributions',
  });

  if (member && member.phoneNumber) {
    const formattedPhone = member.phoneNumber.startsWith('0')
      ? '254' + member.phoneNumber.slice(1)
      : member.phoneNumber;

    sendSms({
      message: `HHS Welfare: Your monthly contribution is due on ${formattedDate}. Please pay on time.`,
      recipients: [formattedPhone],
    });
  }
}

export async function notifyOverduePayment(memberId: string, dueDate: Date) {
  const formattedDate = dueDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { phoneNumber: true }
  });

  await createUserNotification({
    memberId,
    type: 'ERROR',
    title: 'Payment Overdue Notice',
    message: `Your monthly contribution payment for ${formattedDate} is overdue. Please make payment immediately to avoid further action.`,
    icon: '⚠️',
    link: '/member-dashboard/contributions',
  });

  if (member && member.phoneNumber) {
    const formattedPhone = member.phoneNumber.startsWith('0')
      ? '254' + member.phoneNumber.slice(1)
      : member.phoneNumber;

    sendSms({
      message: `HHS Welfare: Your payment for ${formattedDate} is overdue. Please pay immediately.`,
      recipients: [formattedPhone],
    });
  }
}

export async function notifyDefaultStatus(memberId: string, dueDate: Date) {
  const formattedDate = dueDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { phoneNumber: true }
  });

  await createUserNotification({
    memberId,
    type: 'ERROR',
    title: 'Member Marked as Default',
    message: `You have been marked as in default for failing to pay the contribution due on ${formattedDate}. Please contact the SACCO office immediately.`,
    icon: '❌',
    link: '/member-dashboard/contributions',
  });

  if (member && member.phoneNumber) {
    const formattedPhone = member.phoneNumber.startsWith('0')
      ? '254' + member.phoneNumber.slice(1)
      : member.phoneNumber;

    sendSms({
      message: `HHS Welfare: You are marked as default for payment due ${formattedDate}. Contact the office immediately.`,
      recipients: [formattedPhone],
    });
  }
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
