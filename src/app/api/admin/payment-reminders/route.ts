import { NextRequest, NextResponse } from 'next/server';
import { paymentReminderService } from '@/lib/payment-reminders';

// This endpoint should be protected and only called by authorized systems
export async function POST(request: NextRequest) {
  try {
    // Verify the request is authorized (you might want to add a secret key check)
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.PAYMENT_REMINDER_SECRET;
    
    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Run all payment reminder checks
    const results = await paymentReminderService.runAllChecks();

    // Combine all errors
    const allErrors = [
      ...results.upcoming.errors,
      ...results.overdue.errors,
      ...results.default.errors,
    ];

    return NextResponse.json({
      message: 'Payment reminder checks completed',
      results: {
        upcoming: {
          sent: results.upcoming.sent,
          errors: results.upcoming.errors.length,
        },
        overdue: {
          sent: results.overdue.sent,
          errors: results.overdue.errors.length,
        },
        default: {
          sent: results.default.sent,
          errors: results.default.errors.length,
        },
      },
      totalErrors: allErrors.length,
      errors: allErrors.length > 0 ? allErrors : undefined,
    });
  } catch (error) {
    console.error('Error in payment reminders endpoint:', error);
    return NextResponse.json({ error: 'Failed to process payment reminders' }, { status: 500 });
  }
}

// You can also make this endpoint accessible via GET for testing (but secure it in production)
export async function GET(request: NextRequest) {
  try {
    // For security, only allow in development or with proper authorization
    if (process.env.NODE_ENV !== 'development') {
      const authHeader = request.headers.get('authorization');
      const expectedSecret = process.env.PAYMENT_REMINDER_SECRET;
      
      if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const results = await paymentReminderService.runAllChecks();

    return NextResponse.json({
      message: 'Payment reminder checks completed (GET request)',
      results: {
        upcoming: {
          sent: results.upcoming.sent,
          errors: results.upcoming.errors.length,
        },
        overdue: {
          sent: results.overdue.sent,
          errors: results.overdue.errors.length,
        },
        default: {
          sent: results.default.sent,
          errors: results.default.errors.length,
        },
      },
    });
  } catch (error) {
    console.error('Error in payment reminders endpoint:', error);
    return NextResponse.json({ error: 'Failed to process payment reminders' }, { status: 500 });
  }
}