'use client';

import { useState } from 'react';
import { 
  Globe, 
  Twitter, 
  Instagram, 
  Facebook, 
  Linkedin, 
  Youtube, 
  Twitch, 
  MessageCircle,
  Plus,
  X
} from 'lucide-react';

interface SocialLinksEditorProps {
  socialLinks: Record<string, string>;
  onChange: (links: Record<string, string>) => void;
  className?: string;
}

const SOCIAL_PLATFORMS = [
  { key: 'website', label: 'Website', icon: Globe, placeholder: 'https://yourwebsite.com' },
  { key: 'twitter', label: 'Twitter', icon: Twitter, placeholder: 'https://twitter.com/username' },
  { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/username' },
  { key: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/username' },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/username' },
  { key: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@username' },
  { key: 'twitch', label: 'Twitch', icon: Twitch, placeholder: 'https://twitch.tv/username' },
  { key: 'discord', label: 'Discord', icon: MessageCircle, placeholder: 'username#1234' },
];

export default function SocialLinksEditor({
  socialLinks,
  onChange,
  className = '',
}: SocialLinksEditorProps) {
  const [expandedPlatforms, setExpandedPlatforms] = useState<Set<string>>(new Set());

  const handleLinkChange = (platform: string, value: string) => {
    const updatedLinks = { ...socialLinks };
    if (value.trim()) {
      updatedLinks[platform] = value.trim();
    } else {
      delete updatedLinks[platform];
    }
    onChange(updatedLinks);
  };

  const togglePlatform = (platform: string) => {
    const newExpanded = new Set(expandedPlatforms);
    if (newExpanded.has(platform)) {
      newExpanded.delete(platform);
    } else {
      newExpanded.add(platform);
    }
    setExpandedPlatforms(newExpanded);
  };

  const getPlatformIcon = (platform: string) => {
    const platformConfig = SOCIAL_PLATFORMS.find(p => p.key === platform);
    return platformConfig?.icon || Globe;
  };

  const getPlatformLabel = (platform: string) => {
    const platformConfig = SOCIAL_PLATFORMS.find(p => p.key === platform);
    return platformConfig?.label || platform;
  };

  const getPlatformPlaceholder = (platform: string) => {
    const platformConfig = SOCIAL_PLATFORMS.find(p => p.key === platform);
    return platformConfig?.placeholder || 'Enter URL';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Social Links</h3>
        <button
          onClick={() => setExpandedPlatforms(new Set(SOCIAL_PLATFORMS.map(p => p.key)))}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SOCIAL_PLATFORMS.map((platform) => {
          const Icon = platform.icon;
          const isExpanded = expandedPlatforms.has(platform.key);
          const hasValue = socialLinks[platform.key];

          return (
            <div key={platform.key} className="space-y-2">
              {/* Platform Header */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => togglePlatform(platform.key)}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <Icon className="h-4 w-4" />
                  <span>{platform.label}</span>
                  {hasValue && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </button>
                {isExpanded && (
                  <button
                    onClick={() => {
                      handleLinkChange(platform.key, '');
                      togglePlatform(platform.key);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Input Field */}
              {isExpanded && (
                <div className="relative">
                  <input
                    type="url"
                    value={socialLinks[platform.key] || ''}
                    onChange={(e) => handleLinkChange(platform.key, e.target.value)}
                    placeholder={getPlatformPlaceholder(platform.key)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  {hasValue && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <p className="font-medium mb-1">Tips:</p>
        <ul className="space-y-1">
          <li>• Click on a platform to add your profile link</li>
          <li>• Include the full URL (e.g., https://twitter.com/username)</li>
          <li>• For Discord, you can use your username#discriminator</li>
          <li>• Links are validated and cleaned automatically</li>
        </ul>
      </div>
    </div>
  );
} 