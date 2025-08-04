import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useAppContext, Task } from '@/context/AppContext';
import { tasksApi } from '@/utils/api';
import { strings } from '@/utils/strings';
import { TasksSkeleton } from '@/components/common/SkeletonLoader';
import { LoadingButton } from '@/components/common/LoadingButton';
import { Modal } from '@/components/ui/Modal';
import { PersianInput } from '@/components/ui/PersianInput';
import { PersianButton } from '@/components/ui/PersianButton';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const taskSchema = yup.object({
  title: yup.string().required('عنوان الزامی است'),
  description: yup.string().required('توضیحات الزامی است')
}).required();

type TaskFormData = {
  title: string;
  description: string;
};

const statusConfig = {
  todo: { title: 'انجام نشده', color: 'bg-gray-100 dark:bg-gray-800' },
  doing: { title: 'در حال انجام', color: 'bg-blue-100 dark:bg-blue-900' },
  done: { title: 'انجام شده', color: 'bg-green-100 dark:bg-green-900' }
};

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, index, onEdit, onDelete }) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            'bg-card border border-border rounded-lg p-4 mb-3 shadow-sm transition-shadow',
            snapshot.isDragging && 'shadow-lg rotate-1 scale-105'
          )}
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium text-foreground font-vazir flex-1 ml-2">
              {task.title}
            </h3>
            <div className="flex space-x-1 space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(task)}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="p-1 text-muted-foreground hover:text-destructive"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground font-vazir mb-3">
            {task.description}
          </p>
          
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span className="numbers-ltr">
              {new Date(task.createdAt).toLocaleDateString('fa-IR')}
            </span>
            <span className={cn(
              'px-2 py-1 rounded-full text-xs',
              statusConfig[task.status].color
            )}>
              {statusConfig[task.status].title}
            </span>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export const TasksKanban: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<TaskFormData>({
    resolver: yupResolver(taskSchema)
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const result = await tasksApi.getTasks();
      if (result.success && result.data) {
        setTasks(result.data);
        dispatch({ type: 'SET_TASKS', payload: result.data });
      }
    } catch (error) {
      toast.error('خطا در بارگیری وظایف');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handlePullToRefresh = () => {
    setRefreshing(true);
    loadTasks();
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const newStatus = destination.droppableId as Task['status'];
    const updatedTask = tasks.find(task => task.id === draggableId);
    
    if (!updatedTask) return;

    // Optimistic update
    const updatedTasks = tasks.map(task =>
      task.id === draggableId
        ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
        : task
    );
    setTasks(updatedTasks);

    try {
      const result = await tasksApi.updateTask(draggableId, {
        ...updatedTask,
        status: newStatus
      });

      if (result.success) {
        toast.success('وظیفه به‌روزرسانی شد');
      } else {
        // Revert on error
        setTasks(tasks);
        toast.error(result.error || 'خطا در به‌روزرسانی وظیفه');
      }
    } catch (error) {
      setTasks(tasks);
      toast.error('خطا در ارتباط با سرور');
    }
  };

  const onSubmit = async (data: TaskFormData) => {
    setSubmitting(true);
    
    try {
      if (editingTask) {
        const result = await tasksApi.updateTask(editingTask.id, {
          ...editingTask,
          ...data,
          updatedAt: new Date().toISOString()
        });

        if (result.success && result.data) {
          setTasks(prev => prev.map(task =>
            task.id === editingTask.id ? result.data : task
          ));
          toast.success(strings.taskUpdated);
        } else {
          toast.error(result.error || 'خطا در به‌روزرسانی وظیفه');
        }
      } else {
        const result = await tasksApi.createTask({
          ...data,
          status: 'todo'
        });

        if (result.success && result.data) {
          setTasks(prev => [...prev, result.data]);
          toast.success(strings.taskCreated);
        } else {
          toast.error(result.error || 'خطا در ایجاد وظیفه');
        }
      }

      setIsModalOpen(false);
      reset();
      setEditingTask(null);
    } catch (error) {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    reset({
      title: task.title,
      description: task.description
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('آیا از حذف این وظیفه مطمئن هستید؟')) return;

    try {
      const result = await tasksApi.deleteTask(taskId);
      
      if (result.success) {
        setTasks(prev => prev.filter(task => task.id !== taskId));
        toast.success(strings.taskDeleted);
      } else {
        toast.error(result.error || 'خطا در حذف وظیفه');
      }
    } catch (error) {
      toast.error('خطا در ارتباط با سرور');
    }
  };

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status);
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground font-vazir mb-6">
          {strings.tasks}
        </h1>
        <TasksSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-vazir">
            {strings.tasks}
          </h1>
          <p className="text-sm text-muted-foreground font-vazir">
            مدیریت وظایف با کانبان
          </p>
        </div>
        
        <div className="flex space-x-2 space-x-reverse">
          <LoadingButton
            variant="outline"
            onClick={handlePullToRefresh}
            loading={refreshing}
          >
            بروزرسانی
          </LoadingButton>
          <PersianButton
            onClick={() => {
              setEditingTask(null);
              reset();
              setIsModalOpen(true);
            }}
            className="flex items-center space-x-2 space-x-reverse"
          >
            <PlusIcon className="h-4 w-4" />
            <span>{strings.newTask}</span>
          </PersianButton>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(['todo', 'doing', 'done'] as const).map((status) => {
            const statusTasks = getTasksByStatus(status);
            
            return (
              <div key={status} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-foreground font-vazir">
                    {statusConfig[status].title}
                  </h2>
                  <span className="bg-muted text-muted-foreground px-2 py-1 rounded-full text-sm numbers-ltr">
                    {statusTasks.length}
                  </span>
                </div>

                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        'min-h-[400px] rounded-lg border-2 border-dashed p-4 transition-colors',
                        snapshot.isDraggingOver
                          ? 'border-primary bg-primary/5'
                          : 'border-border'
                      )}
                    >
                      <div className="group">
                        {statusTasks.map((task, index) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            index={index}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                          />
                        ))}
                      </div>
                      {provided.placeholder}
                      
                      {statusTasks.length === 0 && (
                        <div className="text-center text-muted-foreground font-vazir py-8">
                          هیچ وظیفه‌ای در این بخش نیست
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Task Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
          reset();
        }}
        title={editingTask ? 'ویرایش وظیفه' : strings.newTask}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <PersianInput
            label={strings.taskTitle}
            {...register('title')}
            error={errors.title?.message}
            placeholder="عنوان وظیفه را وارد کنید"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground font-vazir">
              {strings.taskDescription}
            </label>
            <textarea
              {...register('description')}
              placeholder="توضیحات وظیفه را وارد کنید"
              className="w-full p-3 border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground font-vazir"
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-destructive font-vazir">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-2 space-x-reverse pt-4">
            <PersianButton
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setEditingTask(null);
                reset();
              }}
            >
              {strings.cancel}
            </PersianButton>
            <LoadingButton
              type="submit"
              loading={submitting}
            >
              {editingTask ? 'به‌روزرسانی' : strings.save}
            </LoadingButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};