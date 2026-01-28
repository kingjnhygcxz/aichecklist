import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task, useAppContext } from '../../context/AppContext';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
}

const TaskCard = ({ task, onPress }: TaskCardProps) => {
  const { updateTask } = useAppContext();
  
  const toggleCompleted = () => {
    updateTask(task.id, { completed: !task.completed });
  };
  
  return (
    <Pressable 
      style={({ pressed }) => [
        styles.container,
        task.completed && styles.completedContainer,
        pressed && styles.pressed
      ]}
      onPress={onPress}
    >
      <TouchableOpacity 
        style={styles.checkbox}
        onPress={toggleCompleted}
      >
        <View style={[
          styles.checkboxInner,
          task.completed && styles.checkboxChecked
        ]}>
          {task.completed && (
            <Ionicons name="checkmark" size={16} color="#121212" />
          )}
        </View>
      </TouchableOpacity>
      
      <View style={styles.content}>
        <Text 
          style={[
            styles.title,
            task.completed && styles.completedTitle
          ]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        
        <View style={styles.details}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{task.category}</Text>
          </View>
          
          <View style={[
            styles.priorityBadge,
            task.priority === 'High' && styles.highPriority,
            task.priority === 'Medium' && styles.mediumPriority,
            task.priority === 'Low' && styles.lowPriority,
          ]}>
            <Text style={styles.priorityText}>{task.priority}</Text>
          </View>
          
          {task.timer && (
            <View style={styles.timerBadge}>
              <Ionicons name="time-outline" size={12} color="#10b981" />
              <Text style={styles.timerText}>{task.timer}m</Text>
            </View>
          )}
        </View>
      </View>
      
      <Ionicons 
        name="chevron-forward" 
        size={20} 
        color="#666666" 
        style={styles.chevron}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
  },
  completedContainer: {
    borderLeftColor: '#666666',
    opacity: 0.7,
  },
  pressed: {
    opacity: 0.7,
  },
  checkbox: {
    marginRight: 12,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#10b981',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 6,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#888888',
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: '#333333',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 12,
    color: '#ffffff',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  highPriority: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  mediumPriority: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.5)',
  },
  lowPriority: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.5)',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.5)',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  timerText: {
    fontSize: 12,
    color: '#10b981',
    marginLeft: 3,
  },
  chevron: {
    marginLeft: 8,
  },
});

export default TaskCard;