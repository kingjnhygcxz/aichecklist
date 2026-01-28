import { useState } from 'react';
import { 
  RobotGreenBlack1, 
  RobotGreenWhite1, 
  RobotGreenBlack2, 
  RobotGreenWhite2, 
  RobotIconSimple,
  RobotIconShowcase 
} from '@/components/icons/RobotIcons';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Download, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function RobotDemo() {
  const [selectedRobot, setSelectedRobot] = useState<string>('RobotGreenBlack1');
  const [copied, setCopied] = useState<string | null>(null);
  const { toast } = useToast();

  const robots = [
    { 
      name: 'RobotGreenBlack1', 
      component: RobotGreenBlack1, 
      label: 'Green & Black v1',
      description: 'Friendly rounded design with antenna'
    },
    { 
      name: 'RobotGreenWhite1', 
      component: RobotGreenWhite1, 
      label: 'Green & White v1',
      description: 'Square design with white body'
    },
    { 
      name: 'RobotGreenBlack2', 
      component: RobotGreenBlack2, 
      label: 'Green & Black v2',
      description: 'Minimalist with signal waves'
    },
    { 
      name: 'RobotGreenWhite2', 
      component: RobotGreenWhite2, 
      label: 'Green & White v2',
      description: 'Extra cute with heart eyes'
    },
    { 
      name: 'RobotIconSimple', 
      component: RobotIconSimple, 
      label: 'Simple Icon',
      description: 'Compact version for small spaces'
    },
  ];

  const copyToClipboard = (text: string, name: string) => {
    navigator.clipboard.writeText(text);
    setCopied(name);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadSVG = (name: string) => {
    // Get the SVG element
    const svgElement = document.querySelector(`#robot-${name} svg`);
    if (!svgElement) return;

    // Convert to string
    const svgString = new XMLSerializer().serializeToString(svgElement);
    
    // Create blob and download
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: `${name}.svg saved`,
    });
  };

  const SelectedComponent = robots.find(r => r.name === selectedRobot)?.component || RobotGreenBlack1;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Robot Icons Collection</h1>
        <p className="text-muted-foreground">Cute robot icons in green/black and green/white color schemes</p>
      </div>

      {/* Main showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Preview panel */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          <div className="flex flex-col items-center justify-center min-h-[300px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg p-8">
            <div id={`robot-${selectedRobot}`}>
              <SelectedComponent size={120} />
            </div>
            <p className="mt-4 font-medium">{robots.find(r => r.name === selectedRobot)?.label}</p>
            <p className="text-sm text-muted-foreground">{robots.find(r => r.name === selectedRobot)?.description}</p>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => downloadSVG(selectedRobot)}
            >
              <Download className="h-4 w-4 mr-2" />
              Download SVG
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => copyToClipboard(
                `import { ${selectedRobot} } from '@/components/icons/RobotIcons';\n\n<${selectedRobot} size={64} />`,
                selectedRobot
              )}
            >
              {copied === selectedRobot ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              Copy Code
            </Button>
          </div>
        </Card>

        {/* Selection grid */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Choose a Robot</h2>
          <div className="grid grid-cols-2 gap-4">
            {robots.map((robot) => {
              const RobotComponent = robot.component;
              return (
                <button
                  key={robot.name}
                  onClick={() => setSelectedRobot(robot.name)}
                  className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                    selectedRobot === robot.name 
                      ? 'border-green-500 bg-green-50 dark:bg-green-950' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <RobotComponent size={60} />
                    <p className="mt-2 text-sm font-medium">{robot.label}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* All versions showcase */}
      <Card className="p-6">
        <RobotIconShowcase />
      </Card>

      {/* Usage instructions */}
      <Card className="p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">How to Use</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">1. Import the icon you want:</h3>
            <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm overflow-x-auto">
              <code>{`import { RobotGreenBlack1 } from '@/components/icons/RobotIcons';`}</code>
            </pre>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">2. Use it in your component:</h3>
            <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm overflow-x-auto">
              <code>{`<RobotGreenBlack1 size={64} />`}</code>
            </pre>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">3. Customize the size:</h3>
            <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-sm overflow-x-auto">
              <code>{`// Small icon
<RobotIconSimple size={24} />

// Large icon
<RobotGreenWhite2 size={128} />

// Default size (64px for most, 32px for simple)
<RobotGreenBlack2 />`}</code>
            </pre>
          </div>
        </div>
      </Card>
    </div>
  );
}