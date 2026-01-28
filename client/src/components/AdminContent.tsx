import { LogViewer } from "@/components/admin/LogViewer";
import { ApiKeysManager } from "@/components/admin/ApiKeysManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AdminContent() {
  return (
    <div className="w-full">
      <Tabs defaultValue="api-keys" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="api-keys">
          <ApiKeysManager />
        </TabsContent>
        
        <TabsContent value="logs">
          <LogViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdminContent;