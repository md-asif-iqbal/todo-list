import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/mongodb';
import { getAuthUser } from '@/lib/utils/auth';
import { ObjectId } from 'mongodb';
import type { Todo } from '@/types';

// GET single todo
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const todo = await db.collection('todos').findOne({
      _id: new ObjectId(id),
      userId: authUser.userId,
    });

    if (!todo) {
      return NextResponse.json(
        { success: false, message: 'Todo not found' },
        { status: 404 }
      );
    }

    const todoResponse: Todo = {
      id: todo._id.toString(),
      title: todo.title,
      description: todo.description,
      dueDate: todo.dueDate,
      priority: todo.priority,
      order: todo.order || 0,
      createdAt: todo.createdAt?.toISOString(),
      updatedAt: todo.updatedAt?.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: todoResponse,
    });
  } catch (error: any) {
    console.error('Get todo error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to fetch todo',
      },
      { status: 500 }
    );
  }
}

// PUT update todo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    const updateData = {
      ...body,
      updatedAt: new Date(),
    };

    const result = await db.collection('todos').findOneAndUpdate(
      {
        _id: new ObjectId(id),
        userId: authUser.userId,
      },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result || !result.value) {
      return NextResponse.json(
        { success: false, message: 'Todo not found' },
        { status: 404 }
      );
    }

    const todo: Todo = {
      id: result.value._id.toString(),
      title: result.value.title,
      description: result.value.description,
      dueDate: result.value.dueDate,
      priority: result.value.priority,
      order: result.value.order || 0,
      createdAt: result.value.createdAt?.toISOString(),
      updatedAt: result.value.updatedAt?.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: todo,
    });
  } catch (error: any) {
    console.error('Update todo error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to update todo',
      },
      { status: 500 }
    );
  }
}

// DELETE todo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const result = await db.collection('todos').deleteOne({
      _id: new ObjectId(id),
      userId: authUser.userId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Todo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Todo deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete todo error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to delete todo',
      },
      { status: 500 }
    );
  }
}

