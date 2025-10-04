import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BarChart, Bug, ShieldCheck, Paintbrush, Award } from "lucide-react";
import UserManagement from "@/components/UserManagement";
import SiteAnalytics from "@/components/SiteAnalytics";
import BugReports from "@/components/BugReports";
import SystemStatus from "@/components/SystemStatus";
import CardTypeCreator from "@/components/CardTypeCreator"; // Restored
import AchievementCreator from "@/components/AchievementCreator"; // Restored

const Admin = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-primary" />
          Admin Panel
        </h1>
        <p className="text-muted-foreground">Site-wide management and analytics.</p>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <div className="overflow-x-auto pb-2">
            <TabsList className="inline-flex w-max">
                <TabsTrigger value="users"><Users className="h-4 w-4 mr-2" />User Management</TabsTrigger>
                <TabsTrigger value="analytics"><BarChart className="h-4 w-4 mr-2" />Site Analytics</TabsTrigger>
                <TabsTrigger value="bugs"><Bug className="h-4 w-4 mr-2" />Bug Reports</TabsTrigger>
                <TabsTrigger value="status"><ShieldCheck className="h-4 w-4 mr-2" />System Status</TabsTrigger>
                <TabsTrigger value="card-types"><Paintbrush className="h-4 w-4 mr-2" />Card Types</TabsTrigger>
                <TabsTrigger value="achievements"><Award className="h-4 w-4 mr-2" />Achievements</TabsTrigger>
            </TabsList>
        </div>

        <TabsContent value="users" className="mt-6"><UserManagement /></TabsContent>
        <TabsContent value="analytics" className="mt-6"><SiteAnalytics /></TabsContent>
        <TabsContent value="bugs" className="mt-6"><BugReports /></TabsContent>
        <TabsContent value="status" className="mt-6"><SystemStatus /></TabsContent>
        <TabsContent value="card-types" className="mt-6"><CardTypeCreator /></TabsContent>
        <TabsContent value="achievements" className="mt-6"><AchievementCreator /></TabsContent>
      </Tabs>
    </div>
  );
};

// Mock Components (as the originals were not provided)
const UserManagement = () => <Card><CardHeader><CardTitle>User Management</CardTitle></CardHeader><CardContent><p>Manage all registered users.</p></CardContent></Card>;
const SiteAnalytics = () => <Card><CardHeader><CardTitle>Site Analytics</CardTitle></CardHeader><CardContent><p>Overview of site usage and key metrics.</p></CardContent></Card>;
const BugReports = () => <Card><CardHeader><CardTitle>Bug Reports</CardTitle></CardHeader><CardContent><p>Review and manage user-submitted bug reports.</p></CardContent></Card>;
const SystemStatus = () => <Card><CardHeader><CardTitle>System Status</CardTitle></CardHeader><CardContent><p>Check the health of your database and services.</p></CardContent></Card>;

export default Admin;
