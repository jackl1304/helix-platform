import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Database, FolderSync, Clock, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  activeDataSources: number;
  totalUpdates: number;
  recentUpdates: number;
  totalSubscribers: number;
  lastSync?: string;
  sourceGrowth?: number;
  subscriberGrowth?: number;
  urgentApprovals?: number;
}

export function StatusCards() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 30000, // Auto-refresh every 30 seconds for real-time status updates
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-8 w-16 mb-4" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              Failed to load dashboard statistics
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Data Sources Active</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeDataSources}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Database className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">+{stats.sourceGrowth || 0}</span>
            <span className="text-gray-600 ml-1">new sources this week</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Regulatory Updates</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUpdates}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FolderSync className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">Last sync:</span>
            <span className="text-gray-900 ml-1 font-medium">{stats.lastSync}</span>
          </div>
        </CardContent>
      </Card>



      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Subscribers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSubscribers?.toLocaleString() || 0}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">+{stats.subscriberGrowth}%</span>
            <span className="text-gray-600 ml-1">growth this month</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
