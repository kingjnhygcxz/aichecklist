import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { playSound, stopSound } from '../utils/audio';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = () => {
  const { 
    alarmEnabled, 
    setAlarmEnabled,
    alarmSound,
    setAlarmSound,
    tasks
  } = useAppContext();
  
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  
  const soundOptions = [
    { id: 'gentle_bell', name: 'Gentle Bell', icon: 'notifications-outline' },
    { id: 'digital_alarm', name: 'Digital Alarm', icon: 'alarm-outline' },
    { id: 'subtle_chime', name: 'Subtle Chime', icon: 'musical-notes-outline' },
    { id: 'alert_tone', name: 'Alert Tone', icon: 'warning-outline' }
  ];

  const handlePlaySound = (soundId: string) => {
    if (currentlyPlaying) {
      stopSound(currentlyPlaying);
    }
    
    if (currentlyPlaying === soundId) {
      setCurrentlyPlaying(null);
    } else {
      playSound(soundId);
      setCurrentlyPlaying(soundId);
    }
  };
  
  const clearAllTasks = async () => {
    Alert.alert(
      'Clear All Tasks',
      'Are you sure you want to remove all tasks? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('tasks');
              Alert.alert('Success', 'All tasks have been removed');
              // Force reload the app - in a real app we'd use a better state management solution
              // but this is sufficient for demo purposes
              setTimeout(() => {
                if (Platform.OS === 'web') {
                  window.location.reload();
                } else {
                  // In a real app, we'd use a proper navigation reset here
                  Alert.alert('Restart Required', 'Please restart the app to complete the operation');
                }
              }, 1000);
            } catch (error) {
              Alert.alert('Error', 'Failed to clear tasks');
              console.error(error);
            }
          },
          style: 'destructive'
        }
      ]
    );
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alarm Settings</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <Ionicons name="notifications-outline" size={22} color="#10b981" style={styles.settingIcon} />
            <Text style={styles.settingLabel}>Enable Alarms</Text>
          </View>
          <Switch
            value={alarmEnabled}
            onValueChange={setAlarmEnabled}
            trackColor={{ false: '#333333', true: '#10b981' }}
            thumbColor={alarmEnabled ? '#ffffff' : '#f4f3f4'}
          />
        </View>
        
        <Text style={styles.subsectionTitle}>Alarm Sound</Text>
        {soundOptions.map((sound) => (
          <TouchableOpacity 
            key={sound.id} 
            style={[
              styles.soundOption,
              alarmSound === sound.id && styles.selectedSound
            ]}
            onPress={() => setAlarmSound(sound.id)}
          >
            <View style={styles.soundOptionContent}>
              <Ionicons name={sound.icon as any} size={22} color="#10b981" style={styles.soundIcon} />
              <Text style={styles.soundName}>{sound.name}</Text>
            </View>
            <View style={styles.soundActions}>
              {alarmEnabled && (
                <TouchableOpacity 
                  style={styles.playButton}
                  onPress={() => handlePlaySound(sound.id)}
                >
                  <Ionicons 
                    name={currentlyPlaying === sound.id ? "stop" : "play"} 
                    size={20} 
                    color="#10b981" 
                  />
                </TouchableOpacity>
              )}
              {alarmSound === sound.id && (
                <View style={styles.selectedIndicator} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tasks Count:</Text>
            <Text style={styles.infoValue}>{tasks.length}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Completed:</Text>
            <Text style={styles.infoValue}>
              {tasks.filter(t => t.completed).length}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Active:</Text>
            <Text style={styles.infoValue}>
              {tasks.filter(t => !t.completed).length}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.dangerButton}
          onPress={clearAllTasks}
        >
          <Ionicons name="trash-outline" size={20} color="#ffffff" />
          <Text style={styles.dangerButtonText}>Clear All Tasks</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.appName}>AI Checklist</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            A minimalist AI-assisted task management app with timers and alarms.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10b981',
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#888888',
    marginTop: 16,
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#ffffff',
  },
  soundOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedSound: {
    borderColor: '#10b981',
    borderWidth: 1,
  },
  soundOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  soundIcon: {
    marginRight: 12,
  },
  soundName: {
    fontSize: 16,
    color: '#ffffff',
  },
  soundActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    padding: 8,
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  infoLabel: {
    fontSize: 16,
    color: '#888888',
  },
  infoValue: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 8,
  },
  dangerButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  aboutCard: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 12,
  },
  appDescription: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SettingsScreen;