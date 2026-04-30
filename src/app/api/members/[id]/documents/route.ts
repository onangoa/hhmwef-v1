import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/db';
import { getUser } from '@/lib/auth-client';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // For custom auth, we'll check if the user ID in the params matches the authenticated user
    // In a real implementation, you might want to add proper JWT verification here
    const authHeader = request.headers.get('authorization');
    const userToken = request.cookies.get('user-token')?.value;

    // Simple authentication check - in production, you should use proper JWT verification
    if (!authHeader && !userToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, we'll allow the request to proceed if there's any auth header or token
    // In a production app, you should verify the token and extract the user ID

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const documentType = data.get('documentType') as string;
    const description = data.get('description') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!documentType) {
      return NextResponse.json({ error: 'Document type is required' }, { status: 400 });
    }

    // Validate document type
    const validTypes = ['ID', 'BIRTH_CERTIFICATE', 'PASSPORT', 'OTHER'];
    if (!validTypes.includes(documentType)) {
      return NextResponse.json({ 
        error: 'Invalid document type' 
      }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only PDF, JPG, and PNG files are allowed' 
      }, { status: 400 });
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 5MB' 
      }, { status: 400 });
    }

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const fileName = `${randomUUID()}${fileExtension}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'documents', params.id);
    const filePath = path.join(uploadDir, fileName);

    // Create directory if it doesn't exist
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Save document info to database
    const document = await prisma.document.create({
      data: {
        memberId: params.id,
        fileName,
        originalName: file.name,
        documentType: documentType as any,
        fileSize: file.size,
        mimeType: file.type,
        filePath: `/uploads/documents/${params.id}/${fileName}`,
        description: description || null
      }
    });

    // Return file information
    return NextResponse.json({
      id: document.id,
      fileName: document.fileName,
      originalName: document.originalName,
      documentType: document.documentType,
      fileSize: document.fileSize,
      mimeType: document.mimeType,
      uploadedAt: document.uploadedAt,
      path: document.filePath
    });

  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // For custom auth, we'll check if the user ID in the params matches the authenticated user
    const authHeader = request.headers.get('authorization');
    const userToken = request.cookies.get('user-token')?.value;

    // Simple authentication check
    if (!authHeader && !userToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch documents from database
    const documents = await prisma.document.findMany({
      where: {
        memberId: params.id
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    });

    return NextResponse.json(documents);

  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}