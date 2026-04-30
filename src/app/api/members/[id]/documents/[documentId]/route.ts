import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { unlink } from 'fs/promises';
import path from 'path';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; documentId: string } }
) {
  try {
    // For custom auth, we'll check if the user ID in the params matches the authenticated user
    const authHeader = request.headers.get('authorization');
    const userToken = request.cookies.get('user-token')?.value;

    // Simple authentication check
    if (!authHeader && !userToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the document
    const document = await prisma.document.findFirst({
      where: {
        id: params.documentId,
        memberId: params.id
      }
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Delete the file from filesystem
    try {
      const filePath = path.join(process.cwd(), 'public', document.filePath);
      await unlink(filePath);
    } catch (error) {
      console.error('Error deleting file from filesystem:', error);
      // Continue with database deletion even if file deletion fails
    }

    // Delete the document from database
    await prisma.document.delete({
      where: {
        id: params.documentId
      }
    });

    return NextResponse.json({ message: 'Document deleted successfully' });

  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}