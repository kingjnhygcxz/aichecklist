import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
  Eye,
  UserPlus,
  LogIn,
  CheckSquare,
  Brain,
  DollarSign,
  Clock,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  RefreshCw,
  Share2,
  Check,
  X,
  CalendarDays,
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function AdminAnalytics() {
  const [dateRange, setDateRange] = useState('7days');
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch dashboard data
  const { data: dashboard, isLoading: dashboardLoading, refetch: refetchDashboard } = useQuery({
    queryKey: ['/api/analytics/dashboard', refreshKey],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Calculate date range for detailed analytics
  const getDateRange = () => {
    const end = endOfDay(new Date());
    let start;
    switch (dateRange) {
      case 'today':
        start = startOfDay(new Date());
        break;
      case '7days':
        start = startOfDay(subDays(new Date(), 7));
        break;
      case '30days':
        start = startOfDay(subDays(new Date(), 30));
        break;
      case '90days':
        start = startOfDay(subDays(new Date(), 90));
        break;
      default:
        start = startOfDay(subDays(new Date(), 7));
    }
    return { start, end };
  };

  const { start, end } = getDateRange();

  // Fetch detailed site analytics
  const { data: siteAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/analytics/site', { startDate: start.toISOString(), endDate: end.toISOString() }],
    enabled: !!dashboard,
  });

  // Fetch visitor sessions
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['/api/analytics/sessions', { startDate: start.toISOString(), endDate: end.toISOString() }],
    enabled: !!dashboard,
  });

  // Fetch page views
  const { data: pageViews } = useQuery({
    queryKey: ['/api/analytics/pageviews'],
    enabled: !!dashboard,
  });

  // Fetch schedule sharing analytics
  const { data: sharingSummary, isLoading: sharingLoading } = useQuery<{
    summary: { totalShares: number; activeShares: number; pendingShares: number; acceptedShares: number; declinedShares: number };
    permissions: { viewOnly: number; canEdit: number; fullAccess: number };
    shareTypes: { fullSchedule: number; selective: number };
    recentActivity: { newSharesLast7Days: number; acceptedLast7Days: number };
  }>({
    queryKey: ['/api/schedule-shares/admin/summary'],
  });

  const { data: sharingTimeline } = useQuery<{
    timeline: { date: string; created: number; accepted: number; declined: number }[];
  }>({
    queryKey: ['/api/schedule-shares/admin/timeline', { days: 30 }],
  });

  const { data: sharingList } = useQuery<{
    shares: {
      id: number;
      ownerUserId: number;
      ownerUsername: string;
      sharedWithUserId: number;
      sharedWithUsername: string;
      permission: string;
      shareType: string;
      isActive: boolean;
      acceptedAt: string | null;
      message: string | null;
      createdAt: string;
    }[];
    pagination: { limit: number; offset: number; total: number };
  }>({
    queryKey: ['/api/schedule-shares/admin/list', { limit: 20 }],
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetchDashboard();
  };

  // Calculate percentage changes
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  // Format revenue
  const formatRevenue = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  // Prepare chart data
  const prepareChartData = () => {
    if (!siteAnalytics) return [];
    
    return siteAnalytics.map(day => ({
      date: format(new Date(day.date), 'MMM dd'),
      visitors: day.visitors,
      pageViews: day.pageViews,
      signups: day.signups,
      tasks: day.tasksCreated,
      revenue: day.revenue / 100,
    }));
  };

  // Device distribution
  const getDeviceDistribution = () => {
    if (!sessions) return [];
    
    const devices = sessions.reduce((acc: any, session: any) => {
      const device = session.device || 'desktop';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(devices).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  };

  if (dashboardLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const chartData = prepareChartData();
  const deviceData = getDeviceDistribution();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Monitor site performance and user engagement</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.today?.visitors || 0}</div>
            <p className="text-xs text-muted-foreground">
              {Number(calculateChange(dashboard?.today?.visitors || 0, dashboard?.yesterday?.visitors || 0)) > 0 ? (
                <span className="text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {calculateChange(dashboard?.today?.visitors || 0, dashboard?.yesterday?.visitors || 0)}% from yesterday
                </span>
              ) : (
                <span className="text-red-600 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" />
                  {calculateChange(dashboard?.today?.visitors || 0, dashboard?.yesterday?.visitors || 0)}% from yesterday
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Currently online (last 30 min)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Signups</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.today?.signups || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboard?.last7Days?.signups || 0} in last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatRevenue(dashboard?.today?.revenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatRevenue(dashboard?.last30Days?.revenue || 0)} last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.today?.pageViews || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboard?.last7Days?.pageViews || 0} in last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Created</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.today?.tasksCreated || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboard?.today?.tasksCompleted || 0} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Interactions</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.today?.aiInteractions || 0}</div>
            <p className="text-xs text-muted-foreground">
              AIDOMO queries today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Registered accounts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="traffic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="pages">Top Pages</TabsTrigger>
          <TabsTrigger value="sharing">Schedule Sharing</TabsTrigger>
        </TabsList>

        <TabsContent value="traffic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visitor Traffic</CardTitle>
              <CardDescription>Daily visitors and page views</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="visitors" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="pageViews" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Engagement</CardTitle>
              <CardDescription>Signups and task activity</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="signups" stroke="#8884d8" />
                  <Line type="monotone" dataKey="tasks" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Daily revenue from subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatRevenue(Number(value) * 100)} />
                  <Bar dataKey="revenue" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Device Distribution</CardTitle>
              <CardDescription>Breakdown by device type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Pages</CardTitle>
              <CardDescription>Most visited pages in the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboard?.topPages?.map((page: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{page.path}</TableCell>
                      <TableCell className="text-right">{page.views}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sharing" className="space-y-4">
          {sharingLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
                    <Share2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{sharingSummary?.summary.totalShares || 0}</div>
                    <p className="text-xs text-muted-foreground">All time shares created</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Shares</CardTitle>
                    <Activity className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{sharingSummary?.summary.activeShares || 0}</div>
                    <p className="text-xs text-muted-foreground">Currently active</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    <Clock className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">{sharingSummary?.summary.pendingShares || 0}</div>
                    <p className="text-xs text-muted-foreground">Awaiting response</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Accepted</CardTitle>
                    <Check className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{sharingSummary?.summary.acceptedShares || 0}</div>
                    <p className="text-xs text-muted-foreground">Accepted shares</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Declined</CardTitle>
                    <X className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{sharingSummary?.summary.declinedShares || 0}</div>
                    <p className="text-xs text-muted-foreground">Declined/removed</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarDays className="h-5 w-5" />
                      Permission Levels
                    </CardTitle>
                    <CardDescription>Distribution of share permissions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'View Only', value: sharingSummary?.permissions.viewOnly || 0 },
                            { name: 'Can Edit', value: sharingSummary?.permissions.canEdit || 0 },
                            { name: 'Full Access', value: sharingSummary?.permissions.fullAccess || 0 },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#3b82f6" />
                          <Cell fill="#22c55e" />
                          <Cell fill="#f59e0b" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Share Types</CardTitle>
                    <CardDescription>Full schedule vs selective sharing</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={[
                        { name: 'Full Schedule', count: sharingSummary?.shareTypes.fullSchedule || 0 },
                        { name: 'Selective', count: sharingSummary?.shareTypes.selective || 0 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Sharing Activity Timeline (Last 30 Days)</CardTitle>
                  <CardDescription>Created, accepted, and declined shares over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={sharingTimeline?.timeline || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), 'MMM d')} />
                      <YAxis />
                      <Tooltip labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')} />
                      <Legend />
                      <Line type="monotone" dataKey="created" stroke="#3b82f6" name="Created" />
                      <Line type="monotone" dataKey="accepted" stroke="#22c55e" name="Accepted" />
                      <Line type="monotone" dataKey="declined" stroke="#ef4444" name="Declined" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Shares</CardTitle>
                  <CardDescription>Latest schedule sharing activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Owner</TableHead>
                        <TableHead>Shared With</TableHead>
                        <TableHead>Permission</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sharingList?.shares?.slice(0, 10).map((share) => (
                        <TableRow key={share.id} data-testid={`row-share-${share.id}`}>
                          <TableCell className="font-medium">{share.ownerUsername}</TableCell>
                          <TableCell>{share.sharedWithUsername}</TableCell>
                          <TableCell>
                            <Badge variant={share.permission === 'full' ? 'destructive' : share.permission === 'edit' ? 'default' : 'secondary'}>
                              {share.permission === 'view' ? 'View Only' : share.permission === 'edit' ? 'Can Edit' : 'Full Access'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {share.shareType === 'full' ? 'Full Schedule' : 'Selective'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {!share.isActive ? (
                              <Badge variant="destructive">Declined</Badge>
                            ) : share.acceptedAt ? (
                              <Badge variant="default" className="bg-green-600">Accepted</Badge>
                            ) : (
                              <Badge variant="secondary">Pending</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(share.createdAt), 'MMM d, yyyy HH:mm')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-blue-50 dark:bg-blue-900/20">
                  <CardHeader>
                    <CardTitle className="text-lg">7-Day Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-around">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">{sharingSummary?.recentActivity.newSharesLast7Days || 0}</div>
                        <div className="text-sm text-muted-foreground">New Shares</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">{sharingSummary?.recentActivity.acceptedLast7Days || 0}</div>
                        <div className="text-sm text-muted-foreground">Accepted</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50 dark:bg-purple-900/20">
                  <CardHeader>
                    <CardTitle className="text-lg">Acceptance Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-purple-600">
                        {sharingSummary?.summary.totalShares 
                          ? Math.round((sharingSummary.summary.acceptedShares / sharingSummary.summary.totalShares) * 100) 
                          : 0}%
                      </div>
                      <div className="text-sm text-muted-foreground">Of all shares accepted</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Visitor Sessions</CardTitle>
          <CardDescription>Live visitor activity</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Landing Page</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Page Views</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions?.slice(0, 10).map((session: any) => (
                <TableRow key={session.id}>
                  <TableCell>{format(new Date(session.createdAt), 'HH:mm:ss')}</TableCell>
                  <TableCell>
                    {session.isLoggedIn ? (
                      <Badge variant="default">Logged In</Badge>
                    ) : (
                      <Badge variant="secondary">Guest</Badge>
                    )}
                  </TableCell>
                  <TableCell>{session.landingPage || '/'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {session.device === 'mobile' && <Smartphone className="h-4 w-4" />}
                      {session.device === 'tablet' && <Tablet className="h-4 w-4" />}
                      {session.device === 'desktop' && <Monitor className="h-4 w-4" />}
                      {session.device}
                    </div>
                  </TableCell>
                  <TableCell>{session.pageViews}</TableCell>
                  <TableCell>
                    {session.duration ? `${Math.round(session.duration / 60)}m` : 'Active'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}