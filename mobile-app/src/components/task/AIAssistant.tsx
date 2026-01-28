import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../../context/AppContext';
import OpenAI from 'openai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSecureStore } from '../../hooks/useSecureStore';

interface AIResponse {
  suggestions: string[];
  insights: string[];
}

const AIAssistant = () => {
  const { tasks, addTask } = useAppContext();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getSecureValue } = useSecureStore();
  
  // Generate suggestions based on current tasks
  const generateSuggestions = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get the API key from secure storage
      const apiKey = await getSecureValue('OPENAI_API_KEY');
      
      if (!apiKey) {
        setError('API key not found. Please add your OpenAI API key in Settings.');
        setIsLoading(false);
        return;
      }
      
      const openai = new OpenAI({
        apiKey,
      });
      
      // Create a list of tasks for the prompt
      const taskList = tasks.map(task => 
        `- ${task.title} (${task.category}, ${task.priority}${task.completed ? ', Completed' : ''})`
      ).join('\n');
      
      // Create the prompt
      const prompt = `Based on the following task list, suggest 5 related tasks that might be helpful for the user to add next. Also provide 2-3 insights or patterns you notice.
      
      Current Tasks:
      ${taskList || '- No tasks yet'}
      
      Format your response as JSON with two fields: "suggestions" (array of strings) and "insights" (array of strings). Keep suggestions short and actionable.
      `;
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" 
        max_tokens: 1024,
        messages: [
          { role: 'system', content: "You're an AI assistant helping organize tasks. Provide helpful, actionable suggestions based on existing tasks." },
          { role: 'user', content: prompt }
        ],
        response_format: { type: "json_object" }
      });
      
      // Parse the response
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No content in AI response');
      }
      try {
        const data: AIResponse = JSON.parse(content);
        setSuggestions(data.suggestions || []);
        
        // Cache suggestions
        await AsyncStorage.setItem('cachedSuggestions', JSON.stringify(data.suggestions));
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        // Try to extract suggestions using a fallback method
        const matches = content.match(/suggestions":\s*\[(.*?)\]/);
        if (matches && matches[1]) {
          const extractedSuggestions = matches[1]
            .split(',')
            .map(s => s.trim().replace(/^"|"$/g, ''))
            .filter(s => s.length > 0);
          
          if (extractedSuggestions.length > 0) {
            setSuggestions(extractedSuggestions);
            await AsyncStorage.setItem('cachedSuggestions', JSON.stringify(extractedSuggestions));
          } else {
            throw new Error('Failed to extract suggestions from response');
          }
        } else {
          throw new Error('Failed to parse AI response');
        }
      }
    } catch (err) {
      console.error('Error generating suggestions:', err);
      setError('Failed to generate suggestions. Please try again later.');
      
      // Try to load cached suggestions
      try {
        const cachedSuggestions = await AsyncStorage.getItem('cachedSuggestions');
        if (cachedSuggestions) {
          setSuggestions(JSON.parse(cachedSuggestions));
        }
      } catch (cacheError) {
        console.error('Error loading cached suggestions:', cacheError);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load cached suggestions when the component mounts
  useEffect(() => {
    const loadCachedSuggestions = async () => {
      try {
        const cachedSuggestions = await AsyncStorage.getItem('cachedSuggestions');
        if (cachedSuggestions) {
          setSuggestions(JSON.parse(cachedSuggestions));
        } else {
          // Generate initial suggestions if we have at least one task
          if (tasks.length > 0) {
            generateSuggestions();
          }
        }
      } catch (error) {
        console.error('Error loading cached suggestions:', error);
      }
    };
    
    loadCachedSuggestions();
  }, []);
  
  // Add a task from suggestions
  const handleAddSuggestion = (suggestion: string) => {
    addTask({
      title: suggestion,
      category: 'Work', // Default category
      priority: 'Medium', // Default priority
      completed: false,
    });
    
    // Remove the suggestion from the list
    setSuggestions(prev => prev.filter(s => s !== suggestion));
    
    // Show success message
    Alert.alert('Task Added', 'The suggested task has been added to your list');
    
    // Close the panel
    setIsExpanded(false);
  };
  
  // Regenerate suggestions
  const handleRefresh = () => {
    generateSuggestions();
    setIsExpanded(true);
  };
  
  if (suggestions.length === 0 && !isLoading && !error) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.headerContent}>
          <Ionicons name="bulb-outline" size={22} color="#10b981" style={styles.headerIcon} />
          <Text style={styles.headerTitle}>AI Suggestions</Text>
        </View>
        <View style={styles.headerActions}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#10b981" />
          ) : (
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={handleRefresh}
            >
              <Ionicons name="refresh" size={18} color="#10b981" />
            </TouchableOpacity>
          )}
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#10b981" 
          />
        </View>
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.content}>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={generateSuggestions}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#10b981" />
              <Text style={styles.loadingText}>Generating suggestions...</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {suggestions.map((suggestion, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.suggestionCard}
                  onPress={() => handleAddSuggestion(suggestion)}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                  <View style={styles.addIconContainer}>
                    <Ionicons name="add-circle" size={22} color="#10b981" />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    marginTop: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    marginRight: 12,
    padding: 4,
  },
  content: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    color: '#888888',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  suggestionCard: {
    backgroundColor: '#262626',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    width: 220,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#333333',
  },
  suggestionText: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 12,
  },
  addIconContainer: {
    alignSelf: 'flex-end',
  },
});

export default AIAssistant;