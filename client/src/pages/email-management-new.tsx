import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Mail, Send, Key, Users, Clock, AlertTriangle, CheckCircle, Edit, Trash, Plus, Server } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLanguage } from '@/contexts/LanguageContext';

// Gmail Provider Interface
interface GmailProvider {
  id: string;
  name: string;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  status: 'active' | 'inactive' | 'error';
  dailyLimit: number;
  usedToday: number;
  lastTest: string;
}

// Gmail Template Interface
interface GmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'customer_onboarding' | 'customer_offboarding' | 'billing_reminder' | 'regulatory_alert' | 'weekly_digest' | 'trial_expiry';
  isActive: boolean;
  variables: string[];
}

// Email Statistics Interface
interface EmailStats {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  dailySent: number;
  weeklyDigestSubscribers: number;
  instantAlertSubscribers: number;
  lastSent: string;
}

export default function EmailManagementNew() {
  const { t } = useLanguage();
  const [selectedTemplate, setSelectedTemplate] = useState<GmailTemplate | null>(null);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [customerData, setCustomerData] = useState({
    customerName: 'Max Mustermann',
    companyName: 'Beispiel GmbH', 
    subscriptionPlan: 'Professional',
    dashboardUrl: 'https://helix-platform.com/dashboard',
    loginUrl: 'https://max-mustermann.helix-platform.com/login',
    amount: '899',
    dueDate: '31.08.2025',
    invoiceUrl: 'https://helix-platform.com/invoice/123',
    alertTitle: 'Neue EU MDR Änderung',
    summary: 'Wichtige Aktualisierung der Medical Device Regulation',
    urgency: 'high',
    updatesCount: '23',
    legalCasesCount: '8',
    expiryDate: '20.08.2025',
    upgradeUrl: 'https://helix-platform.com/upgrade',
    endDate: '31.08.2025'
  });
  const queryClient = useQueryClient();

  // Gmail Provider Query
  const { data: providers = [], isLoading: providersLoading } = useQuery<GmailProvider[]>({
    queryKey: ['/api/email/providers']
  });

  // Gmail Templates Query
  const { data: templates = [], isLoading: templatesLoading } = useQuery<GmailTemplate[]>({
    queryKey: ['/api/email/templates']
  });

  // Email Statistics Query
  const { data: stats } = useQuery<EmailStats>({
    queryKey: ['/api/email/statistics']
  });

  // Test Gmail Connection Mutation
  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/email/test', 'POST');
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: t('email.connectionSuccess'),
          description: t('email.connectionSuccessDesc')
        });
      } else {
        toast({
          title: t('email.connectionFailed'), 
          description: data.message || t('email.connectionError')
        });
      }
    },
    onError: () => {
      toast({
        title: t('email.testFailed'),
        description: t('email.testFailedDesc')
      });
    }
  });

  // Send Test Email Mutation
  const sendTestEmailMutation = useMutation({
    mutationFn: async ({ templateId, email }: { templateId: string; email: string }) => {
      return await apiRequest('/api/email/send', 'POST', {
        to: email,
        templateId,
        variables: customerData
      });
    },
    onSuccess: () => {
      toast({
        title: t('email.testEmailSent'),
        description: t('email.testEmailSentDesc').replace('{email}', testEmail)
      });
      setTestEmail('');
    },
    onError: () => {
      toast({
        title: t('email.sendFailed'),
        description: t('email.sendFailedDesc')
      });
    }
  });

  const handleTestConnection = () => {
    testConnectionMutation.mutate();
  };

  const handleSendTestEmail = (templateId: string) => {
    if (!testEmail) {
      toast({
        title: t('email.emailRequired'),
        description: t('email.emailRequiredDesc')
      });
      return;
    }
    sendTestEmailMutation.mutate({ templateId, email: testEmail });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">{t('common.active')}</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">{t('email.appPasswordRequired')}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{t('common.inactive')}</Badge>;
    }
  };

  if (providersLoading || templatesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">{t('email.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('email.title')}</h1>
          <p className="text-gray-600">{t('email.subtitle')}</p>
        </div>
        <Button onClick={handleTestConnection} disabled={testConnectionMutation.isPending}>
          {testConnectionMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {t('email.testing')}
            </>
          ) : (
            <>
              <Server className="w-4 h-4 mr-2" />
              {t('email.testConnection')}
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="providers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="providers">{t('email.providers')}</TabsTrigger>
          <TabsTrigger value="templates">{t('email.templates')}</TabsTrigger>
          <TabsTrigger value="statistics">{t('email.statistics')}</TabsTrigger>
        </TabsList>

        {/* Gmail Provider Tab */}
        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                {t('email.gmailProvider')}
              </CardTitle>
              <CardDescription>
                {t('email.gmailConfig')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {providers.length > 0 ? (
                <div className="space-y-4">
                  {providers.map((provider) => (
                    <div key={provider.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">{provider.name}</h3>
                          <p className="text-sm text-gray-600">{provider.host}:{provider.port}</p>
                        </div>
                        {getStatusBadge(provider.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">{t('email.user')}</span>
                          <p className="font-medium">{provider.user}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">{t('email.dailyLimit')}</span>
                          <p className="font-medium">{provider.dailyLimit.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">{t('email.sentToday')}</span>
                          <p className="font-medium">{provider.usedToday}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">{t('email.security')}</span>
                          <p className="font-medium">{provider.secure ? 'TLS/SSL' : 'STARTTLS'}</p>
                        </div>
                      </div>

                      {provider.status === 'error' && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start">
                            <AlertTriangle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-red-800">{t('email.appPasswordRequired')}</h4>
                              <p className="text-sm text-red-700 mt-1">
                                {t('email.appPasswordDesc')}
                              </p>
                              <div className="mt-2 text-sm text-red-700">
                                <p><strong>{t('email.stepsTitle')}</strong></p>
                                <ol className="list-decimal list-inside mt-1 space-y-1">
                                  <li>{t('email.step1')}</li>
                                  <li>{t('email.step2')}</li>
                                  <li>{t('email.step3')}</li>
                                  <li>{t('email.step4')}</li>
                                </ol>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">{t('email.noProviders')}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gmail Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Edit className="w-5 h-5 mr-2" />
                {t('email.templatesTitle')}
              </CardTitle>
              <CardDescription>
                {t('email.templatesDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{template.name}</h3>
                        <p className="text-sm text-gray-600">{template.subject}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={template.isActive ? "default" : "secondary"}>
                          {template.isActive ? t('common.active') : t('common.inactive')}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedTemplate(selectedTemplate?.id === template.id ? null : template)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3">
                      <strong>{t('email.templateType')}</strong> {template.type.replace('_', ' ')}
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.variables.map((variable) => (
                        <Badge key={variable} variant="outline" className="text-xs">
                          {`{{${variable}}}`}
                        </Badge>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="test@example.com"
                          value={testEmail}
                          onChange={(e) => setTestEmail(e.target.value)}
                          className="flex-1"
                        />
                        <Button 
                          size="sm"
                          onClick={() => handleSendTestEmail(template.id)}
                          disabled={!testEmail || sendTestEmailMutation.isPending}
                        >
                          {sendTestEmailMutation.isPending ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      
                      {selectedTemplate?.id === template.id && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h4 className="font-medium mb-2">{t('email.customerDataTitle')}</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <label className="font-medium">{t('email.customer')}</label>
                              <Input
                                value={customerData.customerName}
                                onChange={(e) => setCustomerData({...customerData, customerName: e.target.value})}
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <label className="font-medium">{t('email.plan')}</label>
                              <select 
                                className="w-full p-1 border rounded text-sm"
                                value={customerData.subscriptionPlan}
                                onChange={(e) => setCustomerData({...customerData, subscriptionPlan: e.target.value})}
                              >
                                <option value="Starter">Starter (€299)</option>
                                <option value="Professional">Professional (€899)</option>
                                <option value="Enterprise">Enterprise (€2.499)</option>
                              </select>
                            </div>
                            <div>
                              <label className="font-medium">{t('email.dashboardUrl')}</label>
                              <Input
                                value={customerData.dashboardUrl}
                                onChange={(e) => setCustomerData({...customerData, dashboardUrl: e.target.value})}
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <label className="font-medium">{t('email.loginUrl')}</label>
                              <Input
                                value={customerData.loginUrl}
                                onChange={(e) => setCustomerData({...customerData, loginUrl: e.target.value})}
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <label className="font-medium">{t('email.amount')}</label>
                              <Input
                                value={customerData.amount}
                                onChange={(e) => setCustomerData({...customerData, amount: e.target.value})}
                                className="text-sm"
                              />
                            </div>
                          </div>
                          <div className="mt-3">
                            <Button
                              onClick={() => handleSendTestEmail(template.id)}
                              disabled={!testEmail || sendTestEmailMutation.isPending}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              {sendTestEmailMutation.isPending ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              ) : (
                                <Send className="w-4 h-4 mr-2" />
                              )}
                              {t('email.sendWithData')}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Send className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{t('email.totalSent')}</p>
                    <p className="text-2xl font-bold">{stats?.totalSent?.toLocaleString() || '0'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{t('email.delivered')}</p>
                    <p className="text-2xl font-bold">{stats?.totalDelivered?.toLocaleString() || '0'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{t('email.failed')}</p>
                    <p className="text-2xl font-bold">{stats?.totalFailed?.toLocaleString() || '0'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{t('email.subscribers')}</p>
                    <p className="text-2xl font-bold">{stats?.weeklyDigestSubscribers || '0'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('email.overview')}</CardTitle>
              <CardDescription>{t('email.overviewDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>{t('email.sentTodayLabel')}</span>
                  <span className="font-semibold">{stats?.dailySent || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>{t('email.weeklyDigest')}</span>
                  <span className="font-semibold">{stats?.weeklyDigestSubscribers || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>{t('email.instantAlerts')}</span>
                  <span className="font-semibold">{stats?.instantAlertSubscribers || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>{t('email.lastSent')}</span>
                  <span className="font-semibold">
                    {stats?.lastSent ? new Date(stats.lastSent).toLocaleString() : t('time.never')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}