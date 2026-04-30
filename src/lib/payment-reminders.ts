import { prisma } from '@/lib/db';
import { 
  notifyUpcomingPayment, 
  notifyOverduePayment, 
  notifyDefaultStatus 
} from '@/lib/notification-helpers';

interface PaymentReminderConfig {
  upcomingDaysBefore: number;
  overdueDaysAfter: number;
  defaultDaysAfter: number;
}

const DEFAULT_CONFIG: PaymentReminderConfig = {
  upcomingDaysBefore: 7, // 1 week before due date
  overdueDaysAfter: 7,  // 1 week after missed due date
  defaultDaysAfter: 30, // 1 month after missed payment
};

export class PaymentReminderService {
  private config: PaymentReminderConfig;

  constructor(config: Partial<PaymentReminderConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Check and send upcoming payment reminders
   * Sent 1 week before due date
   */
  async checkUpcomingPayments(): Promise<{ sent: number; errors: string[] }> {
    const sent = 0;
    const errors: string[] = [];

    try {
      // Get current date
      const now = new Date();
      
      // Calculate the date range for upcoming payments (1 week from now)
      const upcomingDate = new Date(now);
      upcomingDate.setDate(now.getDate() + this.config.upcomingDaysBefore);

      // Get all active members
      const activeMembers = await prisma.member.findMany({
        where: { memberStatus: 'ACTIVE' },
        include: {
          user: true,
          contributions: {
            where: {
              status: 'VERIFIED',
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 1, // Get the most recent contribution
          },
        },
      });

      // Get current month and year
      const currentMonth = upcomingDate.getMonth() + 1; // 1-12
      const currentYear = upcomingDate.getFullYear();

      for (const member of activeMembers) {
        try {
          // Check if member has already paid for the upcoming month
          const hasPaid = member.contributions.some(
            contribution => 
              contribution.month === currentMonth && 
              contribution.year === currentYear
          );

          if (!hasPaid) {
            // Send upcoming payment reminder
            await notifyUpcomingPayment(member.id, upcomingDate);
            console.log(`Sent upcoming payment reminder to ${member.email}`);
          }
        } catch (error) {
          const errorMsg = `Error sending reminder to ${member.email}: ${error}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      }

      return { sent, errors };
    } catch (error) {
      const errorMsg = `Error checking upcoming payments: ${error}`;
      console.error(errorMsg);
      errors.push(errorMsg);
      return { sent, errors };
    }
  }

  /**
   * Check and send overdue payment reminders
   * Sent 1 week after missed due date
   */
  async checkOverduePayments(): Promise<{ sent: number; errors: string[] }> {
    const sent = 0;
    const errors: string[] = [];

    try {
      // Get current date
      const now = new Date();
      
      // Calculate the date that was due 1 week ago
      const overdueDate = new Date(now);
      overdueDate.setDate(now.getDate() - this.config.overdueDaysAfter);

      // Get all active members
      const activeMembers = await prisma.member.findMany({
        where: { memberStatus: 'ACTIVE' },
        include: {
          user: true,
          contributions: {
            where: {
              status: 'VERIFIED',
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 1, // Get the most recent contribution
          },
        },
      });

      // Get the month and year that is now overdue
      const overdueMonth = overdueDate.getMonth() + 1; // 1-12
      const overdueYear = overdueDate.getFullYear();

      for (const member of activeMembers) {
        try {
          // Check if member has NOT paid for the overdue month
          const hasPaid = member.contributions.some(
            contribution => 
              contribution.month === overdueMonth && 
              contribution.year === overdueYear
          );

          if (!hasPaid) {
            // Send overdue payment reminder
            await notifyOverduePayment(member.id, overdueDate);
            console.log(`Sent overdue payment reminder to ${member.email}`);
          }
        } catch (error) {
          const errorMsg = `Error sending overdue reminder to ${member.email}: ${error}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      }

      return { sent, errors };
    } catch (error) {
      const errorMsg = `Error checking overdue payments: ${error}`;
      console.error(errorMsg);
      errors.push(errorMsg);
      return { sent, errors };
    }
  }

  /**
   * Check and mark members as default
   * Sent 1 month after missed payment
   */
  async checkDefaultPayments(): Promise<{ sent: number; errors: string[] }> {
    const sent = 0;
    const errors: string[] = [];

    try {
      // Get current date
      const now = new Date();
      
      // Calculate the date that was due 1 month ago
      const defaultDate = new Date(now);
      defaultDate.setDate(now.getDate() - this.config.defaultDaysAfter);

      // Get all active members
      const activeMembers = await prisma.member.findMany({
        where: { memberStatus: 'ACTIVE' },
        include: {
          user: true,
          contributions: {
            where: {
              status: 'VERIFIED',
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 1, // Get the most recent contribution
          },
        },
      });

      // Get the month and year that is now in default
      const defaultMonth = defaultDate.getMonth() + 1; // 1-12
      const defaultYear = defaultDate.getFullYear();

      for (const member of activeMembers) {
        try {
          // Check if member has NOT paid for the default month
          const hasPaid = member.contributions.some(
            contribution => 
              contribution.month === defaultMonth && 
              contribution.year === defaultYear
          );

          if (!hasPaid) {
            // Send default notification
            await notifyDefaultStatus(member.id, defaultDate);
            
            // Optionally update member status to default
            await prisma.member.update({
              where: { id: member.id },
              data: { memberStatus: 'SUSPENDED' }, // Or you could add a 'DEFAULT' status
            });
            
            console.log(`Marked ${member.email} as default for payment due ${defaultDate.toDateString()}`);
          }
        } catch (error) {
          const errorMsg = `Error processing default status for ${member.email}: ${error}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      }

      return { sent, errors };
    } catch (error) {
      const errorMsg = `Error checking default payments: ${error}`;
      console.error(errorMsg);
      errors.push(errorMsg);
      return { sent, errors };
    }
  }

  /**
   * Run all payment reminder checks
   */
  async runAllChecks(): Promise<{
    upcoming: { sent: number; errors: string[] };
    overdue: { sent: number; errors: string[] };
    default: { sent: number; errors: string[] };
  }> {
    console.log('Starting payment reminder checks...');
    
    const [upcoming, overdue, defaultStatus] = await Promise.all([
      this.checkUpcomingPayments(),
      this.checkOverduePayments(),
      this.checkDefaultPayments(),
    ]);

    console.log('Payment reminder checks completed');
    console.log(`- Upcoming: ${upcoming.sent} sent, ${upcoming.errors.length} errors`);
    console.log(`- Overdue: ${overdue.sent} sent, ${overdue.errors.length} errors`);
    console.log(`- Default: ${defaultStatus.sent} sent, ${defaultStatus.errors.length} errors`);

    return { upcoming, overdue, default: defaultStatus };
  }
}

// Export a singleton instance
export const paymentReminderService = new PaymentReminderService();