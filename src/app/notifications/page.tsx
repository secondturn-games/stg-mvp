'use client';

import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Settings, Trash2, Check, Clock, DollarSign } from 'lucide-react';
import NotificationBell from '@/components/notifications/NotificationBell';
import PriceAlertForm from '@/components/notifications/PriceAlertForm';
import type { Notification, PriceAlert } from '@/lib/notifications-service';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPriceAlertForm, setShowPriceAlertForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'notifications' | 'price-alerts'>('notifications');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch notifications
      const notificationsResponse = await fetch('/api/notifications?limit=100');
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json();
        setNotifications(notificationsData.notifications || []);
      }

      // Fetch price alerts
      const alertsResponse = await fetch('/api/price-alerts');
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setPriceAlerts(alertsData.alerts || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePriceAlert = async (alertData: any) => {
    try {
      const response = await fetch('/api/price-alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alertData),
      });

      if (response.ok) {
        setShowPriceAlertForm(false);
        fetchData(); // Refresh data
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create price alert');
      }
    } catch (error) {
      console.error('Error creating price alert:', error);
      alert('Failed to create price alert');
    }
  };

  const handleDeletePriceAlert = async (alertId: string) => {
    if (!confirm('Are you sure you want to delete this price alert?')) {
      return;
    }

    try {
      const response = await fetch(`/api/price-alerts?alertId=${alertId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData(); // Refresh data
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete price alert');
      }
    } catch (error) {
      console.error('Error deleting price alert:', error);
      alert('Failed to delete price alert');
    }
  };

  const handleMarkNotificationsAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'mark_read',
          notificationIds,
        }),
      });

      if (response.ok) {
        fetchData(); // Refresh data
        setSelectedNotifications([]);
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAllNotifications = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n.id));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertTypeColor = (alertType: string) => {
    switch (alertType) {
      case 'below':
        return 'bg-green-100 text-green-800';
      case 'above':
        return 'bg-red-100 text-red-800';
      case 'change':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 mt-2">
                Manage your notifications and price alerts
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <button
                onClick={() => setShowPriceAlertForm(true)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Create Price Alert</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('notifications')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'notifications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Bell className="inline h-4 w-4 mr-2" />
                Notifications ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab('price-alerts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'price-alerts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <AlertTriangle className="inline h-4 w-4 mr-2" />
                Price Alerts ({priceAlerts.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'notifications' ? (
              /* Notifications Tab */
              <div>
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                    <p className="text-gray-600">You&apos;re all caught up!</p>
                  </div>
                ) : (
                  <div>
                    {/* Bulk Actions */}
                    {selectedNotifications.length > 0 && (
                      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-blue-700">
                            {selectedNotifications.length} notification(s) selected
                          </span>
                          <button
                            onClick={() => handleMarkNotificationsAsRead(selectedNotifications)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                          >
                            Mark as Read
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Notifications List */}
                    <div className="space-y-4">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border rounded-lg ${
                            notification.is_read ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              checked={selectedNotifications.includes(notification.id)}
                              onChange={() => handleSelectNotification(notification.id)}
                              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                                    {notification.priority}
                                  </span>
                                  <h4 className="text-sm font-medium text-gray-900">
                                    {notification.title}
                                  </h4>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {formatTimeAgo(notification.created_at)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {notification.message}
                              </p>
                              {!notification.is_read && (
                                <button
                                  onClick={() => handleMarkNotificationsAsRead([notification.id])}
                                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                                >
                                  <Check className="h-3 w-3" />
                                  <span>Mark as read</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Price Alerts Tab */
              <div>
                {priceAlerts.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No price alerts</h3>
                    <p className="text-gray-600 mb-4">Create your first price alert to get started</p>
                    <button
                      onClick={() => setShowPriceAlertForm(true)}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Create Price Alert
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {priceAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="p-4 border border-gray-200 rounded-lg bg-white"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-sm font-medium text-gray-900">
                                {alert.game_title}
                              </h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAlertTypeColor(alert.alert_type)}`}>
                                {alert.alert_type}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <DollarSign className="h-4 w-4" />
                                <span>Target: {formatCurrency(alert.target_price)}</span>
                              </div>
                              {alert.current_price && (
                                <div className="flex items-center space-x-1">
                                  <DollarSign className="h-4 w-4" />
                                  <span>Current: {formatCurrency(alert.current_price)}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>Created {formatTimeAgo(alert.created_at)}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeletePriceAlert(alert.id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete price alert"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Price Alert Form Modal */}
        {showPriceAlertForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-md">
              <PriceAlertForm
                onSubmit={handleCreatePriceAlert}
                onCancel={() => setShowPriceAlertForm(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 