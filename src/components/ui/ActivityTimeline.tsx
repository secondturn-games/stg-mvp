'use client';

import { Clock, User, Shield, MapPin } from 'lucide-react';
import { formatRelativeTime } from '@/lib/regional-settings';

interface TimelineEvent {
  id: string;
  type: 'profile' | 'listing' | 'transaction' | 'verification' | 'system';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
  color: string;
}

interface ActivityTimelineProps {
  events?: TimelineEvent[];
  maxEvents?: number;
  className?: string;
}

export default function ActivityTimeline({
  events = [],
  maxEvents = 5,
  className = '',
}: ActivityTimelineProps) {
  // Mock events - in real app, these would come from the database
  const mockEvents: TimelineEvent[] = [
    {
      id: '1',
      type: 'profile',
      title: 'Profile Created',
      description: 'Welcome to Second Turn! Your profile is ready.',
      timestamp: new Date().toISOString(),
      icon: <User className="w-4 h-4" />,
      color: 'bg-forestDeep',
    },
    {
      id: '2',
      type: 'system',
      title: 'Location Set',
      description: 'Your location was set to Estonia for local marketplace features.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      icon: <MapPin className="w-4 h-4" />,
      color: 'bg-goldenBeam',
    },
    {
      id: '3',
      type: 'verification',
      title: 'Email Verified',
      description: 'Your email address has been verified successfully.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      icon: <Shield className="w-4 h-4" />,
      color: 'bg-sunEmber',
    },
  ];

  const displayEvents = events.length > 0 ? events : mockEvents;
  const limitedEvents = displayEvents.slice(0, maxEvents);

  if (limitedEvents.length === 0) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="w-5 h-5 text-forestDeep" />
          <h3 className="font-semibold text-forestDeep">Recent Activity</h3>
        </div>
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No recent activity to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-forestDeep" />
          <h3 className="font-semibold text-forestDeep">Recent Activity</h3>
        </div>
        <div className="text-sm text-gray-600">
          {limitedEvents.length} {limitedEvents.length === 1 ? 'event' : 'events'}
        </div>
      </div>

      <div className="space-y-4">
        {limitedEvents.map((event, index) => (
          <div key={event.id} className="flex items-start space-x-3">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full ${event.color} flex items-center justify-center text-white`}>
                {event.icon}
              </div>
              {index < limitedEvents.length - 1 && (
                <div className="w-px h-8 bg-gray-200 mt-2" />
              )}
            </div>

            {/* Event content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-forestDeep">{event.title}</h4>
                <span className="text-sm text-gray-600">
                  {formatRelativeTime(event.timestamp)}
                </span>
              </div>
              <p className="text-sm text-gray-700 mt-1">{event.description}</p>
            </div>
          </div>
        ))}
      </div>

      {displayEvents.length > maxEvents && (
        <div className="mt-4 text-center">
          <button className="text-sm text-sunEmber hover:text-sunEmber/80 font-medium">
            View all activity →
          </button>
        </div>
      )}
    </div>
  );
}