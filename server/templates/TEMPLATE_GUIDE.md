# Template Management Guide

## Overview
The template system is designed to be highly scalable and easy to extend with new templates. Templates help users quickly get started with common task patterns.

## Current Templates
The system currently includes **30+ templates** across these categories:
- Personal Productivity
- Project Management  
- Strategic Planning
- Health & Fitness
- Home & Lifestyle
- Learning & Development
- Business & Entrepreneurship
- Travel & Vacation

## Adding New Templates

### Method 1: Add to Default Templates (Easiest)
1. Edit `server/templates/defaultTemplates.ts`
2. Add your new template to the `defaultTemplates` array
3. Restart the server - new templates will be added automatically

Example template structure:
```typescript
{
  name: "Your Template Name",
  description: "Brief description of what this template helps with",
  category: "Category Name",
  tags: ["tag1", "tag2", "tag3"],
  tasks: [
    { 
      title: "Task title", 
      category: "Work", // or "Personal", "Shopping", "Health", "Other"
      priority: "High" as TaskPriority, // or "Medium", "Low"
      timer: 30, // Optional: timer in minutes
      scheduledDaysFromNow: 7 // Optional: days from when template is used
    },
    // Add more tasks...
  ]
}
```

### Method 2: Use the Add Template Script
1. Edit `server/addTemplate.ts`
2. Add your templates to the `newTemplates` array
3. Run: `tsx server/addTemplate.ts`

### Method 3: Programmatically via Template Manager
```typescript
import { templateManager } from "./templateManager";

// Add a single template
await templateManager.addTemplate({
  name: "Template Name",
  description: "Description",
  category: "Category",
  tags: ["tag1", "tag2"],
  tasks: [...]
});

// Add multiple templates
await templateManager.addTemplates([template1, template2, ...]);
```

## Template Categories
You can use existing categories or create new ones:
- Personal Productivity
- Project Management
- Strategic Planning
- Health & Fitness
- Home & Lifestyle
- Learning & Development
- Business & Entrepreneurship
- Travel & Vacation
- [Add your own categories as needed]

## Template Features
- **Duplicate Prevention**: Templates with the same name won't be added twice
- **Usage Tracking**: System tracks how many times each template is used
- **Search & Filter**: Templates can be searched by category, tags, or name
- **Scheduling**: Tasks can have scheduled dates relative to when template is used
- **Timers**: Tasks can include default timer durations

## Database Schema
Templates are stored in the `taskTemplates` table with:
- `id`: Auto-incrementing primary key
- `name`: Template name (unique)
- `description`: Template description
- `category`: Template category
- `tasks`: JSON array of task objects
- `isPublic`: Whether template is available to all users
- `createdByUserId`: User who created it (null for system templates)
- `tags`: Array of searchable tags
- `usageCount`: Number of times template has been used
- `createdAt`: Creation timestamp

## Best Practices
1. **Keep templates focused**: Each template should solve one specific need
2. **Use clear task titles**: Make it obvious what needs to be done
3. **Set appropriate priorities**: Help users focus on what's important
4. **Add useful timers**: Include timers for focused work sessions
5. **Use scheduling wisely**: Schedule tasks that make sense to do later
6. **Tag appropriately**: Use tags that help users find templates

## Testing New Templates
1. Add your template using any method above
2. Restart the server if needed
3. Check the UI - templates appear in the template selector
4. Test applying the template to ensure tasks are created correctly

## Troubleshooting
- **Templates not appearing**: Check server logs for initialization errors
- **Duplicate templates**: The system prevents duplicates by name
- **Tasks not created**: Verify task category and priority values are valid

## Future Enhancements
The template system is designed to support:
- User-created templates (save current tasks as template)
- Template sharing between users
- Template versioning
- Template analytics (most popular, success rates, etc.)
- AI-suggested templates based on user behavior