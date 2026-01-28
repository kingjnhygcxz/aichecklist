import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Chrome, Download, Bookmark, Zap, MessageSquare, CheckCircle2, ArrowRight, Sparkles, Mic, Calendar, FileText, Play, Smartphone, Globe } from "lucide-react";
import { SiFirefox, SiSafari } from "@/components/icons/BrandIcons";
import Logo from "@/components/Logo";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function Extension() {
  const { toast } = useToast();
  const bookmarkletCode = `javascript:void(function(){var s=document.createElement('script');s.src='${window.location.origin}/aidomo-loader.js';document.body.appendChild(s);})();`;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/uri-list', bookmarkletCode);
    e.dataTransfer.setData('text/plain', bookmarkletCode);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(bookmarkletCode);
    toast({ title: "Copied!", description: "Bookmarklet code copied to clipboard" });
  };

  const loadDemo = () => {
    const script = document.createElement('script');
    script.src = `${window.location.origin}/aidomo-loader.js`;
    document.body.appendChild(script);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDemo();
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <span className="text-xl font-semibold">AIChecklist</span>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm">
              Back to App
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Voice-Powered Browser Extension
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            "Hey Domo" - Your AI Assistant Everywhere
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Say "Hey Domo" on any webpage to add tasks, bookmark pages, schedule events, 
            and save content - completely hands-free.
          </p>
          <Button size="lg" onClick={loadDemo} className="gap-2 bg-primary hover:bg-primary/90">
            <Play className="h-5 w-5" />
            Show Demo Bar
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            The drop-down bar appears at the top of this page!
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Mic className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Voice Commands</CardTitle>
              <CardDescription>
                Say "Hey Domo" followed by any command - no typing needed.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Calendar Events</CardTitle>
              <CardDescription>
                "Add 3pm lunch meeting to my calendar" - instantly scheduled.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Bookmark className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Clip Pages</CardTitle>
              <CardDescription>
                "Bookmark this page" or "Clip this" - saved to your account.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Save Selections</CardTitle>
              <CardDescription>
                Select text and say "Save to file" - content captured instantly.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 mb-16">
          <CardContent className="pt-6">
            <h3 className="text-xl font-bold mb-4 text-center">Try These Voice Commands</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-background/50 rounded-lg p-4">
                <p className="font-mono text-sm text-primary mb-1">"Hey Domo..."</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• "Add buy groceries to my tasks"</li>
                  <li>• "Put 3pm lunch with John on my calendar"</li>
                  <li>• "Schedule a meeting tomorrow at 10am"</li>
                  <li>• "Remind me to call mom"</li>
                </ul>
              </div>
              <div className="bg-background/50 rounded-lg p-4">
                <p className="font-mono text-sm text-primary mb-1">"Hey Domo..."</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• "Bookmark this page"</li>
                  <li>• "Clip this page"</li>
                  <li>• "Save this to my bookmarks"</li>
                  <li>• (Select text) "Save to file"</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-6">Choose Your Browser</h2>
        </div>

        <Card className="bg-card border-border overflow-hidden mb-8">
          <CardHeader className="bg-gradient-to-br from-primary/20 to-primary/5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center">
                <Globe className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl">Universal Bookmarklet</CardTitle>
                <CardDescription>Works on all browsers - Chrome, Firefox, Safari, Edge, and more</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Show your bookmarks bar: <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl+Shift+B</kbd> (or <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Cmd+Shift+B</kbd> on Mac)
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Drag this button to your bookmarks bar:
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center">
                <a
                  href={bookmarkletCode}
                  draggable="true"
                  onDragStart={handleDragStart}
                  onClick={(e) => e.preventDefault()}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg cursor-grab hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  <Mic className="h-5 w-5" />
                  AIDomo
                </a>
                <p className="text-xs text-muted-foreground mt-2">← Drag me to bookmarks!</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex gap-4">
              <Button variant="outline" size="sm" onClick={copyToClipboard} className="flex-1">
                Copy Bookmarklet Code
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="bg-card border-border overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Chrome className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Chrome Extension</CardTitle>
                  <CardDescription>Auto-loads on every page</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3 text-sm text-muted-foreground mb-4">
                <p>1. Download & extract ZIP</p>
                <p>2. Go to <code className="px-1 py-0.5 bg-muted rounded text-xs">chrome://extensions</code></p>
                <p>3. Enable "Developer mode"</p>
                <p>4. Click "Load unpacked"</p>
              </div>
              <a href="/chrome-extension.zip" download>
                <Button variant="secondary" className="w-full" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download for Chrome
                </Button>
              </a>
            </CardContent>
          </Card>

          <Card className="bg-card border-border overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <SiFirefox className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Firefox Extension</CardTitle>
                  <CardDescription>Auto-loads on every page</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3 text-sm text-muted-foreground mb-4">
                <p>1. Download & extract ZIP</p>
                <p>2. Go to <code className="px-1 py-0.5 bg-muted rounded text-xs">about:debugging</code></p>
                <p>3. Click "This Firefox"</p>
                <p>4. Click "Load Temporary Add-on"</p>
              </div>
              <a href="/firefox-extension.zip" download>
                <Button variant="secondary" className="w-full" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download for Firefox
                </Button>
              </a>
            </CardContent>
          </Card>

          <Card className="bg-card border-border overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-gray-500/10 to-gray-500/5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gray-500/20 flex items-center justify-center">
                  <Smartphone className="h-6 w-6 text-gray-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">iOS Safari</CardTitle>
                  <CardDescription>Use bookmarklet method</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3 text-sm text-muted-foreground mb-4">
                <p>1. Tap Share → Add Bookmark</p>
                <p>2. Edit the bookmark</p>
                <p>3. Replace URL with code below</p>
                <p>4. Tap bookmark on any page</p>
              </div>
              <Button variant="secondary" className="w-full" size="sm" onClick={copyToClipboard}>
                <Download className="h-4 w-4 mr-2" />
                Copy Bookmarklet Code
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Note: Voice features require microphone permission
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to go hands-free?</h2>
          <p className="text-muted-foreground mb-6">
            Add AIDomo to your browser and start managing tasks with your voice.
          </p>
          <Link href="/">
            <Button size="lg" className="gap-2">
              Go to AIChecklist
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </main>

      <footer className="border-t border-border py-8 mt-16">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} AIChecklist.io. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
