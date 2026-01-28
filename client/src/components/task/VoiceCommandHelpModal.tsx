import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircleIcon, MicIcon } from "lucide-react";

interface CommandExample {
  command: string;
  description: string;
  examples: string[];
}

const VOICE_COMMANDS: CommandExample[] = [
  {
    command: "Add Task",
    description: "Create a new task with optional details",
    examples: [
      "Add task call client about project",
      "Create todo buy groceries",
      "Add task schedule doctor appointment for next week"
    ]
  },
  {
    command: "Complete Task",
    description: "Mark a task as complete by mentioning part of its name",
    examples: [
      "Complete task groceries",
      "Mark done client call",
      "Finish task doctor"
    ]
  },
  {
    command: "Delete Task",
    description: "Delete a task by mentioning part of its name",
    examples: [
      "Delete task meeting notes",
      "Remove todo groceries"
    ]
  },
  {
    command: "List Tasks",
    description: "Show a summary of your current tasks",
    examples: [
      "List tasks", 
      "Show todos"
    ]
  },
  {
    command: "Set Timer",
    description: "Set a timer for a specific task or in general",
    examples: [
      "Set timer for 25 minutes",
      "Set timer to 15 minutes for client call"
    ]
  },
  {
    command: "Start Timer",
    description: "Start the timer for the active task",
    examples: [
      "Start timer"
    ]
  },
  {
    command: "Stop Listening",
    description: "Turn off voice command recognition",
    examples: [
      "Stop listening", 
      "Stop voice commands"
    ]
  }
];

export function VoiceCommandHelpModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <HelpCircleIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MicIcon className="h-5 w-5 text-green-500" />
            Voice Command Help
          </DialogTitle>
          <DialogDescription>
            Use these voice commands to manage your tasks hands-free
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-6">
          {VOICE_COMMANDS.map((cmd) => (
            <div key={cmd.command} className="space-y-2">
              <h3 className="text-lg font-semibold text-green-500">{cmd.command}</h3>
              <p className="text-sm text-muted-foreground">{cmd.description}</p>
              <div className="mt-2 space-y-2">
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Examples:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {cmd.examples.map((example, idx) => (
                    <li key={idx} className="text-sm">
                      <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">"{example}"</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <h3 className="text-base font-semibold mb-2">Tips for Better Recognition</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            <li>Speak clearly and at a normal pace</li>
            <li>Use the exact command phrases shown in the examples</li>
            <li>Reduce background noise when possible</li>
            <li>For task completion or deletion, include a distinctive word from the task title</li>
            <li>If a command isn't recognized, try rephrasing it closer to the examples</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}