#!/usr/bin/env tsx
/**
 * Script to add new templates to the database
 * Usage: npm run add-template
 * 
 * This script makes it easy to add new templates without modifying code.
 * Just update the newTemplates array below with your new template data.
 */

import { templateManager } from "./templateManager";
import { TaskPriority } from "@shared/schema";
import { logger } from "./logger";

// ========================================
// ADD YOUR NEW TEMPLATES HERE
// ========================================
const newTemplates = [
  // Example template structure:
  // {
  //   name: "Template Name",
  //   description: "Brief description of what this template helps with",
  //   category: "Category Name", // e.g., "Personal Productivity", "Project Management", etc.
  //   tags: ["tag1", "tag2", "tag3"],
  //   tasks: [
  //     { 
  //       title: "Task title", 
  //       category: "Work|Personal|Shopping|Health|Other", 
  //       priority: "Low" as TaskPriority | "Medium" as TaskPriority | "High" as TaskPriority,
  //       timer: 30, // Optional: timer in minutes
  //       scheduledDaysFromNow: 7 // Optional: schedule for X days from when template is used
  //     },
  //   ]
  // }
  
  // Add your new templates below this line:
  // ----------------------------------------
  
  // Example: Emergency Preparedness Template
  {
    name: "Emergency Preparedness Checklist",
    description: "Be ready for unexpected situations with essential preparations",
    category: "Home & Lifestyle",
    tags: ["emergency", "preparedness", "safety", "planning"],
    tasks: [
      { title: "Create emergency contact list", category: "Personal", priority: "High" as TaskPriority },
      { title: "Stock emergency food and water (3 days)", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Assemble first aid kit", category: "Shopping", priority: "High" as TaskPriority },
      { title: "Locate and test flashlights", category: "Personal", priority: "Medium" as TaskPriority },
      { title: "Make copies of important documents", category: "Personal", priority: "Medium" as TaskPriority },
      { title: "Plan evacuation routes", category: "Personal", priority: "High" as TaskPriority },
      { title: "Review insurance coverage", category: "Personal", priority: "Low" as TaskPriority },
    ]
  },
  
  // Add more templates as needed...
];

// ========================================
// SCRIPT EXECUTION
// ========================================
async function main() {
  try {
    console.log("🚀 Starting template addition process...\n");
    
    if (newTemplates.length === 0) {
      console.log("⚠️  No new templates to add. Please add templates to the newTemplates array in this file.");
      return;
    }
    
    console.log(`📋 Found ${newTemplates.length} template(s) to add\n`);
    
    const addedCount = await templateManager.addTemplates(newTemplates);
    
    console.log("\n✅ Template addition complete!");
    console.log(`📊 Summary: Added ${addedCount} new template(s) out of ${newTemplates.length} provided`);
    
    if (addedCount < newTemplates.length) {
      console.log(`ℹ️  Some templates were skipped (likely duplicates)`);
    }
    
    // Show all available categories
    const categories = await templateManager.getCategories();
    console.log("\n📁 Available template categories:");
    categories.forEach(cat => console.log(`   • ${cat}`));
    
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error adding templates:", error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}