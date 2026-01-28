import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

// Default predefined categories
export const DEFAULT_CATEGORIES = ["Work", "Personal", "Shopping", "Health", "Business", "Other"];

export function useCategories() {
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  // Fetch tasks to extract unique categories
  const { data: tasks = [] } = useQuery({
    queryKey: ['/api/tasks'],
  });

  useEffect(() => {
    if (tasks.length > 0) {
      // Extract unique categories from existing tasks
      const allCategories = tasks.map((task: any) => task.category);
      const uniqueCategories = Array.from(new Set(allCategories));
      
      // Filter out default categories to get custom ones
      const customCats = uniqueCategories.filter(cat => 
        cat && !DEFAULT_CATEGORIES.includes(cat)
      );
      setCustomCategories(customCats);
    }
  }, [tasks]);

  // Get all categories (default + custom) - memoized for performance
  const allCategories = useMemo(() => {
    return [...DEFAULT_CATEGORIES, ...customCategories];
  }, [customCategories]);

  // Function to add a new custom category
  const addCustomCategory = (categoryName: string) => {
    const trimmedName = categoryName.trim();
    if (trimmedName && !allCategories.includes(trimmedName)) {
      setCustomCategories(prev => [...prev, trimmedName]);
      return true;
    }
    return false;
  };

  return {
    allCategories,
    customCategories,
    defaultCategories: DEFAULT_CATEGORIES,
    addCustomCategory,
  };
}