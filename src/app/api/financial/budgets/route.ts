import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');

    const where: any = {};

    if (year) {
      where.year = parseInt(year);
    }

    const budgets = await prisma.budget.findMany({
      where,
      include: {
        transactions: {
          orderBy: { date: 'desc' },
        },
      },
      orderBy: { year: 'desc' },
    });

    return NextResponse.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const budget = await prisma.budget.create({
      data: {
        year: body.year,
        category: body.category,
        amount: body.amount,
        description: body.description,
      },
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json({ error: 'Failed to create budget' }, { status: 500 });
  }
}
