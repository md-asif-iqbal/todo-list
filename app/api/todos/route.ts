import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/mongodb';
import { getAuthUser } from '@/lib/utils/auth';
import type { Todo } from '@/types';

// GET all todos
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
    const todos = await db
      .collection('todos')
      .find({ userId: authUser.userId })
      .sort({ order: 1, createdAt: -1 })
      .toArray();

    const todosResponse: Todo[] = todos.map((todo) => ({
      id: todo._id.toString(),
      title: todo.title,
      description: todo.description,
      dueDate: todo.dueDate,
      priority: todo.priority,
      order: todo.order || 0,
      createdAt: todo.createdAt?.toISOString(),
      updatedAt: todo.updatedAt?.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: todosResponse,
    });
  } catch (error: any) {
    console.error('Get todos error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to fetch todos',
      },
      { status: 500 }
    );
  }
}

// POST create new todo
export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, dueDate, priority } = body;

    if (!title || !description || !dueDate) {
      return NextResponse.json(
        { success: false, message: 'Title, description, and due date are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Get the highest order number
    const lastTodo = await db
      .collection('todos')
      .findOne(
        { userId: authUser.userId },
        { sort: { order: -1 } }
      );
    
    const order = lastTodo ? (lastTodo.order || 0) + 1 : 1;

    const todoData = {
      userId: authUser.userId,
      title,
      description,
      dueDate,
      priority: priority || 'Low',
      order,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('todos').insertOne(todoData);

    const todo: Todo = {
      id: result.insertedId.toString(),
      title,
      description,
      dueDate,
      priority: priority || 'Low',
      order,
      createdAt: todoData.createdAt.toISOString(),
      updatedAt: todoData.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: todo,
    });
  } catch (error: any) {
    console.error('Create todo error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to create todo',
      },
      { status: 500 }
    );
  }
}

