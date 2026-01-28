import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Type, Save, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function GeneralSettings() {
  const { toast } = useToast();
  const [textSize, setTextSize] = useState<number>(() => {
    const savedSize = localStorage.getItem('textSize');
    return savedSize ? parseInt(savedSize) : 100;
  });
  const [hasChanges, setHasChanges] = useState(false);
  const defaultSize = 100;

  // Apply text size to the document
  useEffect(() => {
    document.documentElement.style.fontSize = `${textSize}%`;
  }, [textSize]);

  const handleTextSizeChange = (value: number[]) => {
    setTextSize(value[0]);
    setHasChanges(true);
  };

  const handleSave = () => {
    localStorage.setItem('textSize', textSize.toString());
    document.documentElement.style.fontSize = `${textSize}%`;
    setHasChanges(false);
    toast({
      title: "Settings Saved",
      description: `Text size set to ${textSize}%`,
    });
  };

  const handleReset = () => {
    setTextSize(defaultSize);
    document.documentElement.style.fontSize = `${defaultSize}%`;
    localStorage.setItem('textSize', defaultSize.toString());
    setHasChanges(false);
    toast({
      title: "Settings Reset",
      description: "Text size has been reset to default",
    });
  };

  const getSizeLabel = (size: number) => {
    if (size < 90) return "Small";
    if (size < 100) return "Normal";
    if (size === 100) return "Default";
    if (size < 120) return "Large";
    if (size < 140) return "Extra Large";
    return "Maximum";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="h-5 w-5" />
          General Settings
        </CardTitle>
        <CardDescription>
          Customize your application preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text-size" className="text-base font-medium">
              Text Size
            </Label>
            <p className="text-sm text-muted-foreground">
              Adjust the size of text throughout the application
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-semibold">{textSize}%</span>
              <span className="text-sm text-muted-foreground px-3 py-1 bg-muted rounded-md">
                {getSizeLabel(textSize)}
              </span>
            </div>
            
            <Slider
              id="text-size"
              min={80}
              max={150}
              step={5}
              value={[textSize]}
              onValueChange={handleTextSizeChange}
              className="w-full"
            />
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>80%</span>
              <span>100% (Default)</span>
              <span>150%</span>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">Preview</p>
            <p style={{ fontSize: `${textSize / 100}rem` }}>
              This is how your text will appear with the current size setting.
            </p>
            <p style={{ fontSize: `${textSize / 100 * 0.875}rem` }} className="text-muted-foreground">
              Smaller text elements will scale proportionally.
            </p>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
          <Button 
            onClick={handleReset}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Default
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}