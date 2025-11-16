'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { todosApi } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import type { Todo } from '@/types';
import { Search, Plus, Calendar, Trash2, Edit2, FileText } from 'lucide-react';
import { format } from 'date-fns';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function TodoCard({ todo, onEdit, onDelete }: { todo: Todo; onEdit: () => void; onDelete: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColors = {
    Extreme: 'bg-red-100 text-red-800 border-red-200',
    Moderate: 'bg-green-100 text-green-800 border-green-200',
    Low: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-move"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{todo.title}</h3>
          <p className="text-gray-600 text-sm mb-3">{todo.description}</p>
          <div className="flex items-center gap-4 flex-wrap">
            {todo.priority && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium border ${priorityColors[todo.priority]}`}
              >
                {todo.priority}
              </span>
            )}
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <Calendar size={14} />
              <span>Due {format(new Date(todo.dueDate), 'MMM dd, yyyy')}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            aria-label="Edit task"
          >
            <Edit2 size={16} className="text-gray-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 hover:bg-red-50 rounded transition-colors"
            aria-label="Delete task"
          >
            <Trash2 size={16} className="text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

function AddTaskModal({
  isOpen,
  onClose,
  onSave,
  todo,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (todo: Omit<Todo, 'id'>) => void;
  todo?: Todo;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'Extreme' | 'Moderate' | 'Low'>('Low');

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description);
      setDueDate(todo.dueDate.split('T')[0]);
      setPriority(todo.priority);
    } else {
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('Low');
    }
  }, [todo, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      dueDate,
      priority,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black  backdrop-blur-xl bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {todo ? 'Edit Task' : 'Add New Task'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Priority</label>
              <div className="flex gap-4">
                {(['Extreme', 'Moderate', 'Low'] as const).map((p) => (
                  <label key={p} className="flex items-center">
                    <input
                      type="radio"
                      name="priority"
                      value={p}
                      checked={priority === p}
                      onChange={(e) => setPriority(e.target.value as typeof priority)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{p}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={6}
                placeholder="Start writing here..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Go Back
              </button>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Done
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function TodosPage() {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadTodos();
  }, [router]);

  useEffect(() => {
    filterTodos();
  }, [searchQuery, todos]);

  const loadTodos = async () => {
    try {
      setIsLoading(true);
      const data = await todosApi.getAll();
      setTodos(data);
      setFilteredTodos(data);
    } catch (error) {
      console.error('Failed to load todos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTodos = () => {
    if (!searchQuery.trim()) {
      setFilteredTodos(todos);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = todos.filter(
      (todo) =>
        todo.title.toLowerCase().includes(query) ||
        todo.description.toLowerCase().includes(query)
    );
    setFilteredTodos(filtered);
  };

  const handleAddTodo = async (todoData: Omit<Todo, 'id'>) => {
    try {
      const newTodo = await todosApi.create(todoData);
      setTodos([...todos, newTodo]);
    } catch (error) {
      console.error('Failed to create todo:', error);
      alert('Failed to create todo. Please try again.');
    }
  };

  const handleUpdateTodo = async (id: string, todoData: Partial<Todo>) => {
    try {
      const updatedTodo = await todosApi.update(id, todoData);
      setTodos(todos.map((t) => (t.id === id ? updatedTodo : t)));
      setEditingTodo(undefined);
    } catch (error) {
      console.error('Failed to update todo:', error);
      alert('Failed to update todo. Please try again.');
    }
  };

  const handleDeleteTodo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await todosApi.delete(id);
      setTodos(todos.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Failed to delete todo:', error);
      alert('Failed to delete todo. Please try again.');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = todos.findIndex((t) => t.id === active.id);
    const newIndex = todos.findIndex((t) => t.id === over.id);

    const newTodos = arrayMove(todos, oldIndex, newIndex);
    setTodos(newTodos);

    try {
      const reorderData = newTodos.map((todo, index) => ({
        id: todo.id,
        order: index,
      }));
      await todosApi.reorder(reorderData);
    } catch (error) {
      console.error('Failed to reorder todos:', error);
      loadTodos(); // Reload on error
    }
  };

  const openEditModal = (todo: Todo) => {
    setEditingTodo(todo);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTodo(undefined);
  };

  const handleSave = async (todoData: Omit<Todo, 'id'>) => {
    if (editingTodo) {
      await handleUpdateTodo(editingTodo.id, todoData);
    } else {
      await handleAddTodo(todoData);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Todos</h1>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search your task here..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            New Task
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-gray-200">
            <div className="relative mb-4">
              <FileText size={80} className="text-gray-300" />
              <Plus
                size={32}
                className="absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full p-2"
              />
            </div>
            <p className="text-xl text-gray-600 font-medium">No todos yet</p>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Tasks</h2>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredTodos.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTodos.map((todo) => (
                    <TodoCard
                      key={todo.id}
                      todo={todo}
                      onEdit={() => openEditModal(todo)}
                      onDelete={() => handleDeleteTodo(todo.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}

        <AddTaskModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={handleSave}
          todo={editingTodo}
        />
      </div>
    </Layout>
  );
}

