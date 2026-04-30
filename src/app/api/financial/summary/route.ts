import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year')
      ? parseInt(searchParams.get('year')!)
      : new Date().getFullYear();

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const [income, expenses, contributions, disbursements] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          type: 'INCOME',
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          type: 'EXPENSE',
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: { amount: true },
      }),
      prisma.contribution.aggregate({
        where: {
          status: 'VERIFIED',
          year,
        },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.disbursement.aggregate({
        where: {
          disbursedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const budgetSummary = await prisma.budget.findMany({
      where: { year },
    });

    const totalBudget = budgetSummary.reduce((sum, b) => sum + Number(b.amount), 0);

    const incomeByCategory = await prisma.transaction.groupBy({
      by: ['category'],
      where: {
        type: 'INCOME',
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: { amount: true },
    });

    const expenseByCategory = await prisma.transaction.groupBy({
      by: ['category'],
      where: {
        type: 'EXPENSE',
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: { amount: true },
    });

    return NextResponse.json({
      year,
      totalIncome: income._sum.amount || 0,
      totalExpenses: expenses._sum.amount || 0,
      totalContributions: contributions._sum.amount || 0,
      contributionCount: contributions._count || 0,
      totalDisbursements: disbursements._sum.amount || 0,
      disbursementCount: disbursements._count || 0,
      totalBudget,
      budgetSummary,
      incomeByCategory,
      expenseByCategory,
      balance: Number(income._sum.amount || 0) - Number(expenses._sum.amount || 0),
    });
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    return NextResponse.json({ error: 'Failed to fetch financial summary' }, { status: 500 });
  }
}
