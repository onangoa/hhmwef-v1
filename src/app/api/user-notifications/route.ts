import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    const where: any = { memberId };

    if (status) {
      where.status = status;
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.userNotification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.userNotification.count({
        where: { memberId, status: 'UNREAD' },
      }),
    ]);

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const notification = await prisma.userNotification.create({
      data: {
        memberId: body.memberId,
        type: body.type || 'INFO',
        title: body.title,
        message: body.message,
        link: body.link,
        icon: body.icon,
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Error creating user notification:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, status } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Notification IDs are required' }, { status: 400 });
    }

    const updateData: any = { status };
    if (status === 'READ') {
      updateData.readAt = new Date();
    }

    await prisma.userNotification.updateMany({
      where: { id: { in: ids } },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
