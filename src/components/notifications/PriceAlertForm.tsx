'use client';

import { useState } from 'react';
import { AlertTriangle, DollarSign, Target, X } from 'lucide-react';

interface PriceAlertFormProps {
  onSubmit: (alertData: any) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

export default function PriceAlertForm({ onSubmit, onCancel, className = '' }: PriceAlertFormProps) {
  const [formData, setFormData] = useState({
    game_title: '',
    target_price: '',
    alert_type: 'below',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const alertTypes = [
    { value: 'below', label: 'Below', description: 'Alert when price drops below target' },
    { value: 'above', label: 'Above', description: 'Alert when price rises above target' },
    { value: 'change', label: 'Any Change', description: 'Alert when price changes from target' },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.game_title.trim()) {
      newErrors.game_title = 'Game title is required';
    }

    if (!formData.target_price || isNaN(Number(formData.target_price))) {
      newErrors.target_price = 'Please enter a valid price';
    } else if (Number(formData.target_price) <= 0) {
      newErrors.target_price = 'Price must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        target_price: Number(formData.target_price),
      });
    } catch (error) {
      console.error('Error creating price alert:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Create Price Alert</h2>
              <p className="text-sm text-gray-600">Get notified when prices change</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Game Title */}
          <div>
            <label htmlFor="game_title" className="block text-sm font-medium text-gray-700 mb-2">
              Game Title *
            </label>
            <input
              type="text"
              id="game_title"
              value={formData.game_title}
              onChange={(e) => handleInputChange('game_title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.game_title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter game title"
            />
            {errors.game_title && (
              <p className="mt-1 text-sm text-red-600">{errors.game_title}</p>
            )}
          </div>

          {/* Target Price */}
          <div>
            <label htmlFor="target_price" className="block text-sm font-medium text-gray-700 mb-2">
              Target Price (€) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                id="target_price"
                value={formData.target_price}
                onChange={(e) => handleInputChange('target_price', e.target.value)}
                step="0.01"
                min="0"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.target_price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.target_price && (
              <p className="mt-1 text-sm text-red-600">{errors.target_price}</p>
            )}
          </div>

          {/* Alert Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Alert Type *
            </label>
            <div className="space-y-3">
              {alertTypes.map((type) => (
                <label key={type.value} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="alert_type"
                    value={type.value}
                    checked={formData.alert_type === type.value}
                    onChange={(e) => handleInputChange('alert_type', e.target.value)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-900">{type.label}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{type.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">How it works</h4>
                <p className="text-sm text-blue-700 mt-1">
                  We&apos;ll monitor the marketplace for price changes and notify you when your conditions are met. 
                  You can manage your alerts from your profile settings.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>{isSubmitting ? 'Creating...' : 'Create Alert'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 