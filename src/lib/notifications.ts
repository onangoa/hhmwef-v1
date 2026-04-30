import { prisma } from './db';

export type NotificationType =
  | 'INFO'
  | 'SUCCESS'
  | 'WARNING'
  | 'ERROR'
  | 'CONTRIBUTION'
  | 'WELFARE'
  | 'SYSTEM';

export interface CreateNotificationParams {
  memberId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  icon?: string;
}

export async function createUserNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.userNotification.create({
      data: {
        memberId: params.memberId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link,
        icon: params.icon,
      },
    });

    return notification;
  } catch (error) {
    console.error('Error creating user notification:', error);
    throw error;
  }
}

export async function createBulkNotifications(
  memberIds: string[],
  params: Omit<CreateNotificationParams, 'memberId'>
) {
  try {
    const notifications = await Promise.all(
      memberIds.map((memberId) =>
        prisma.userNotification.create({
          data: {
            memberId,
            type: params.type,
            title: params.title,
            message: params.message,
            link: params.link,
            icon: params.icon,
          },
        })
      )
    );

    return notifications;
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    throw error;
  }
}

export const NotificationTemplates = {
  CONTRIBUTION_RECEIVED: {
    type: 'SUCCESS' as const,
    title: 'Contribution Received',
    message: 'Your contribution has been received and is pending verification.',
    icon: '💰',
  },
  CONTRIBUTION_VERIFIED: {
    type: 'SUCCESS' as const,
    title: 'Contribution Verified',
    message: 'Your contribution has been verified successfully.',
    icon: '✅',
  },
  CONTRIBUTION_REJECTED: {
    type: 'WARNING' as const,
    title: 'Contribution Issue',
    message: 'There was an issue with your contribution. Please contact support.',
    icon: '⚠️',
  },
  WELFARE_SUBMITTED: {
    type: 'INFO' as const,
    title: 'Welfare Case Submitted',
    message: 'Your welfare case application has been submitted for review.',
    icon: '❤️',
  },
  WELFARE_APPROVED: {
    type: 'SUCCESS' as const,
    title: 'Welfare Case Approved',
    message: 'Your welfare case has been approved and will be processed.',
    icon: '✅',
  },
  WELFARE_REJECTED: {
    type: 'WARNING' as const,
    title: 'Welfare Case Rejected',
    message: 'Your welfare case application was not approved.',
    icon: '⚠️',
  },
  MEMBER_APPROVED: {
    type: 'SUCCESS' as const,
    title: 'Membership Approved',
    message: 'Your membership has been approved. Welcome to the SACCO!',
    icon: '🎉',
  },
  ACCOUNT_CREATED: {
    type: 'INFO' as const,
    title: 'Account Created',
    message: 'Your account has been created successfully.',
    icon: '👤',
  },
  SYSTEM_ANNOUNCEMENT: {
    type: 'SYSTEM' as const,
    title: 'System Announcement',
    message: 'Important announcement from the SACCO administration.',
    icon: '📢',
  },
};
