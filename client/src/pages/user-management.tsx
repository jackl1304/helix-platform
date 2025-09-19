import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Shield, 
  Crown, 
  Eye, 
  Mail,
  Calendar,
  Activity,
  Settings,
  Key
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'reviewer' | 'user';
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  permissions: string[];
  profileImageUrl?: string;
}

interface UserActivity {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

const createUserFormSchema = (t: (key: string) => string) => z.object({
  email: z.string().email(t('validation.invalidEmail')),
  firstName: z.string().min(1, t('validation.firstNameRequired')),
  lastName: z.string().min(1, t('validation.lastNameRequired')),
  role: z.enum(['admin', 'reviewer', 'user']),
  isActive: z.boolean(),
  permissions: z.array(z.string()).optional()
});

type UserFormData = z.infer<ReturnType<typeof createUserFormSchema>>;

const initialUsers: User[] = [
  {
    id: "1",
    email: "admin@helix.com",
    firstName: "Max",
    lastName: "Mustermann",
    role: "admin",
    isActive: true,
    lastLoginAt: "2025-01-27T10:30:00Z",
    createdAt: "2024-12-01T09:00:00Z",
    permissions: ["read", "write", "delete", "admin", "user_management"],
    profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
  },
  {
    id: "2",
    email: "reviewer@helix.com",
    firstName: "Anna",
    lastName: "Schmidt",
    role: "reviewer",
    isActive: true,
    lastLoginAt: "2025-01-27T08:15:00Z",
    createdAt: "2024-12-15T14:30:00Z",
    permissions: ["read", "write", "approve"],
    profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=reviewer"
  },
  {
    id: "3",
    email: "user@helix.com",
    firstName: "Thomas",
    lastName: "Weber",
    role: "user",
    isActive: true,
    lastLoginAt: "2025-01-26T16:45:00Z",
    createdAt: "2025-01-10T11:20:00Z",
    permissions: ["read"],
    profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=user"
  },
  {
    id: "4",
    email: "inactive@helix.com",
    firstName: "Maria",
    lastName: "Klein",
    role: "user",
    isActive: false,
    createdAt: "2024-11-20T12:00:00Z",
    permissions: ["read"]
  }
];

const recentActivity: UserActivity[] = [
  {
    id: "1",
    userId: "1",
    action: "User Login",
    details: "Successful login via SSO",
    timestamp: "2025-01-27T10:30:00Z",
    ipAddress: "192.168.1.100"
  },
  {
    id: "2",
    userId: "2",
    action: "Approval Action",
    details: "Approved newsletter 'Weekly MedTech Update'",
    timestamp: "2025-01-27T08:15:00Z",
    ipAddress: "192.168.1.101"
  },
  {
    id: "3",
    userId: "1",
    action: "User Created",
    details: "Created new user account for thomas.weber@helix.com",
    timestamp: "2025-01-26T14:20:00Z",
    ipAddress: "192.168.1.100"
  }
];

const roleColors = {
  admin: "bg-red-100 text-red-800 border-red-200",
  reviewer: "bg-blue-100 text-blue-800 border-blue-200",
  user: "bg-green-100 text-green-800 border-green-200"
};

const roleIcons = {
  admin: Crown,
  reviewer: Shield,
  user: Users
};

const getAvailablePermissions = (t: (key: string) => string) => [
  { id: "read", label: t('permissions.read'), description: t('permissions.readDesc') },
  { id: "write", label: t('permissions.write'), description: t('permissions.writeDesc') },
  { id: "delete", label: t('permissions.delete'), description: t('permissions.deleteDesc') },
  { id: "approve", label: t('permissions.approve'), description: t('permissions.approveDesc') },
  { id: "admin", label: t('permissions.admin'), description: t('permissions.adminDesc') },
  { id: "user_management", label: t('permissions.userManagement'), description: t('permissions.userManagementDesc') }
];

export default function UserManagement() {
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const userFormSchema = createUserFormSchema(t);
  const availablePermissions = getAvailablePermissions(t);
  
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      role: "user",
      isActive: true,
      permissions: ["read"]
    }
  });

  const { data: users = initialUsers, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: false // Use mock data
  });

  const { data: userActivity = recentActivity, isLoading: activityLoading } = useQuery<UserActivity[]>({
    queryKey: ["/api/users/activity"],
    enabled: false // Use mock data
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: UserFormData) => {
      return await apiRequest("/api/users", "POST", userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: t('userManagement.userCreated'),
        description: t('userManagement.userCreatedDesc')
      });
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: t('userManagement.createError'),
        variant: "destructive"
      });
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, ...userData }: UserFormData & { id: string }) => {
      return await apiRequest(`/api/users/${id}`, "PATCH", userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      form.reset();
      toast({
        title: t('userManagement.userUpdated'),
        description: t('userManagement.userUpdatedDesc')
      });
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: t('userManagement.updateError'),
        variant: "destructive"
      });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest(`/api/users/${userId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: t('userManagement.userDeleted'),
        description: t('userManagement.userDeletedDesc')
      });
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: t('userManagement.deleteError'),
        variant: "destructive"
      });
    }
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === "" || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const formatDate = (dateString: string) => {
    const locale = language === 'de' ? 'de-DE' : 'en-US';
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    form.reset({
      email: user.email,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      role: user.role,
      isActive: user.isActive,
      permissions: user.permissions
    });
    setIsEditDialogOpen(true);
  };

  const onSubmit = (data: UserFormData) => {
    if (selectedUser) {
      updateUserMutation.mutate({ ...data, id: selectedUser.id });
    } else {
      createUserMutation.mutate(data);
    }
  };

  const getRoleIcon = (role: string) => {
    const Icon = roleIcons[role as keyof typeof roleIcons] || Users;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('userManagement.title')}</h1>
          <p className="text-muted-foreground">
            {t('userManagement.subtitle')}
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              {t('userManagement.newUser')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('userManagement.createUser')}</DialogTitle>
              <DialogDescription>
                {t('userManagement.createDescription')}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('userManagement.firstName')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('userManagement.lastName')}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('userManagement.email')}</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('userManagement.role')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="user">{t('roles.user')}</SelectItem>
                            <SelectItem value="reviewer">{t('roles.reviewer')}</SelectItem>
                            <SelectItem value="admin">{t('roles.admin')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">{t('userManagement.activeSwitch')}</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            {t('userManagement.activeSwitchDesc')}
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" disabled={createUserMutation.isPending}>
                    {createUserMutation.isPending ? t('button.creating') : t('button.create')}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">{t('userManagement.tabs.users')}</TabsTrigger>
          <TabsTrigger value="activity">{t('userManagement.tabs.activity')}</TabsTrigger>
          <TabsTrigger value="permissions">{t('userManagement.tabs.permissions')}</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>{t('userManagement.allUsers')}</CardTitle>
              <CardDescription>
                {t('userManagement.allUsersDesc')}
              </CardDescription>
              <div className="flex space-x-4">
                <Input
                  placeholder={t('userManagement.searchUsers')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('userManagement.allRoles')}</SelectItem>
                    <SelectItem value="admin">{t('roles.admin')}</SelectItem>
                    <SelectItem value="reviewer">{t('roles.reviewer')}</SelectItem>
                    <SelectItem value="user">{t('roles.user')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('userManagement.userColumn')}</TableHead>
                    <TableHead>{t('userManagement.roleColumn')}</TableHead>
                    <TableHead>{t('userManagement.statusColumn')}</TableHead>
                    <TableHead>{t('userManagement.lastLoginColumn')}</TableHead>
                    <TableHead>{t('userManagement.createdColumn')}</TableHead>
                    <TableHead className="text-right">{t('userManagement.actionsColumn')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            {user.profileImageUrl ? (
                              <img 
                                src={user.profileImageUrl} 
                                alt={`${user.firstName} ${user.lastName}`}
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <Users className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={roleColors[user.role]} variant="outline">
                          {getRoleIcon(user.role)}
                          <span className="ml-1 capitalize">{user.role}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? t('common.active') : t('common.inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.lastLoginAt ? formatDate(user.lastLoginAt) : t('userManagement.never')}
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteUserMutation.mutate(user.id)}
                            disabled={user.role === 'admin'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>{t('userManagement.userActivities')}</CardTitle>
              <CardDescription>
                {t('userManagement.userActivitiesDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userActivity.map((activity) => {
                  const user = users.find(u => u.id === activity.userId);
                  return (
                    <div key={activity.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Activity className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">{activity.details}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                          <span>{t('userManagement.userLabel')} {user?.firstName} {user?.lastName}</span>
                          <span>•</span>
                          <span>{formatDate(activity.timestamp)}</span>
                          {activity.ipAddress && (
                            <>
                              <span>•</span>
                              <span>IP: {activity.ipAddress}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>{t('userManagement.managePermissions')}</CardTitle>
              <CardDescription>
                {t('userManagement.managePermissionsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {availablePermissions.map((permission) => (
                  <div key={permission.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{permission.label}</h3>
                      <Badge variant="outline">
                        <Key className="h-3 w-3 mr-1" />
                        {permission.id}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {permission.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Benutzer bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeiten Sie die Benutzerdaten und Berechtigungen.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vorname</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nachname</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-Mail</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rolle</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user">Benutzer</SelectItem>
                          <SelectItem value="reviewer">Reviewer</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Aktiv</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Benutzer kann sich anmelden
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? t('button.saving') : t('button.save')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}