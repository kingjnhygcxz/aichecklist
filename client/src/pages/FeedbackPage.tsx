import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, Star, Plus, X, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";

const feedbackSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  category: z.enum(["feature", "bug", "improvement", "general"], {
    required_error: "Please select a feedback category",
  }),
  rating: z.enum(["1", "2", "3", "4", "5"], {
    required_error: "Please select a rating",
  }),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

const taskSchema = z.object({
  title: z.string().min(2, "Task title must be at least 2 characters"),
  category: z.enum(["Work", "Personal", "Shopping", "Health", "Business", "Other"]),
  priority: z.enum(["Low", "Medium", "High"]),
  timer: z.number().optional(),
  scheduledDaysFromNow: z.number().optional(),
});

const templateSchema = z.object({
  name: z.string().min(3, "Template name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum([
    "Personal Productivity", "Project Management", "Security & Compliance", 
    "Executive Leadership", "Health & Wellness", "Academic & Research",
    "Operations & Management", "Neurodiverse-Friendly"
  ]),
  tags: z.string().optional(),
  tasks: z.array(taskSchema).min(1, "Template must have at least 1 task"),
  submitterName: z.string().min(2, "Your name is required"),
  submitterEmail: z.string().email("Please enter a valid email address"),
});

type FeedbackForm = z.infer<typeof feedbackSchema>;
type TemplateForm = z.infer<typeof templateSchema>;
type TaskForm = z.infer<typeof taskSchema>;

export function FeedbackPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState("feedback");
  const [tasks, setTasks] = useState<TaskForm[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<FeedbackForm>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      name: "",
      email: "",
      category: undefined,
      rating: undefined,
      subject: "",
      message: "",
    },
  });

  const templateForm = useForm<TemplateForm>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      description: "",
      category: undefined,
      tags: "",
      tasks: [],
      submitterName: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : "",
      submitterEmail: user?.email || "",
    },
  });

  const onSubmit = async (data: FeedbackForm) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      setIsSubmitted(true);
      form.reset();
      toast({
        title: "Feedback submitted!",
        description: "Thank you for your feedback. We'll review it and get back to you soon.",
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Submission failed",
        description: "We couldn't submit your feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onTemplateSubmit = async (data: TemplateForm) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/community-templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          tasks: tasks,
          tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
          submittedByUserId: user?.id,
          submittedByName: data.submitterName,
          submittedByEmail: data.submitterEmail
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit template");
      }

      setIsSubmitted(true);
      templateForm.reset();
      setTasks([]);
      toast({
        title: "Template submitted!",
        description: "Thank you for sharing your template. We'll review it and add it to our community collection soon.",
      });
    } catch (error) {
      console.error("Error submitting template:", error);
      toast({
        title: "Submission failed",
        description: "We couldn't submit your template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTask = () => {
    setTasks([...tasks, {
      title: "",
      category: "Work",
      priority: "Medium",
    }]);
  };

  const updateTask = (index: number, updatedTask: TaskForm) => {
    const newTasks = [...tasks];
    newTasks[index] = updatedTask;
    setTasks(newTasks);
    templateForm.setValue('tasks', newTasks);
  };

  const removeTask = (index: number) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
    templateForm.setValue('tasks', newTasks);
  };

  const categoryOptions = [
    { value: "feature", label: "Feature Request" },
    { value: "bug", label: "Bug Report" },
    { value: "improvement", label: "Improvement Suggestion" },
    { value: "general", label: "General Feedback" },
  ];

  const ratingOptions = [
    { value: "1", label: "1 Star - Poor" },
    { value: "2", label: "2 Stars - Fair" },
    { value: "3", label: "3 Stars - Good" },
    { value: "4", label: "4 Stars - Very Good" },
    { value: "5", label: "5 Stars - Excellent" },
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 p-4">
          <div className="mx-auto max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-20"
            >
              <div className="mb-6 text-green-500">
                <MessageSquare className="h-16 w-16 mx-auto" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
              <p className="text-muted-foreground mb-8">
                Your feedback has been submitted successfully. We appreciate your input and will review it carefully.
              </p>
              <Button 
                onClick={() => setIsSubmitted(false)}
                variant="outline"
              >
                Submit Another Feedback
              </Button>
            </motion.div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 p-4">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="mt-8">
              <CardHeader className="text-center">
                <div className="mb-4 text-primary">
                  <MessageSquare className="h-12 w-12 mx-auto" />
                </div>
                <CardTitle className="text-2xl">Share Your Feedback</CardTitle>
                <CardDescription>
                  Help us improve AIChecklist by sharing your thoughts, suggestions, and ideas.
                  Your feedback is valuable to us!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="your.email@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select feedback type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categoryOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Overall Rating</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Rate your experience" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {ratingOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    <div className="flex items-center gap-2">
                                      <Star className="h-4 w-4 text-yellow-500" />
                                      {option.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="Brief summary of your feedback" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Please share your detailed feedback, suggestions, or ideas..."
                              className="min-h-32"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Submit Feedback
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <div className="mt-8 space-y-4 text-center text-sm">
              <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                      <span className="font-semibold text-amber-900">Special Offer</span>
                      <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    </div>
                    <div className="space-y-2 text-amber-800">
                      <p>
                        <span className="font-medium">Pro Access:</span> Post a video about your favorite feature → 1 month free
                      </p>
                      <p>
                        <span className="font-medium">Team Access:</span> Post 2 videos (1 minute+ comprehensive) → 1 month free
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <p className="text-muted-foreground">
                Built with ❤️ by{" "}
                <span className="font-semibold text-foreground">AIChecklist.io™</span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}