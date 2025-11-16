import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/mongodb';
import { getAuthUser } from '@/lib/utils/auth';
import { ObjectId } from 'mongodb';

export async function PATCH(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { todos } = body;

    if (!Array.isArray(todos)) {
      return NextResponse.json(
        { success: false, message: 'Invalid todos array' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Update order for each todo
    const updatePromises = todos.map((todo: { id: string; order: number }) =>
      db.collection('todos').updateOne(
        {
          _id: new ObjectId(todo.id),
          userId: authUser.userId,
        },
        {
          $set: {
            order: todo.order,
            updatedAt: new Date(),
          },
        }
      )
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: 'Todos reordered successfully',
    });
  } catch (error: any) {
    console.error('Reorder todos error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to reorder todos',
      },
      { status: 500 }
    );
  }
}

