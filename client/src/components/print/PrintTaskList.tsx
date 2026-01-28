import { useQuery } from "@tanstack/react-query";

interface Task {
  id: string;
  title: string;
  category: string;
  priority: string;
  completed: boolean;
  scheduledDate?: string;
}

export function PrintTaskList() {
  const { data: tasks = [], isLoading, error } = useQuery<Task[]>({
    queryKey: ['/api/tasks']
  });

  // Only show non-completed tasks in the print view
  const activeTasks = tasks.filter(task => !task.completed);

  // Debug logging - only log when component renders
  console.log('PrintTaskList render - Tasks loaded:', tasks.length);
  console.log('PrintTaskList render - Active tasks:', activeTasks.length);
  console.log('PrintTaskList render - Loading:', isLoading);
  console.log('PrintTaskList render - Tasks data:', tasks);
  if (error) console.log('PrintTaskList render - Error:', error);

  return (
    <div className="print-only">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ width: '100px' }}></div> {/* Left spacer */}
        <h2 style={{ textAlign: 'center', color: 'black', fontSize: '18px', margin: '0', flex: '1' }}>
          My Tasks
        </h2>
        <div style={{ width: '100px' }}></div> {/* Right spacer for center alignment */}
      </div>
      
      {isLoading ? (
        <p style={{ textAlign: 'center', color: 'black' }}>
          Loading tasks...
        </p>
      ) : activeTasks.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'black' }}>
          No active tasks to display
        </p>
      ) : (
        <ul className="print-task-list" style={{ listStyle: 'none', padding: '0', margin: '0' }}>
          {activeTasks.map((task) => (
            <li key={task.id} className="print-task-item" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '8px 0', 
              borderBottom: '1px solid #ccc',
              color: 'black',
              background: 'white'
            }}>
              <input 
                type="checkbox" 
                className="print-task-checkbox"
                checked={false}
                readOnly
                style={{ marginRight: '10px', width: '15px', height: '15px' }}
              />
              <span className="print-task-title" style={{ flex: '1', fontSize: '14px', color: 'black' }}>
                {task.title}
              </span>
              <span className="print-task-category" style={{ fontSize: '12px', color: '#666', marginLeft: '10px' }}>
                {task.category}
              </span>
              <span className="print-task-priority" style={{ fontSize: '12px', marginLeft: '10px', color: '#666' }}>
                {task.priority}
              </span>
              {task.scheduledDate && (
                <span style={{ fontSize: '12px', color: '#666', marginLeft: '10px' }}>
                  Due: {new Date(task.scheduledDate).toLocaleDateString()}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
      
      <div style={{ 
        marginTop: '30px', 
        textAlign: 'center', 
        fontSize: '12px', 
        color: '#666' 
      }}>
        AIChecklist.io
      </div>
    </div>
  );
}