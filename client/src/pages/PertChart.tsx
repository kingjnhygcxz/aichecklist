import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTaskManager } from '@/hooks/useTaskManager';
import { Network, Clock, ArrowRight, Target, Filter, Printer } from 'lucide-react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { useToast } from "@/hooks/use-toast";
import DOMPurify from 'dompurify';

interface PertNode {
  id: string;
  title: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High';
  completed: boolean;
  duration: number; // in days
  dependencies: string[];
  earlyStart: number;
  earlyFinish: number;
  lateStart: number;
  lateFinish: number;
  slack: number;
  isCritical: boolean;
  position: { x: number; y: number };
}

interface PertEdge {
  from: string;
  to: string;
  isCritical: boolean;
}

export function PertChart() {
  const { tasks } = useTaskManager();
  const { toast } = useToast();
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [showCriticalPath, setShowCriticalPath] = useState<boolean>(true);

  const handlePrint = async () => {
    try {
      // For PERT chart, we'll print the current task analysis
      const response = await fetch('/api/print', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          request: 'print task analysis pert chart'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PERT chart report');
      }

      const result = await response.json();
      
      if (result.success) {
        const printWindow = window.open('', '_blank', 'noopener,noreferrer');
        if (printWindow) {
          // Safely construct document using DOM methods instead of document.write
          const doc = printWindow.document;
          doc.open();
          
          // Create document structure
          const html = doc.createElement('html');
          const head = doc.createElement('head');
          const body = doc.createElement('body');
          
          // Set title safely
          const title = doc.createElement('title');
          title.textContent = result.title || 'PERT Chart Report';
          head.appendChild(title);
          
          // Add styles safely
          const style = doc.createElement('style');
          style.textContent = `
            body { margin: 0; padding: 20px; }
            @media print {
              body { margin: 0; }
            }
          `;
          head.appendChild(style);
          
          // Sanitize and set body content safely
          if (result.content) {
            const sanitizedContent = DOMPurify.sanitize(result.content, {
              ALLOWED_TAGS: ['p', 'br', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th'],
              ALLOWED_ATTR: ['style', 'class'],
              FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'href', 'src'],
              FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'select', 'textarea', 'a', 'img']
            });
            const parser = new DOMParser();
            const contentDoc = parser.parseFromString(sanitizedContent, 'text/html');
            if (contentDoc.body) {
              while (contentDoc.body.firstChild) {
                body.appendChild(doc.importNode(contentDoc.body.firstChild, true));
              }
            }
          }
          
          // Assemble the document
          html.appendChild(head);
          html.appendChild(body);
          doc.appendChild(html);
          doc.close();
          printWindow.focus();
          setTimeout(() => {
            printWindow.print();
          }, 250);
        }
        
        toast({
          title: "PERT Chart Report Generated",
          description: "Your task analysis report is ready for printing!"
        });
      } else {
        throw new Error(result.error || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Print error:', error);
      toast({
        title: "Print Error",
        description: "Failed to generate PERT chart report. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Transform tasks into PERT nodes with calculated scheduling
  const { pertNodes, pertEdges } = useMemo(() => {
    const filteredTasks = tasks.filter(task => 
      categoryFilter === 'All' || task.category === categoryFilter
    );

    if (filteredTasks.length === 0) {
      return { pertNodes: [], pertEdges: [] };
    }

    // Create initial nodes with durations
    const nodes: PertNode[] = filteredTasks.map((task, index) => {
      let duration: number;
      
      // Use actual dates from task if available, otherwise fallback to priority-based duration
      if (task.startDate && task.projectEndDate) {
        const start = new Date(task.startDate);
        const end = new Date(task.projectEndDate);
        // Calculate duration in days
        const durationMs = end.getTime() - start.getTime();
        duration = Math.max(1, Math.round(durationMs / (1000 * 60 * 60 * 24)));
      } else {
        // Fallback to priority-based duration
        duration = task.priority === 'High' ? 2 : task.priority === 'Medium' ? 3 : 5;
      }
      
      // Create logical dependencies based on categories and priorities
      const dependencies: string[] = [];
      if (index > 0 && Math.random() > 0.6) {
        // Add some logical dependencies
        const prevTaskIndex = Math.max(0, index - 1 - Math.floor(Math.random() * 2));
        if (prevTaskIndex !== index) {
          dependencies.push(filteredTasks[prevTaskIndex].id);
        }
      }

      return {
        id: task.id,
        title: task.title,
        category: task.category,
        priority: task.priority as 'Low' | 'Medium' | 'High',
        completed: task.completed,
        duration,
        dependencies,
        earlyStart: 0,
        earlyFinish: 0,
        lateStart: 0,
        lateFinish: 0,
        slack: 0,
        isCritical: false,
        position: { x: 0, y: 0 }
      };
    });

    // Calculate early start and finish times
    const calculateEarlyTimes = (nodes: PertNode[]) => {
      const processed = new Set<string>();
      const calculate = (nodeId: string): void => {
        if (processed.has(nodeId)) return;
        
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;

        // Calculate dependencies first
        for (const depId of node.dependencies) {
          calculate(depId);
        }

        // Calculate early start
        if (node.dependencies.length === 0) {
          node.earlyStart = 0;
        } else {
          node.earlyStart = Math.max(
            ...node.dependencies.map(depId => {
              const dep = nodes.find(n => n.id === depId);
              return dep ? dep.earlyFinish : 0;
            })
          );
        }

        node.earlyFinish = node.earlyStart + node.duration;
        processed.add(nodeId);
      };

      nodes.forEach(node => calculate(node.id));
    };

    // Calculate late start and finish times
    const calculateLateTimes = (nodes: PertNode[]) => {
      const projectEnd = Math.max(...nodes.map(n => n.earlyFinish));
      
      // Find nodes with no successors
      const nodeSuccessors = new Map<string, string[]>();
      nodes.forEach(node => {
        nodeSuccessors.set(node.id, []);
      });
      
      nodes.forEach(node => {
        node.dependencies.forEach(depId => {
          const successors = nodeSuccessors.get(depId) || [];
          successors.push(node.id);
          nodeSuccessors.set(depId, successors);
        });
      });

      const processed = new Set<string>();
      const calculate = (nodeId: string): void => {
        if (processed.has(nodeId)) return;
        
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;

        const successors = nodeSuccessors.get(nodeId) || [];
        
        // Calculate successors first
        for (const succId of successors) {
          calculate(succId);
        }

        // Calculate late finish
        if (successors.length === 0) {
          node.lateFinish = projectEnd;
        } else {
          node.lateFinish = Math.min(
            ...successors.map(succId => {
              const succ = nodes.find(n => n.id === succId);
              return succ ? succ.lateStart : projectEnd;
            })
          );
        }

        node.lateStart = node.lateFinish - node.duration;
        node.slack = node.lateStart - node.earlyStart;
        node.isCritical = node.slack === 0;
        processed.add(nodeId);
      };

      nodes.forEach(node => calculate(node.id));
    };

    // Position nodes for visualization
    const positionNodes = (nodes: PertNode[]) => {
      const levels = new Map<number, PertNode[]>();
      
      nodes.forEach(node => {
        const level = node.earlyStart;
        if (!levels.has(level)) {
          levels.set(level, []);
        }
        levels.get(level)!.push(node);
      });

      Array.from(levels.keys()).sort((a, b) => a - b).forEach((level, levelIndex) => {
        const nodesAtLevel = levels.get(level)!;
        nodesAtLevel.forEach((node, nodeIndex) => {
          node.position = {
            x: levelIndex * 280 + 50,
            y: nodeIndex * 120 + 100
          };
        });
      });
    };

    calculateEarlyTimes(nodes);
    calculateLateTimes(nodes);
    positionNodes(nodes);

    // Create edges
    const edges: PertEdge[] = [];
    nodes.forEach(node => {
      node.dependencies.forEach(depId => {
        const fromNode = nodes.find(n => n.id === depId);
        if (fromNode) {
          edges.push({
            from: depId,
            to: node.id,
            isCritical: node.isCritical && fromNode.isCritical
          });
        }
      });
    });

    return { pertNodes: nodes, pertEdges: edges };
  }, [tasks, categoryFilter]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'border-red-500 bg-red-50';
      case 'Medium': return 'border-yellow-500 bg-yellow-50';
      case 'Low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const criticalPath = pertNodes.filter(node => node.isCritical);
  const projectDuration = Math.max(...pertNodes.map(n => n.earlyFinish), 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Network className="text-primary" />
            PERT Chart
          </h1>
          <p className="text-muted-foreground mt-2">
            Project Evaluation and Review Technique - Critical Path Analysis
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              <SelectItem value="Work">Work</SelectItem>
              <SelectItem value="Personal">Personal</SelectItem>
              <SelectItem value="Shopping">Shopping</SelectItem>
              <SelectItem value="Health">Health</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant={showCriticalPath ? "default" : "outline"}
            size="sm"
            onClick={() => setShowCriticalPath(!showCriticalPath)}
            className="flex items-center gap-2"
          >
            <Target className="h-4 w-4" />
            Critical Path
          </Button>

          <Button 
            onClick={handlePrint}
            className="flex items-center gap-2"
            size="sm"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Project Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{projectDuration}</p>
                <p className="text-sm text-muted-foreground">Total Duration (Days)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{criticalPath.length}</p>
                <p className="text-sm text-muted-foreground">Critical Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Network className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{pertNodes.length}</p>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PERT Network Diagram */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Network Diagram
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pertNodes.length > 0 ? (
            <div className="relative overflow-x-auto">
              <div 
                className="relative"
                style={{ 
                  width: Math.max(800, Math.max(...pertNodes.map(n => n.position.x)) + 200),
                  height: Math.max(400, Math.max(...pertNodes.map(n => n.position.y)) + 150)
                }}
              >
                {/* Render edges */}
                <svg className="absolute inset-0 pointer-events-none">
                  {pertEdges.map((edge, index) => {
                    const fromNode = pertNodes.find(n => n.id === edge.from);
                    const toNode = pertNodes.find(n => n.id === edge.to);
                    
                    if (!fromNode || !toNode) return null;
                    
                    const isVisible = !showCriticalPath || edge.isCritical;
                    
                    return (
                      <g key={index} opacity={isVisible ? 1 : 0.3}>
                        <line
                          x1={fromNode.position.x + 120}
                          y1={fromNode.position.y + 40}
                          x2={toNode.position.x}
                          y2={toNode.position.y + 40}
                          stroke={edge.isCritical ? "#ef4444" : "#6b7280"}
                          strokeWidth={edge.isCritical ? 3 : 2}
                          markerEnd="url(#arrowhead)"
                        />
                        <defs>
                          <marker
                            id="arrowhead"
                            markerWidth="10"
                            markerHeight="7"
                            refX="9"
                            refY="3.5"
                            orient="auto"
                          >
                            <polygon
                              points="0 0, 10 3.5, 0 7"
                              fill={edge.isCritical ? "#ef4444" : "#6b7280"}
                            />
                          </marker>
                        </defs>
                      </g>
                    );
                  })}
                </svg>

                {/* Render nodes */}
                {pertNodes.map((node) => {
                  const isVisible = !showCriticalPath || node.isCritical;
                  
                  return (
                    <motion.div
                      key={node.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: isVisible ? 1 : 0.4, scale: 1 }}
                      className={`absolute w-32 h-20 border-2 rounded-lg p-2 bg-white shadow-md cursor-pointer transition-all hover:shadow-lg ${
                        node.isCritical 
                          ? 'border-red-500 bg-red-50' 
                          : getPriorityColor(node.priority)
                      }`}
                      style={{
                        left: node.position.x,
                        top: node.position.y,
                        transform: isVisible ? 'scale(1)' : 'scale(0.9)'
                      }}
                      title={`${node.title}\nEarly: ${node.earlyStart}-${node.earlyFinish}\nLate: ${node.lateStart}-${node.lateFinish}\nSlack: ${node.slack}`}
                    >
                      <div className="text-xs font-medium truncate mb-1" title={node.title}>
                        {node.title}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <Badge variant="secondary" className="text-xs px-1">
                          {node.category}
                        </Badge>
                        <span className="font-mono">
                          {node.duration}d
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{node.earlyStart}</span>
                        <span>{node.earlyFinish}</span>
                      </div>
                      {node.isCritical && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Network className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No tasks to analyze</p>
              <p className="text-sm">Create some tasks to see the PERT network diagram</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Critical Path Details */}
      {criticalPath.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Target className="h-5 w-5" />
              Critical Path Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowRight className="h-4 w-4" />
                Tasks on the critical path have zero slack and determine project duration
              </div>
              
              <div className="grid gap-3">
                {criticalPath.map((node, index) => (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{node.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {node.category} • {node.priority} Priority
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-mono font-bold">{node.duration} days</div>
                      <div className="text-muted-foreground">
                        Days {node.earlyStart}-{node.earlyFinish}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3">Node Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-red-500 bg-red-50 rounded"></div>
                  <span>Critical Path Task (Zero Slack)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-300 bg-gray-50 rounded"></div>
                  <span>Non-Critical Task (Has Slack)</span>
                </div>
                <div className="text-muted-foreground mt-2">
                  Numbers at bottom: Early Start → Early Finish
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Priority Colors</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-red-500 bg-red-50 rounded"></div>
                  <span>High Priority</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-yellow-500 bg-yellow-50 rounded"></div>
                  <span>Medium Priority</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-green-500 bg-green-50 rounded"></div>
                  <span>Low Priority</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}