import { storage } from "./storage";
import { TaskPriority, TaskTemplate } from "@shared/schema";
import { logger } from "./logger";

interface TemplateData {
  name: string;
  description: string;
  category: string;
  tags: string[];
  tasks: Array<{
    title: string;
    category: string;
    priority: TaskPriority;
    timer?: number;
    scheduledDaysFromNow?: number;
  }>;
}

export class TemplateManager {
  // Check if a template already exists by name
  private async templateExists(name: string): Promise<boolean> {
    try {
      const templates = await storage.getTemplates();
      return templates.some(t => t.name === name);
    } catch (error) {
      logger.error("Error checking template existence:", error);
      return false;
    }
  }

  // Add a single template (with duplicate check)
  async addTemplate(templateData: TemplateData): Promise<TaskTemplate | null> {
    try {
      // Check if template already exists
      if (await this.templateExists(templateData.name)) {
        logger.info(`Template already exists: ${templateData.name}`);
        return null;
      }

      const template = await storage.createTemplate({
        name: templateData.name,
        description: templateData.description,
        category: templateData.category,
        tasks: templateData.tasks,
        isPublic: true,
        createdByUserId: null, // System templates
        tags: templateData.tags,
      });

      logger.info(`Created template: ${template.name}`);
      return template;
    } catch (error) {
      logger.error(`Error creating template ${templateData.name}:`, error);
      return null;
    }
  }

  // Add multiple templates in batch
  async addTemplates(templates: TemplateData[]): Promise<number> {
    let addedCount = 0;
    
    for (const templateData of templates) {
      const result = await this.addTemplate(templateData);
      if (result) {
        addedCount++;
      }
    }

    logger.info(`Added ${addedCount} new templates out of ${templates.length} provided`);
    return addedCount;
  }

  // Initialize default templates (called on server start)
  async initializeDefaultTemplates(): Promise<void> {
    try {
      const existingTemplates = await storage.getTemplates();
      
      if (existingTemplates.length === 0) {
        logger.info("No templates found, initializing default templates...");
        // Import templates directly - TSX handles TypeScript compilation
        const { defaultTemplates } = await import("./templates/defaultTemplates.js");
        logger.info(`Loaded ${defaultTemplates.length} templates from file`);
        await this.addTemplates(defaultTemplates);
      } else {
        logger.info(`Found ${existingTemplates.length} existing templates`);
        // Even if templates exist, check if we need to add new ones
        const { defaultTemplates } = await import("./templates/defaultTemplates.js");
        logger.info(`File contains ${defaultTemplates.length} templates, database has ${existingTemplates.length}`);
        
        // Add any missing templates
        const added = await this.addTemplates(defaultTemplates);
        if (added > 0) {
          logger.info(`Added ${added} new templates to existing collection`);
        }
      }
    } catch (error) {
      logger.error("Error initializing default templates:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
  }

  // Get all available template categories
  async getCategories(): Promise<string[]> {
    try {
      const templates = await storage.getTemplates();
      const categories = new Set(templates.map(t => t.category));
      return Array.from(categories);
    } catch (error) {
      logger.error("Error getting template categories:", error);
      return [];
    }
  }

  // Search templates by category, tags, or name
  async searchTemplates(query: {
    category?: string;
    tags?: string[];
    searchTerm?: string;
  }): Promise<TaskTemplate[]> {
    try {
      const templates = await storage.getTemplates();
      
      return templates.filter(template => {
        // Filter by category
        if (query.category && template.category !== query.category) {
          return false;
        }
        
        // Filter by tags (template must have at least one matching tag)
        if (query.tags && query.tags.length > 0) {
          const hasMatchingTag = query.tags.some(tag => 
            template.tags?.includes(tag)
          );
          if (!hasMatchingTag) return false;
        }
        
        // Filter by search term (in name or description)
        if (query.searchTerm) {
          const searchLower = query.searchTerm.toLowerCase();
          const inName = template.name.toLowerCase().includes(searchLower);
          const inDescription = template.description.toLowerCase().includes(searchLower);
          if (!inName && !inDescription) return false;
        }
        
        return true;
      });
    } catch (error) {
      logger.error("Error searching templates:", error);
      return [];
    }
  }
}

// Export singleton instance
export const templateManager = new TemplateManager();