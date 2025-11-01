import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { CheckCircle, XCircle, AlertTriangle, Clock, Zap, Database, Server, Wifi, Activity, RefreshCw } from 'lucide-react';

export default function StatusPage() {
  const services = [
    {
      name: 'Trading Platform',
      status: 'operational',
      description: 'Main trading platform and user interface',
      uptime: '99.98%',
      responseTime: '45ms',
      lastIncident: '2 days ago'
    },
    {
      name: 'Market Data API',
      status: 'operational',
      description: 'Real-time market data feeds and historical data',
      uptime: '99.95%',
      responseTime: '12ms',
      lastIncident: '1 week ago'
    },
    {
      name: 'Trading API',
      status: 'operational',
      description: 'Order execution and trade management',
      uptime: '99.99%',
      responseTime: '8ms',
      lastIncident: '3 weeks ago'
    },
    {
      name: 'Authentication Service',
      status: 'operational',
      description: 'User authentication and session management',
      uptime: '100%',
      responseTime: '15ms',
      lastIncident: 'None'
    },
    {
      name: 'WebSocket Streams',
      status: 'degraded',
      description: 'Real-time data streaming services',
      uptime: '98.5%',
      responseTime: '120ms',
      lastIncident: '2 hours ago'
    },
    {
      name: 'Database Services',
      status: 'operational',
      description: 'Data storage and retrieval systems',
      uptime: '99.99%',
      responseTime: '5ms',
      lastIncident: '1 month ago'
    }
  ];

  const recentIncidents = [
    {
      id: 1,
      title: 'WebSocket Streaming Latency',
      service: 'WebSocket Streams',
      status: 'investigating',
      severity: 'medium',
      started: '2024-11-24 14:30 UTC',
      updates: [
        {
          time: '2024-11-24 14:30 UTC',
          message: 'Investigating reports of increased latency in WebSocket streams',
          status: 'investigating'
        },
        {
          time: '2024-11-24 14:45 UTC',
          message: 'Identified the issue - working on resolution',
          status: 'identified'
        }
      ]
    },
    {
      id: 2,
      title: 'Market Data API - Brief Outage',
      service: 'Market Data API',
      status: 'resolved',
      severity: 'low',
      started: '2024-11-17 09:15 UTC',
      resolved: '2024-11-17 09:45 UTC',
      updates: [
        {
          time: '2024-11-17 09:15 UTC',
          message: 'Reports of API connectivity issues',
          status: 'investigating'
        },
        {
          time: '2024-11-17 09:25 UTC',
          message: 'Issue identified - database connection pool exhausted',
          status: 'identified'
        },
        {
          time: '2024-11-17 09:45 UTC',
          message: 'Issue resolved - all systems operational',
          status: 'resolved'
        }
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'outage':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-100 text-green-800';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'outage':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const overallStatus = services.every(s => s.status === 'operational') ? 'operational' : 'degraded';

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 mb-4">
            {overallStatus === 'operational' ? (
              <CheckCircle className="h-8 w-8 text-green-600" />
            ) : (
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            )}
            <Badge variant="secondary" className="text-lg px-4 py-2">
              System Status
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            All Systems
            <span className={overallStatus === 'operational' ? 
              'text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-700' : 
              'text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600'
            }>
              {' '}{overallStatus === 'operational' ? 'Operational' : 'Partially Degraded'}
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real-time status information for Global Markets services and infrastructure.
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>

        {/* Overall Status Summary */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-6 w-6 text-blue-600" />
              <span>System Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {services.filter(s => s.status === 'operational').length}
                </div>
                <div className="text-sm text-gray-600">Operational</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-1">
                  {services.filter(s => s.status === 'degraded').length}
                </div>
                <div className="text-sm text-gray-600">Degraded</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-1">
                  {services.filter(s => s.status === 'outage').length}
                </div>
                <div className="text-sm text-gray-600">Outages</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">99.96%</div>
                <div className="text-sm text-gray-600">Overall Uptime</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Status */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Service Status</h2>
          <div className="space-y-4">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(service.status)}
                      <div>
                        <h3 className="font-semibold text-lg">{service.name}</h3>
                        <p className="text-sm text-gray-600">{service.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(service.status)}>
                        {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                      </Badge>
                      <div className="mt-2 text-sm text-gray-500">
                        <div>Response: {service.responseTime}</div>
                        <div>Uptime: {service.uptime}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Active Incidents */}
        {recentIncidents.filter(incident => incident.status !== 'resolved').length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Active Incidents</h2>
            <div className="space-y-6">
              {recentIncidents
                .filter(incident => incident.status !== 'resolved')
                .map((incident) => (
                <Card key={incident.id} className="border-yellow-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <span>{incident.title}</span>
                      </CardTitle>
                      <Badge className={getSeverityColor(incident.severity)}>
                        {incident.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <CardDescription>
                      {incident.service} • Started: {incident.started}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {incident.updates.map((update, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium">{update.time}</span>
                              <Badge variant="outline" className="text-xs">
                                {update.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{update.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Recent Incidents */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Recent Incidents</h2>
          <div className="space-y-6">
            {recentIncidents.map((incident) => (
              <Card key={incident.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      {incident.status === 'resolved' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      )}
                      <span>{incident.title}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge className={getSeverityColor(incident.severity)}>
                        {incident.severity.toUpperCase()}
                      </Badge>
                      <Badge className={incident.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {incident.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    {incident.service} • {incident.started}
                    {incident.resolved && ` • Resolved: ${incident.resolved}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {incident.updates.map((update, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          update.status === 'resolved' ? 'bg-green-600' : 
                          update.status === 'identified' ? 'bg-yellow-600' : 'bg-blue-600'
                        }`}></div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium">{update.time}</span>
                            <Badge variant="outline" className="text-xs">
                              {update.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{update.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-6 w-6 text-blue-600" />
              <span>Performance Metrics</span>
            </CardTitle>
            <CardDescription>
              Key performance indicators for our services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Server className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">API Response Time</h3>
                <div className="text-2xl font-bold text-green-600">18ms</div>
                <div className="text-sm text-gray-600">Average (30 days)</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Wifi className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Uptime SLA</h3>
                <div className="text-2xl font-bold text-blue-600">99.9%</div>
                <div className="text-sm text-gray-600">Monthly Target</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Database className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Data Processing</h3>
                <div className="text-2xl font-bold text-purple-600">1.2M/sec</div>
                <div className="text-sm text-gray-600">Messages processed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscribe to Updates */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>Stay Informed</CardTitle>
            <CardDescription>
              Get notified about service status and incidents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Email Notifications</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Service incidents</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Scheduled maintenance</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Monthly reports</span>
                  </label>
                </div>
                <Button className="mt-4">Subscribe</Button>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Webhook Integration</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Integrate status updates with your monitoring systems
                </p>
                <Button variant="outline">
                  Configure Webhooks
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Questions About Service Status?</h2>
          <p className="text-xl mb-8 opacity-90">
            Our support team is available 24/7 to help with any service-related questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Contact Support
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Subscribe to Updates
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}