import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/mongodb';
import { getAuthUser } from '@/lib/utils/auth';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to base64 for now (in production, use cloud storage like S3, Cloudinary, etc.)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Update user profile with image URL
    const db = await getDatabase();
    await db.collection('users').updateOne(
      { _id: new ObjectId(authUser.userId) },
      {
        $set: {
          profilePicture: dataUrl,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      data: { url: dataUrl },
      message: 'Profile picture uploaded successfully',
    });
  } catch (error: any) {
    console.error('Upload picture error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to upload profile picture',
      },
      { status: 500 }
    );
  }
}

