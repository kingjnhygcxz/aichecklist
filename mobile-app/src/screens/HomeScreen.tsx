import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../App';
import { useAppContext, Task } from '../context/AppContext';
import TaskCard from '../components/task/TaskCard';
import TaskInput from '../components/task/TaskInput';
import AIAssistant from '../components/task/AIAssistant';
import TimerWidget from '../components/timer/TimerWidget';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { tasks, activeTask, isLoading } = useAppContext();
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  
  // Filter tasks based on completion status
  const filteredTasks = showCompletedTasks 
    ? tasks 
    : tasks.filter(task => !task.completed);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading your tasks...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Timer Widget - Only shown when there's an active task */}
        {activeTask && (
          <TimerWidget />
        )}

        {/* Task Input Form */}
        <TaskInput />

        {/* AI Assistant */}
        <AIAssistant />

        {/* Task List */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            {showCompletedTasks ? 'All Tasks' : 'Active Tasks'}
          </Text>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowCompletedTasks(!showCompletedTasks)}
          >
            <Text style={styles.filterButtonText}>
              {showCompletedTasks ? 'Hide Completed' : 'Show All'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkbox-outline" size={48} color="#10b981" />
            <Text style={styles.emptyStateText}>
              {showCompletedTasks 
                ? "You don't have any tasks yet" 
                : "You've completed all your tasks!"}
            </Text>
            {!showCompletedTasks && tasks.length > 0 && (
              <Text style={styles.emptyStateSubtext}>
                Tap "Show All" to see completed tasks
              </Text>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredTasks}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TaskCard 
                task={item} 
                onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
              />
            )}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      
      {/* Settings Button */}
      <TouchableOpacity 
        style={styles.settingsButton}
        onPress={() => navigation.navigate('Settings')}
      >
        <Ionicons name="settings-outline" size={24} color="#10b981" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    position: 'relative',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    color: '#10b981',
    marginTop: 12,
    fontSize: 16,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  filterButton: {
    padding: 8,
  },
  filterButtonText: {
    color: '#10b981',
    fontWeight: '500',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyStateText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    color: '#888888',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  settingsButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: 'rgba(18, 18, 18, 0.8)',
    borderRadius: 30,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#10b981',
  },
});

export default HomeScreen;