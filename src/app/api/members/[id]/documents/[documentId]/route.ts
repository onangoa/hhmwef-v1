import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { unlink } from 'fs/promises';
import path from 'path';
import { requireAuth } from '@/lib/auth-server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; documentId: string } }
) {
  try {
    // Authenticate the user
    const user = await requireAuth(request);
    
    // Check if the user is trying to delete their own documents
    if (user.memberId !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}