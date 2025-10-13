import { CheckCircle2, Circle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  icon: string;
}

interface DailyTasksProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
}

export function DailyTasks({ tasks, onToggleTask }: DailyTasksProps) {
  const completedCount = tasks.filter(t => t.completed).length;
  const progress = (completedCount / tasks.length) * 100;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold" style={{ color: 'var(--text-dark)' }}>
          المهام اليومية
        </h3>
        <div className="text-sm font-semibold" style={{ color: 'var(--primary-purple)' }}>
          {completedCount} / {tasks.length}
        </div>
      </div>

      <div className="w-full h-3 rounded-full mb-6" style={{ backgroundColor: 'var(--gray-200)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            backgroundColor: 'var(--green-success)',
          }}
        />
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => onToggleTask(task.id)}
            className="w-full flex items-center gap-4 p-4 rounded-xl transition-all"
            style={{
              backgroundColor: task.completed ? 'var(--accent-blue-light)' : 'var(--gray-100)',
              opacity: task.completed ? 0.7 : 1,
            }}
          >
            <span className="text-3xl">{task.icon}</span>
            <span className="flex-1 text-right font-medium"
              style={{
                color: 'var(--text-dark)',
                textDecoration: task.completed ? 'line-through' : 'none',
              }}>
              {task.title}
            </span>
            {task.completed ? (
              <CheckCircle2 className="w-6 h-6" style={{ color: 'var(--green-success)' }} />
            ) : (
              <Circle className="w-6 h-6" style={{ color: 'var(--gray-400)' }} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
