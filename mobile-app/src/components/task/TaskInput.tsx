import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { 
  useAppContext, 
  TaskCategory, 
  TaskPriority 
} from '../../context/AppContext';

const TaskInput = () => {
  const { addTask } = useAppContext();
  
  // Form state
  const [title, setTitle] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState<TaskCategory>('Work');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [timer, setTimer] = useState('');
  
  const handleAddTask = () => {
    if (!title.trim()) return;
    
    addTask({
      title: title.trim(),
      category,
      priority,
      completed: false,
      timer: timer ? parseInt(timer, 10) : undefined,
    });
    
    // Reset form
    setTitle('');
    setCategory('Work');
    setPriority('Medium');
    setTimer('');
    setShowModal(false);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Ionicons name="add-circle" size={22} color="#10b981" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Add a new task..."
          placeholderTextColor="#888888"
          value={title}
          onChangeText={setTitle}
          onSubmitEditing={() => title.trim() ? setShowModal(true) : null}
          returnKeyType="next"
        />
        <TouchableOpacity 
          style={[
            styles.addButton,
            !title.trim() && styles.disabledButton
          ]}
          onPress={() => title.trim() ? setShowModal(true) : null}
          disabled={!title.trim()}
        >
          <Text style={styles.addButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
      
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Task Details</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowModal(false)}
                >
                  <Ionicons name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.taskTitle}>{title}</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={category}
                    onValueChange={(value) => setCategory(value as TaskCategory)}
                    style={styles.picker}
                    dropdownIconColor="#10b981"
                  >
                    <Picker.Item label="Work" value="Work" />
                    <Picker.Item label="Personal" value="Personal" />
                    <Picker.Item label="Shopping" value="Shopping" />
                    <Picker.Item label="Health" value="Health" />
                    <Picker.Item label="Other" value="Other" />
                  </Picker>
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Priority</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={priority}
                    onValueChange={(value) => setPriority(value as TaskPriority)}
                    style={styles.picker}
                    dropdownIconColor="#10b981"
                  >
                    <Picker.Item label="Low" value="Low" />
                    <Picker.Item label="Medium" value="Medium" />
                    <Picker.Item label="High" value="High" />
                  </Picker>
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Timer (minutes, optional)</Text>
                <TextInput
                  style={styles.timerInput}
                  value={timer}
                  onChangeText={setTimer}
                  placeholder="e.g. 25"
                  placeholderTextColor="#888888"
                  keyboardType="number-pad"
                />
              </View>
              
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleAddTask}
              >
                <Text style={styles.submitButtonText}>Add Task</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#ffffff',
    paddingVertical: 10,
  },
  addButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  disabledButton: {
    backgroundColor: '#2d3748',
    opacity: 0.5,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#121212',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
  },
  closeButton: {
    padding: 4,
  },
  taskTitle: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 20,
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#888888',
    marginBottom: 8,
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
  timerInput: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default TaskInput;