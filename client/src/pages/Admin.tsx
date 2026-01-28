import { AdminContent } from "@/components/AdminContent";
import { Header } from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";

export function Admin() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Link href="/admin/analytics">
            <Button variant="default">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Analytics
            </Button>
          </Link>
        </div>
        <AdminContent />
      </div>
      <Footer />
    </div>
  );
}

export default Admin;