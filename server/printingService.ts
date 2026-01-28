import { storage } from "./storage";
import { Task, TaskTemplate } from "@shared/schema";

interface PrintOptions {
  title: string;
  content: string;
  type: 'todo' | 'checklist' | 'template' | 'tasks' | 'custom';
  userId: number;
}

export class PrintingService {
  // Generate comprehensive todo list for modal printing
  async generateTodoList(userId: number, category?: string): Promise<string> {
    try {
      const tasks = await storage.getAllTasks(userId);
      const filteredTasks = category 
        ? tasks.filter(task => task.category.toLowerCase().includes(category.toLowerCase()))
        : tasks;

      const incompleteTasks = filteredTasks.filter(task => !task.completed);
      const completedTasks = filteredTasks.filter(task => task.completed);

      let content = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <div style="text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 40px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 28px;">${category ? `${category} ` : ''}Todo List</h1>
            <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()} | AICHECKLIST.IO</p>
          </div>

          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; margin-bottom: 30px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
            <div style="text-align: center;">
              <span style="font-size: 24px; font-weight: 700; color: #2563eb; display: block;">${tasks.length}</span>
              <span style="color: #6b7280; font-size: 12px; text-transform: uppercase; margin-top: 4px;">Total Tasks</span>
            </div>
            <div style="text-align: center;">
              <span style="font-size: 24px; font-weight: 700; color: #2563eb; display: block;">${incompleteTasks.length}</span>
              <span style="color: #6b7280; font-size: 12px; text-transform: uppercase; margin-top: 4px;">Pending</span>
            </div>
            <div style="text-align: center;">
              <span style="font-size: 24px; font-weight: 700; color: #2563eb; display: block;">${completedTasks.length}</span>
              <span style="color: #6b7280; font-size: 12px; text-transform: uppercase; margin-top: 4px;">Completed</span>
            </div>
            <div style="text-align: center;">
              <span style="font-size: 24px; font-weight: 700; color: #2563eb; display: block;">${tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%</span>
              <span style="color: #6b7280; font-size: 12px; text-transform: uppercase; margin-top: 4px;">Progress</span>
            </div>
          </div>`;

      // Add pending tasks section
      if (incompleteTasks.length > 0) {
        content += `
          <div style="margin-bottom: 40px;">
            <h2 style="color: #1e40af; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px;">📝 Pending Tasks (${incompleteTasks.length})</h2>`;

        for (const task of incompleteTasks) {
          const priorityColor = task.priority === 'High' ? '#dc2626' : 
                               task.priority === 'Medium' ? '#f59e0b' : '#10b981';
          
          content += `
            <div style="display: flex; align-items: flex-start; margin-bottom: 15px; padding: 12px; border-radius: 8px; background: #f9fafb; border-left: 4px solid ${priorityColor};">
              <div style="width: 18px; height: 18px; border: 2px solid #cbd5e0; border-radius: 4px; margin-right: 12px; flex-shrink: 0; margin-top: 2px;"></div>
              <div style="flex: 1;">
                <div style="font-weight: 600; margin-bottom: 4px; font-size: 16px;">${task.title}</div>
                <div style="font-size: 12px; color: #6b7280; display: flex; gap: 15px;">
                  <span>Category: ${task.category}</span>
                  <span>Priority: ${task.priority}</span>
                  ${task.scheduledDate ? `<span>Due: ${new Date(task.scheduledDate).toLocaleDateString()}</span>` : ''}
                </div>
              </div>
            </div>`;
        }
        content += `</div>`;
      }

      // Add completed tasks section
      if (completedTasks.length > 0) {
        content += `
          <div style="margin-bottom: 40px;">
            <h2 style="color: #1e40af; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px;">✅ Completed Tasks (${completedTasks.length})</h2>`;

        for (const task of completedTasks) {
          content += `
            <div style="display: flex; align-items: flex-start; margin-bottom: 15px; padding: 12px; border-radius: 8px; background: #f0f9ff; border-left: 4px solid #0ea5e9; opacity: 0.7;">
              <div style="width: 18px; height: 18px; background: #10b981; border: 2px solid #10b981; border-radius: 4px; margin-right: 12px; flex-shrink: 0; margin-top: 2px; position: relative;">
                <span style="position: absolute; color: white; font-size: 12px; font-weight: bold; left: 2px; top: -2px;">✓</span>
              </div>
              <div style="flex: 1;">
                <div style="font-weight: 600; margin-bottom: 4px; font-size: 16px; text-decoration: line-through; color: #9ca3af;">${task.title}</div>
                <div style="font-size: 12px; color: #6b7280; display: flex; gap: 15px;">
                  <span>Category: ${task.category}</span>
                  <span>Priority: ${task.priority}</span>
                  ${task.scheduledDate ? `<span>Due: ${new Date(task.scheduledDate).toLocaleDateString()}</span>` : ''}
                </div>
              </div>
            </div>`;
        }
        content += `</div>`;
      }

      if (tasks.length === 0) {
        content += `
          <div style="text-align: center; color: #6b7280; padding: 40px;">
            <p style="font-size: 18px;">No ${category ? category.toLowerCase() + ' ' : ''}tasks found.</p>
            <p style="font-size: 14px;">Start by creating some tasks to see them here!</p>
          </div>`;
      }

      // Add footer
      content += `
          <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <p>Powered by AICHECKLIST.IO - intelligent simplified and productive</p>
            <p>Professional printing courtesy of your AIDOMO assistant</p>
          </div>
        </div>`;

      return content;
    } catch (error) {
      console.error('Error generating todo list:', error);
      return '<div style="color: red; padding: 20px;">Error generating todo list. Please try again.</div>';
    }
  }

  // Generate checklist for modal printing
  async generateChecklist(userId: number, category?: string): Promise<string> {
    try {
      const tasks = await storage.getAllTasks(userId);
      const checklistTasks = tasks.filter(task => 
        task.checklistItems && 
        task.checklistItems.length > 0 &&
        (!category || task.category.toLowerCase().includes(category.toLowerCase()))
      );

      let content = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <div style="text-align: center; border-bottom: 3px solid #059669; padding-bottom: 20px; margin-bottom: 40px;">
            <h1 style="color: #059669; margin: 0; font-size: 28px;">${category ? `${category} ` : ''}Checklists</h1>
            <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()} | AICHECKLIST.IO</p>
          </div>`;

      if (checklistTasks.length > 0) {
        for (const task of checklistTasks) {
          const completedItems = task.checklistItems?.filter(item => item.completed) || [];
          const totalItems = task.checklistItems?.length || 0;
          const progress = totalItems > 0 ? Math.round((completedItems.length / totalItems) * 100) : 0;

          content += `
            <div style="margin-bottom: 30px; border: 2px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
              <div style="background: #f9fafb; padding: 15px; border-bottom: 1px solid #e5e7eb;">
                <h3 style="margin: 0; color: #059669; font-size: 20px;">${task.title}</h3>
                <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">
                  ${completedItems.length}/${totalItems} completed (${progress}%) • Category: ${task.category}
                </p>
              </div>
              <div style="padding: 15px;">`;

          for (const item of task.checklistItems || []) {
            content += `
              <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                <div style="width: 18px; height: 18px; ${item.completed ? 'background: #10b981; border: 2px solid #10b981;' : 'border: 2px solid #cbd5e0;'} border-radius: 4px; margin-right: 12px; flex-shrink: 0; margin-top: 2px; position: relative;">
                  ${item.completed ? '<span style="position: absolute; color: white; font-size: 12px; font-weight: bold; left: 2px; top: -2px;">✓</span>' : ''}
                </div>
                <span style="font-size: 16px; ${item.completed ? 'text-decoration: line-through; color: #9ca3af;' : ''}">${item.text}</span>
              </div>`;
          }

          content += `
              </div>
            </div>`;
        }
      } else {
        content += `
          <div style="text-align: center; color: #6b7280; padding: 40px;">
            <p style="font-size: 18px;">No ${category ? category.toLowerCase() + ' ' : ''}checklists found.</p>
            <p style="font-size: 14px;">Start by creating some checklists to see them here!</p>
          </div>`;
      }

      // Add footer
      content += `
          <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <p>Powered by AICHECKLIST.IO - intelligent simplified and productive</p>
            <p>Professional printing courtesy of your AIDOMO assistant</p>
          </div>
        </div>`;

      return content;
    } catch (error) {
      console.error('Error generating checklist:', error);
      return '<div style="color: red; padding: 20px;">Error generating checklist. Please try again.</div>';
    }
  }

  // Generate template list for modal printing
  async generateTemplateList(userId: number): Promise<string> {
    try {
      const templates = await storage.getTemplates();

      let content = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <div style="text-align: center; border-bottom: 3px solid #7c3aed; padding-bottom: 20px; margin-bottom: 40px;">
            <h1 style="color: #7c3aed; margin: 0; font-size: 28px;">Available Templates</h1>
            <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()} | AICHECKLIST.IO</p>
          </div>

          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #7c3aed; margin-bottom: 30px; text-align: center;">
            <span style="font-size: 24px; font-weight: 700; color: #7c3aed; display: block;">${templates.length}</span>
            <span style="color: #6b7280; font-size: 12px; text-transform: uppercase; margin-top: 4px;">Total Templates Available</span>
          </div>`;

      if (templates.length > 0) {
        // Group templates by category
        const templatesByCategory = templates.reduce((acc, template) => {
          const category = (template as any).category || 'Uncategorized';
          if (!acc[category]) acc[category] = [];
          acc[category].push(template as TaskTemplate);
          return acc;
        }, {} as Record<string, TaskTemplate[]>);

        for (const [category, categoryTemplates] of Object.entries(templatesByCategory)) {
          content += `
            <div style="margin-bottom: 30px;">
              <h2 style="color: #1e40af; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px;">${category} (${categoryTemplates.length})</h2>`;

          for (const template of categoryTemplates) {
            content += `
              <div style="display: flex; align-items: flex-start; margin-bottom: 15px; padding: 15px; border-radius: 8px; background: #f9fafb; border-left: 4px solid #7c3aed;">
                <div style="flex: 1;">
                  <div style="font-weight: 600; margin-bottom: 4px; font-size: 16px; color: #7c3aed;">${template.name}</div>
                  <div style="color: #6b7280; margin-bottom: 8px; font-size: 14px;">${(template as any).description || 'No description available'}</div>
                  ${(template as any).tags && (template as any).tags.length > 0 ? `
                    <div style="font-size: 12px; color: #6b7280;">
                      <strong>Tags:</strong> ${(template as any).tags.join(', ')}
                    </div>
                  ` : ''}
                </div>
              </div>`;
          }
          content += `</div>`;
        }
      } else {
        content += `
          <div style="text-align: center; color: #6b7280; padding: 40px;">
            <p style="font-size: 18px;">No templates available.</p>
            <p style="font-size: 14px;">Templates will be added soon!</p>
          </div>`;
      }

      // Add footer
      content += `
          <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <p>Powered by AICHECKLIST.IO - intelligent simplified and productive</p>
            <p>Professional printing courtesy of your AIDOMO assistant</p>
          </div>
        </div>`;

      return content;
    } catch (error) {
      console.error('Error generating template list:', error);
      return '<div style="color: red; padding: 20px;">Error generating template list. Please try again.</div>';
    }
  }

  // Generate custom print content
  async generateCustomPrint(title: string, content: string, userId: number): Promise<string> {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <div style="text-align: center; border-bottom: 3px solid #059669; padding-bottom: 20px; margin-bottom: 40px;">
          <h1 style="color: #059669; margin: 0; font-size: 28px;">${title}</h1>
          <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()} | AICHECKLIST.IO</p>
        </div>

        <div style="background: #f0fdfa; padding: 30px; border-radius: 8px; border-left: 4px solid #059669; white-space: pre-wrap; font-size: 16px; line-height: 1.8;">
          ${content.replace(/\n/g, '<br>')}
        </div>

        <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          <p>Powered by AICHECKLIST.IO - intelligent simplified and productive</p>
          <p>Professional printing courtesy of your AIDOMO assistant</p>
        </div>
      </div>`;

    return htmlContent;
  }

  // Generate achievements report for printing
  async generateAchievements(userId: number): Promise<string> {
    try {
      const achievements = await storage.getAchievements();
      const userAchievements = await storage.getUserAchievements(userId);
      const userStats = await storage.getUserStats(userId);

      const completedAchievements = userAchievements.filter(ua => ua.isCompleted);
      const totalPoints = userStats?.totalPoints || 0;
      const completionRate = achievements.length > 0 ? Math.round((completedAchievements.length / achievements.length) * 100) : 0;

      // Group achievements by category
      const groupedAchievements = achievements.reduce((acc, achievement) => {
        const category = achievement.type;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(achievement);
        return acc;
      }, {} as Record<string, any[]>);

      const categoryNames = {
        task_completion: "Task Completion",
        streak: "Consistency",
        category: "Category Focus",
        timer: "Time Management",
        voice: "Voice Commands",
        sharing: "Collaboration",
        milestone: "Milestones",
      };

      let content = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <div style="text-align: center; border-bottom: 3px solid #f59e0b; padding-bottom: 20px; margin-bottom: 40px;">
            <h1 style="color: #f59e0b; margin: 0; font-size: 28px;">🏆 Achievement Progress Report</h1>
            <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()} | AICHECKLIST.IO</p>
          </div>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 30px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
            <div style="text-align: center;">
              <span style="font-size: 24px; font-weight: 700; color: #f59e0b; display: block;">${totalPoints}</span>
              <span style="color: #6b7280; font-size: 12px; text-transform: uppercase; margin-top: 4px;">Total Points</span>
            </div>
            <div style="text-align: center;">
              <span style="font-size: 24px; font-weight: 700; color: #f59e0b; display: block;">${completedAchievements.length}</span>
              <span style="color: #6b7280; font-size: 12px; text-transform: uppercase; margin-top: 4px;">Unlocked</span>
            </div>
            <div style="text-align: center;">
              <span style="font-size: 24px; font-weight: 700; color: #f59e0b; display: block;">${achievements.length}</span>
              <span style="color: #6b7280; font-size: 12px; text-transform: uppercase; margin-top: 4px;">Total Achievements</span>
            </div>
            <div style="text-align: center;">
              <span style="font-size: 24px; font-weight: 700; color: #f59e0b; display: block;">${completionRate}%</span>
              <span style="color: #6b7280; font-size: 12px; text-transform: uppercase; margin-top: 4px;">Completion Rate</span>
            </div>
          </div>`;

      // Add achievement categories
      for (const [category, categoryAchievements] of Object.entries(groupedAchievements)) {
        const categoryName = categoryNames[category as keyof typeof categoryNames] || category;
        const categoryCompleted = categoryAchievements.filter(achievement => 
          userAchievements.some(ua => ua.achievementId === achievement.id && ua.isCompleted)
        ).length;

        content += `
          <div style="margin-bottom: 40px;">
            <h2 style="color: #d97706; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px;">
              ${categoryName} (${categoryCompleted}/${categoryAchievements.length} completed)
            </h2>`;

        for (const achievement of categoryAchievements) {
          const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id);
          const isCompleted = userAchievement?.isCompleted || false;
          const progress = userAchievement?.progress || 0;
          const progressPercent = achievement.targetValue > 0 ? Math.min(100, Math.round((progress / achievement.targetValue) * 100)) : 0;

          const statusColor = isCompleted ? '#10b981' : '#f59e0b';
          const statusIcon = isCompleted ? '🏆' : '⭐';
          const statusText = isCompleted ? 'UNLOCKED' : 'IN PROGRESS';

          content += `
            <div style="display: flex; align-items: flex-start; margin-bottom: 20px; padding: 16px; border-radius: 8px; background: ${isCompleted ? '#f0f9ff' : '#f9fafb'}; border-left: 4px solid ${statusColor};">
              <div style="font-size: 24px; margin-right: 16px; margin-top: 4px;">${statusIcon}</div>
              <div style="flex: 1;">
                <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 8px;">
                  <div style="flex: 1;">
                    <div style="font-weight: 700; font-size: 16px; margin-bottom: 4px; ${isCompleted ? 'color: #10b981;' : ''}">${achievement.name}</div>
                    <div style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">${achievement.description}</div>
                  </div>
                  <div style="background: ${statusColor}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase;">
                    ${statusText}
                  </div>
                </div>
                ${achievement.targetValue > 0 ? `
                  <div style="margin-bottom: 8px;">
                    <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 4px;">
                      <span style="font-size: 12px; color: #6b7280;">Progress: ${progress}/${achievement.targetValue}</span>
                      <span style="font-size: 12px; color: #6b7280;">${progressPercent}%</span>
                    </div>
                    <div style="background: #e5e7eb; height: 6px; border-radius: 3px; overflow: hidden;">
                      <div style="background: ${statusColor}; height: 100%; width: ${progressPercent}%; transition: width 0.3s ease;"></div>
                    </div>
                  </div>
                ` : ''}
                <div style="font-size: 12px; color: #6b7280;">
                  Points: ${achievement.points} | Difficulty: ${achievement.difficulty}
                </div>
              </div>
            </div>`;
        }
        content += `</div>`;
      }

      if (achievements.length === 0) {
        content += `
          <div style="text-align: center; color: #6b7280; padding: 40px;">
            <p style="font-size: 18px;">No achievements available.</p>
            <p style="font-size: 14px;">Keep using AICHECKLIST to unlock your first achievements!</p>
          </div>`;
      }

      // Add footer
      content += `
          <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <p>Powered by AICHECKLIST.IO - intelligent simplified and productive</p>
            <p>Professional achievement tracking courtesy of your AIDOMO assistant</p>
          </div>
        </div>`;

      return content;
    } catch (error) {
      console.error('Error generating achievements report:', error);
      return '<div style="color: red; padding: 20px;">Error generating achievements report. Please try again.</div>';
    }
  }

  // Generate statistics report for printing
  async generateStatistics(userId: number): Promise<string> {
    try {
      const tasks = await storage.getAllTasks(userId);
      const userStats = await storage.getUserStats(userId);

      const completedTasks = tasks.filter(task => task.completed).length;
      const pendingTasks = tasks.filter(task => !task.completed).length;
      const totalTasks = tasks.length;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Calculate category breakdown
      const categoryStats = {
        Work: tasks.filter(task => task.category === 'Work').length,
        Personal: tasks.filter(task => task.category === 'Personal').length,
        Shopping: tasks.filter(task => task.category === 'Shopping').length,
        Health: tasks.filter(task => task.category === 'Health').length,
        Business: tasks.filter(task => task.category === 'Business').length,
        Other: tasks.filter(task => task.category === 'Other').length,
      };

      // Calculate priority breakdown
      const priorityStats = {
        High: tasks.filter(task => task.priority === 'High').length,
        Medium: tasks.filter(task => task.priority === 'Medium').length,
        Low: tasks.filter(task => task.priority === 'Low').length,
      };

      let content = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <div style="text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 40px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 28px;">📊 Statistics Dashboard Report</h1>
            <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()} | AICHECKLIST.IO</p>
          </div>

          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; margin-bottom: 30px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
            <div style="text-align: center;">
              <span style="font-size: 24px; font-weight: 700; color: #2563eb; display: block;">${userStats?.totalTasks || totalTasks}</span>
              <span style="color: #6b7280; font-size: 12px; text-transform: uppercase; margin-top: 4px;">Total Tasks</span>
            </div>
            <div style="text-align: center;">
              <span style="font-size: 24px; font-weight: 700; color: #10b981; display: block;">${userStats?.completedTasks || completedTasks}</span>
              <span style="color: #6b7280; font-size: 12px; text-transform: uppercase; margin-top: 4px;">Completed</span>
            </div>
            <div style="text-align: center;">
              <span style="font-size: 24px; font-weight: 700; color: #f59e0b; display: block;">${userStats?.currentStreak || 0}</span>
              <span style="color: #6b7280; font-size: 12px; text-transform: uppercase; margin-top: 4px;">Current Streak</span>
            </div>
            <div style="text-align: center;">
              <span style="font-size: 24px; font-weight: 700; color: #8b5cf6; display: block;">${userStats?.totalPoints || 0}</span>
              <span style="color: #6b7280; font-size: 12px; text-transform: uppercase; margin-top: 4px;">Total Points</span>
            </div>
          </div>

          <div style="margin-bottom: 40px;">
            <h2 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px;">📈 Task Completion Overview</h2>
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="font-weight: 600;">Overall Progress</span>
                <span style="font-weight: 700; color: #2563eb;">${completionRate}%</span>
              </div>
              <div style="background: #e5e7eb; height: 12px; border-radius: 6px; overflow: hidden;">
                <div style="background: #10b981; height: 100%; width: ${completionRate}%; transition: width 0.3s ease;"></div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                <div style="text-align: center;">
                  <div style="font-size: 24px; font-weight: 700; color: #10b981;">${completedTasks}</div>
                  <div style="color: #6b7280; font-size: 14px;">Completed Tasks</div>
                </div>
                <div style="text-align: center;">
                  <div style="font-size: 24px; font-weight: 700; color: #2563eb;">${pendingTasks}</div>
                  <div style="color: #6b7280; font-size: 14px;">Pending Tasks</div>
                </div>
              </div>
            </div>
          </div>

          <div style="margin-bottom: 40px;">
            <h2 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px;">📂 Category Breakdown</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">`;

      for (const [category, count] of Object.entries(categoryStats)) {
        const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
        content += `
              <div style="background: #f9fafb; padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #2563eb;">
                <div style="font-size: 20px; font-weight: 700; color: #2563eb;">${count}</div>
                <div style="color: #6b7280; font-size: 14px; margin: 4px 0;">${category}</div>
                <div style="color: #6b7280; font-size: 12px;">(${percentage}%)</div>
              </div>`;
      }

      content += `
            </div>
          </div>

          <div style="margin-bottom: 40px;">
            <h2 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px;">🎯 Priority Distribution</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">`;

      const priorityColors = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };
      for (const [priority, count] of Object.entries(priorityStats)) {
        const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
        const color = priorityColors[priority as keyof typeof priorityColors];
        content += `
              <div style="background: #f9fafb; padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid ${color};">
                <div style="font-size: 20px; font-weight: 700; color: ${color};">${count}</div>
                <div style="color: #6b7280; font-size: 14px; margin: 4px 0;">${priority} Priority</div>
                <div style="color: #6b7280; font-size: 12px;">(${percentage}%)</div>
              </div>`;
      }

      content += `
            </div>
          </div>

          <div style="margin-bottom: 40px;">
            <h2 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px;">⚡ Productivity Metrics</h2>
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                <div style="text-align: center;">
                  <div style="font-size: 20px; font-weight: 700; color: #8b5cf6;">${userStats?.longestStreak || 0}</div>
                  <div style="color: #6b7280; font-size: 14px;">Longest Streak</div>
                </div>
                <div style="text-align: center;">
                  <div style="font-size: 20px; font-weight: 700; color: #2563eb;">${userStats?.totalTimerMinutes || 0}</div>
                  <div style="color: #6b7280; font-size: 14px;">Timer Minutes</div>
                </div>
                <div style="text-align: center;">
                  <div style="font-size: 20px; font-weight: 700; color: #10b981;">${userStats?.voiceTasksCreated || 0}</div>
                  <div style="color: #6b7280; font-size: 14px;">Voice Tasks</div>
                </div>
                <div style="text-align: center;">
                  <div style="font-size: 20px; font-weight: 700; color: #f59e0b;">${userStats?.tasksShared || 0}</div>
                  <div style="color: #6b7280; font-size: 14px;">Tasks Shared</div>
                </div>
              </div>
            </div>
          </div>

          <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <p>Powered by AICHECKLIST.IO - intelligent simplified and productive</p>
            <p>Professional statistics reporting courtesy of your AIDOMO assistant</p>
          </div>
        </div>`;

      return content;
    } catch (error) {
      console.error('Error generating statistics report:', error);
      return '<div style="color: red; padding: 20px;">Error generating statistics report. Please try again.</div>';
    }
  }

  // Main method to handle print requests
  async handlePrintRequest(request: string, userId: number): Promise<{ success: boolean; content?: string; title?: string; error?: string }> {
    try {
      const requestLower = request.toLowerCase();

      // Todo list printing
      if (requestLower.includes('todo') || requestLower.includes('to-do') || requestLower.includes('task list')) {
        let category: string | undefined;
        if (requestLower.includes('work')) category = 'work';
        else if (requestLower.includes('personal')) category = 'personal';
        else if (requestLower.includes('shopping')) category = 'shopping';
        else if (requestLower.includes('health')) category = 'health';

        const content = await this.generateTodoList(userId, category);
        return {
          success: true,
          content,
          title: `${category ? `${category} ` : ''}Todo List`
        };
      }

      // Checklist printing
      if (requestLower.includes('checklist') || requestLower.includes('check list')) {
        let category: string | undefined;
        if (requestLower.includes('work')) category = 'work';
        else if (requestLower.includes('personal')) category = 'personal';
        else if (requestLower.includes('shopping')) category = 'shopping';
        else if (requestLower.includes('health')) category = 'health';

        const content = await this.generateChecklist(userId, category);
        return {
          success: true,
          content,
          title: `${category ? `${category} ` : ''}Checklist`
        };
      }

      // Template list printing
      if (requestLower.includes('template') && (requestLower.includes('list') || requestLower.includes('show') || requestLower.includes('all'))) {
        const content = await this.generateTemplateList(userId);
        return {
          success: true,
          content,
          title: 'Available Templates'
        };
      }

      // Achievements printing
      if (requestLower.includes('achievement') || requestLower.includes('progress') || requestLower.includes('trophy')) {
        const content = await this.generateAchievements(userId);
        return {
          success: true,
          content,
          title: 'Achievement Progress Report'
        };
      }

      // Statistics printing
      if (requestLower.includes('statistics') || requestLower.includes('stats') || requestLower.includes('analytics') || requestLower.includes('dashboard')) {
        const content = await this.generateStatistics(userId);
        return {
          success: true,
          content,
          title: 'Statistics Dashboard Report'
        };
      }

      // High priority tasks printing
      if (requestLower.includes('high priority') || requestLower.includes('urgent') || requestLower.includes('important')) {
        const content = await this.generateTodoList(userId);
        return {
          success: true,
          content,
          title: 'High Priority Tasks'
        };
      }

      // Custom print request
      const content = await this.generateCustomPrint(
        'Custom Print Request', 
        `Print request: "${request}"\n\nThis appears to be a custom print request. Please be more specific about what you'd like to print:\n\n• Todo list or tasks\n• Checklist items\n• Template list\n• High priority tasks\n• Work, personal, shopping, or health tasks`,
        userId
      );
      
      return {
        success: true,
        content,
        title: 'Print Request'
      };
    } catch (error) {
      console.error('Error handling print request:', error);
      return {
        success: false,
        error: 'Failed to process print request'
      };
    }
  }
}

export const printingService = new PrintingService();