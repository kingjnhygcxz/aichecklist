import React, { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";

// Lightweight sidebar implementation without heavy Radix dependencies
type SidebarContext = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContext | null>(null);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

// Simple sidebar provider
export const SidebarProvider = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}>(({ children, defaultOpen = true, open, onOpenChange, className, ...props }, ref) => {
  const [openState, setOpenState] = useState(defaultOpen);
  const [openMobile, setOpenMobile] = useState(false);
  const isMobile = false; // Simplified for bundle size

  const isOpen = open !== undefined ? open : openState;
  const setIsOpen = onOpenChange || setOpenState;

  const toggleSidebar = () => setIsOpen(!isOpen);

  const contextValue: SidebarContext = {
    state: isOpen ? "expanded" : "collapsed",
    open: isOpen,
    setOpen: setIsOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      <div ref={ref} className={cn("flex", className)} {...props}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
});
SidebarProvider.displayName = "SidebarProvider";

// Simple sidebar components
export const Sidebar = React.forwardRef<HTMLDivElement, React.ComponentProps<"aside">>(
  ({ children, className, ...props }, ref) => (
    <aside
      ref={ref}
      className={cn("w-64 border-r bg-background transition-all duration-300", className)}
      {...props}
    >
      {children}
    </aside>
  )
);
Sidebar.displayName = "Sidebar";

export const SidebarContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col h-full", className)} {...props}>
      {children}
    </div>
  )
);
SidebarContent.displayName = "SidebarContent";

export const SidebarHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={cn("p-4 border-b", className)} {...props}>
      {children}
    </div>
  )
);
SidebarHeader.displayName = "SidebarHeader";

export const SidebarFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={cn("p-4 border-t mt-auto", className)} {...props}>
      {children}
    </div>
  )
);
SidebarFooter.displayName = "SidebarFooter";

export const SidebarGroup = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={cn("px-3 py-2", className)} {...props}>
      {children}
    </div>
  )
);
SidebarGroup.displayName = "SidebarGroup";

export const SidebarGroupLabel = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={cn("text-xs font-medium text-muted-foreground mb-2", className)} {...props}>
      {children}
    </div>
  )
);
SidebarGroupLabel.displayName = "SidebarGroupLabel";

export const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-1", className)} {...props}>
      {children}
    </div>
  )
);
SidebarGroupContent.displayName = "SidebarGroupContent";

export const SidebarMenu = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-1", className)} {...props}>
      {children}
    </div>
  )
);
SidebarMenu.displayName = "SidebarMenu";

export const SidebarMenuItem = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props}>
      {children}
    </div>
  )
);
SidebarMenuItem.displayName = "SidebarMenuItem";

export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button">>(
  ({ children, className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "flex w-full items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors hover:bg-accent hover:text-accent-foreground",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);
SidebarMenuButton.displayName = "SidebarMenuButton";

// Additional simplified exports to match the heavy version
export const SidebarTrigger = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button">>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn("p-2 rounded-md hover:bg-accent", className)}
      {...props}
    >
      ☰
    </button>
  )
);
SidebarTrigger.displayName = "SidebarTrigger";

// Simple separator
export const SidebarSeparator = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("h-px bg-border my-2", className)} {...props} />
  )
);
SidebarSeparator.displayName = "SidebarSeparator";