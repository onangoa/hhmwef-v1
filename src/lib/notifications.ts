import { prisma } from './db';
import { sendEmailAsync } from './email';

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
    // Send email notification asynchronously
    try {
      const member = await prisma.member.findUnique({
        where: { id: params.memberId },
        select: { 
          email: true, 
          firstName: true, 
          notificationEmailEnabled: true,
          contributionAlerts: true,
          welfareAlerts: true,
          systemAlerts: true
        }
      });
      if (member && member.email && member.notificationEmailEnabled) {
        // Check if specific notification type is enabled
        let shouldSendEmail = true;
        
        if (params.type === 'CONTRIBUTION' || params.title.includes('Contribution')) {
          shouldSendEmail = member.contributionAlerts ?? true;
        } else if (params.type === 'WELFARE' || params.title.includes('Welfare')) {
          shouldSendEmail = member.welfareAlerts ?? true;
        } else if (params.type === 'SYSTEM' || params.title.includes('System')) {
          shouldSendEmail = member.systemAlerts ?? true;
        }
        
        if (!shouldSendEmail) {
          console.log('Email notification skipped: specific notification type disabled for member');
          return;
        }
        sendEmailAsync({
          to: member.email,
          subject: `HHS Welfare: ${params.title}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #1d4ed8;">${params.title}</h2>
              <p>Hello ${member.firstName},</p>
              <p>${params.message}</p>
              ${params.link ? `<p><a href="${process.env.NEXT_PUBLIC_APP_URL || ''}${params.link}" style="display: inline-block; padding: 10px 20px; background-color: #1d4ed8; color: white; text-decoration: none; border-radius: 5px;">View Details</a></p>` : ''}
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #666;">This is an automated notification from HHS Welfare System.</p>
            </div>
          `
        });
      }
    } catch (emailError) {
      console.error('Error triggered during email preparation:', emailError);
      // We don't throw here to ensure the notification creation itself is considered successful
    }

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
