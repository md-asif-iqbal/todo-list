import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/mongodb';
import { getAuthUser } from '@/lib/utils/auth';
import { ObjectId } from 'mongodb';
import type { User } from '@/types';

// GET user profile
export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const user = await db.collection('users').findOne({
      _id: new ObjectId(authUser.userId),
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const { password: _, _id, ...userWithoutPassword } = user as any;
    const userResponse: User = {
      id: _id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      contactNumber: user.contactNumber || '',
      address: user.address || '',
      birthday: user.birthday || '',
      profilePicture: user.profilePicture || '',
    };

    return NextResponse.json({
      success: true,
      data: userResponse,
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to fetch profile',
      },
      { status: 500 }
    );
  }
}

// PUT update user profile
export async function PUT(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const db = await getDatabase();

    // Don't allow password update through this endpoint
    const { password, ...updateData } = body;

    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(authUser.userId) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (!result || !result.value) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const { password: _, _id, ...userWithoutPassword } = result.value as any;
    const userResponse: User = {
      id: _id.toString(),
      firstName: result.value.firstName,
      lastName: result.value.lastName,
      email: result.value.email,
      contactNumber: result.value.contactNumber || '',
      address: result.value.address || '',
      birthday: result.value.birthday || '',
      profilePicture: result.value.profilePicture || '',
    };

    return NextResponse.json({
      success: true,
      data: userResponse,
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to update profile',
      },
      { status: 500 }
    );
  }
}

