import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDatabase } from '@/lib/db/mongodb';
import { generateToken } from '@/lib/utils/jwt';
import type { User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password } = body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 4 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    let db;
    try {
      db = await getDatabase();
    } catch (dbError: any) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        {
          success: false,
          message: 'Database connection failed. Please check your MongoDB connection string.',
        },
        { status: 500 }
      );
    }
    
    const existingUser = await db.collection('users').findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userData = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      contactNumber: '',
      address: '',
      birthday: '',
      profilePicture: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('users').insertOne(userData);

    // Generate token
    const token = generateToken({
      userId: result.insertedId.toString(),
      email: email.toLowerCase(),
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = userData;
    const user: User = {
      id: result.insertedId.toString(),
      ...userWithoutPassword,
    };

    return NextResponse.json({
      success: true,
      token,
      user,
      message: 'User created successfully',
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to create account. Please try again.',
      },
      { status: 500 }
    );
  }
}

