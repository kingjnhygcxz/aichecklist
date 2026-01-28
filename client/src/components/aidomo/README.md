# AIDOMO Chat Widget System

A reusable AIDOMO chat component that can be easily added to any page in the application.

## Quick Usage

### Basic Implementation
```jsx
import { AidomoChatWidget } from "@/components/aidomo/AidomoChatWidget";

// Simple usage - adds AIDOMO button with default settings
<AidomoChatWidget />
```

### Common Configurations

#### 1. Toolbar/Header Integration (like Calendar page)
```jsx
<AidomoChatWidget 
  position="toolbar"
  size="sm"
  context="calendar_assistant"
/>
```

#### 2. Floating Chat Button (bottom-right corner)
```jsx
<AidomoChatWidget 
  position="floating"
  size="md"
  context="general_assistant"
  buttonText="Chat"
/>
```

#### 3. Inline with Custom Text
```jsx
<AidomoChatWidget 
  position="inline"
  size="lg" 
  context="task_management"
  buttonText="Ask AIDOMO"
  className="my-4"
/>
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | 'inline' \| 'floating' \| 'toolbar' | 'inline' | Where to position the widget |
| `size` | 'sm' \| 'md' \| 'lg' | 'md' | Size of the button and text |
| `context` | string | 'general_assistant' | Context for AI responses |
| `className` | string | '' | Additional CSS classes |
| `buttonText` | string | undefined | Custom text for button |
| `showIcon` | boolean | true | Whether to show AIDOMO icon |

## Context Options

Use these context values to customize AI responses:

- `general_assistant` - General help and questions
- `calendar_assistant` - Calendar and scheduling help  
- `task_management` - Task and productivity assistance
- `template_helper` - Template and checklist guidance
- `workflow_optimizer` - Workflow and efficiency tips

## Positioning Guide

### Toolbar Position
Perfect for page headers, next to other action buttons:
```jsx
<div className="flex items-center gap-2">
  <Button>Print</Button>
  <AidomoChatWidget position="toolbar" size="sm" />
</div>
```

### Floating Position  
Creates a fixed chat button in bottom-right corner:
```jsx
<AidomoChatWidget 
  position="floating" 
  buttonText="Help"
  context="page_specific_context"
/>
```

### Inline Position
Embeds directly in page content:
```jsx
<div className="my-section">
  <h2>Need Help?</h2>
  <AidomoChatWidget 
    position="inline"
    buttonText="Ask AIDOMO for assistance"
    size="lg"
  />
</div>
```

## Error Protection

The widget includes built-in error boundaries to prevent page crashes if AIDOMO components fail. The chat functionality will gracefully degrade while keeping the rest of the page functional.

## Implementation Examples

### Adding to New Pages

1. **Import the component:**
   ```jsx
   import { AidomoChatWidget } from "@/components/aidomo/AidomoChatWidget";
   ```

2. **Choose appropriate placement and configuration**
3. **Add to your JSX with desired props**

That's it! The widget handles all the chat logic, styling, and error protection automatically.