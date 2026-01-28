import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../App';
import { useAppContext, TaskCategory, TaskPriority } from '../context/AppContext';
import { Picker } from '@react-native-picker/picker';
import { format } from 'date-fns';

type TaskDetailRouteProp = RouteProp<RootStackParamList, 'TaskDetail'>;
type TaskDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TaskDetail'>;

const TaskDetailScreen = () => {
  const navigation = useNavigation<TaskDetailNavigationProp>();
  const route = useRoute<TaskDetailRouteProp>();
  const { taskId } = route.params;
  const { tasks, updateTask, deleteTask, activeTask, setActiveTask } = useAppContext();
  
  // Find the current task
  const task = tasks.find(t => t.id === taskId);
  
  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Work');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [completed, setCompleted] = useState(false);
  const [timer, setTimer] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Initialize form with task data
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setCategory(task.category);
      setPriority(task.priority);
      setCompleted(task.completed);
      setTimer(task.timer ? task.timer.toString() : '');
    }
  }, [task]);
  
  // If task doesn't exist, go back to home
  if (!task) {
    navigation.goBack();
    return null;
  }
  
  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Task title cannot be empty');
      return;
    }
    
    updateTask(taskId, {
      title: title.trim(),
      category,
      priority,
      completed,
      timer: timer ? parseInt(timer, 10) : undefined,
    });
    
    setIsEditing(false);
  };
  
  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: () => {
            deleteTask(taskId);
            navigation.goBack();
          },
          style: 'destructive'
        },
      ]
    );
  };
  
  const toggleTimer = () => {
    if (activeTask && activeTask.id === taskId) {
      setActiveTask(null);
    } else if (task.timer) {
      setActiveTask(task);
    } else {
      Alert.alert('No Timer', 'This task has no timer duration set');
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'PPp'); // Format: Apr 16, 2024, 3:15 PM
  };
  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          {isEditing ? (
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Task title"
              placeholderTextColor="#888888"
              autoFocus
            />
          ) : (
            <Text style={styles.title}>{task.title}</Text>
          )}
          
          <View style={styles.headerButtons}>
            {isEditing ? (
              <TouchableOpacity style={styles.iconButton} onPress={handleSave}>
                <Ionicons name="checkmark" size={24} color="#10b981" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.iconButton} onPress={() => setIsEditing(true)}>
                <Ionicons name="pencil" size={22} color="#10b981" />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.iconButton} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={22} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Completed</Text>
            <Switch
              value={completed}
              onValueChange={setCompleted}
              trackColor={{ false: '#333333', true: '#10b981' }}
              thumbColor={completed ? '#ffffff' : '#f4f3f4'}
              disabled={!isEditing}
            />
          </View>
        </View>
        
        {isEditing ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={category}
                  onValueChange={(value) => setCategory(value as TaskCategory)}
                  style={styles.picker}
                  dropdownIconColor="#10b981"
                  itemStyle={styles.pickerItem}
                >
                  <Picker.Item label="Work" value="Work" />
                  <Picker.Item label="Personal" value="Personal" />
                  <Picker.Item label="Shopping" value="Shopping" />
                  <Picker.Item label="Health" value="Health" />
                  <Picker.Item label="Other" value="Other" />
                </Picker>
              </View>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Priority</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={priority}
                  onValueChange={(value) => setPriority(value as TaskPriority)}
                  style={styles.picker}
                  dropdownIconColor="#10b981"
                  itemStyle={styles.pickerItem}
                >
                  <Picker.Item label="Low" value="Low" />
                  <Picker.Item label="Medium" value="Medium" />
                  <Picker.Item label="High" value="High" />
                </Picker>
              </View>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Timer (minutes)</Text>
              <TextInput
                style={styles.timerInput}
                value={timer}
                onChangeText={setTimer}
                placeholder="Timer duration"
                placeholderTextColor="#888888"
                keyboardType="number-pad"
              />
            </View>
          </>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Details</Text>
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Category:</Text>
                  <Text style={styles.detailValue}>{task.category}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Priority:</Text>
                  <Text style={[
                    styles.detailValue, 
                    styles.priorityText,
                    task.priority === 'High' && styles.highPriority,
                    task.priority === 'Medium' && styles.mediumPriority,
                    task.priority === 'Low' && styles.lowPriority,
                  ]}>
                    {task.priority}
                  </Text>
                </View>
                {task.timer && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Timer:</Text>
                    <Text style={styles.detailValue}>{task.timer} minutes</Text>
                  </View>
                )}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Created:</Text>
                  <Text style={styles.detailValue}>{formatDate(task.createdAt)}</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
      
      {!isEditing && task.timer && (
        <TouchableOpacity 
          style={[
            styles.timerButton, 
            activeTask?.id === taskId && styles.timerButtonActive
          ]}
          onPress={toggleTimer}
        >
          <Ionicons 
            name={activeTask?.id === taskId ? "pause" : "play"} 
            size={20} 
            color="#ffffff" 
          />
          <Text style={styles.timerButtonText}>
            {activeTask?.id === taskId ? "Pause Timer" : "Start Timer"}
          </Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
  },
  titleInput: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#10b981',
    paddingBottom: 5,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10b981',
    marginBottom: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#ffffff',
  },
  pickerContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    color: '#ffffff',
    backgroundColor: '#1e1e1e',
  },
  pickerItem: {
    color: '#ffffff',
  },
  timerInput: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
  },
  detailsContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  detailLabel: {
    width: 80,
    fontSize: 16,
    color: '#888888',
  },
  detailValue: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
  },
  priorityText: {
    fontWeight: '600',
  },
  highPriority: {
    color: '#ef4444',
  },
  mediumPriority: {
    color: '#f59e0b',
  },
  lowPriority: {
    color: '#3b82f6',
  },
  timerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 8,
    margin: 16,
  },
  timerButtonActive: {
    backgroundColor: '#ef4444',
  },
  timerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default TaskDetailScreen;