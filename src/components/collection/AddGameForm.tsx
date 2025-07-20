'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface AddGameFormProps {
  onSubmit: (gameData: any) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

export default function AddGameForm({ onSubmit, onCancel, className = '' }: AddGameFormProps) {
  const [formData, setFormData] = useState({
    game_title: '',
    game_category: '',
    game_condition: 'good',
    acquisition_date: '',
    acquisition_price: '',
    current_value: '',
    notes: '',
    is_for_sale: false,
    is_for_trade: false,
    is_public: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const gameConditions = [
    { value: 'new', label: 'New' },
    { value: 'like_new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' },
  ];

  const gameCategories = [
    'Strategy',
    'Eurogame',
    'Ameritrash',
    'Party Game',
    'Family Game',
    'Card Game',
    'Dice Game',
    'Miniature Game',
    'RPG',
    'Other',
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.game_title.trim()) {
      newErrors.game_title = 'Game title is required';
    }

    if (formData.acquisition_price && isNaN(Number(formData.acquisition_price))) {
      newErrors.acquisition_price = 'Please enter a valid price';
    }

    if (formData.current_value && isNaN(Number(formData.current_value))) {
      newErrors.current_value = 'Please enter a valid price';
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
        acquisition_price: formData.acquisition_price ? Number(formData.acquisition_price) : undefined,
        current_value: formData.current_value ? Number(formData.current_value) : undefined,
      });
    } catch (error) {
      console.error('Error adding game:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Add Game to Collection</h2>
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

          {/* Game Category and Condition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="game_category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="game_category"
                value={formData.game_category}
                onChange={(e) => handleInputChange('game_category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select category</option>
                {gameCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="game_condition" className="block text-sm font-medium text-gray-700 mb-2">
                Condition *
              </label>
              <select
                id="game_condition"
                value={formData.game_condition}
                onChange={(e) => handleInputChange('game_condition', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {gameConditions.map((condition) => (
                  <option key={condition.value} value={condition.value}>
                    {condition.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Acquisition Date and Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="acquisition_date" className="block text-sm font-medium text-gray-700 mb-2">
                Acquisition Date
              </label>
              <input
                type="date"
                id="acquisition_date"
                value={formData.acquisition_date}
                onChange={(e) => handleInputChange('acquisition_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="acquisition_price" className="block text-sm font-medium text-gray-700 mb-2">
                Purchase Price (€)
              </label>
              <input
                type="number"
                id="acquisition_price"
                value={formData.acquisition_price}
                onChange={(e) => handleInputChange('acquisition_price', e.target.value)}
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.acquisition_price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.acquisition_price && (
                <p className="mt-1 text-sm text-red-600">{errors.acquisition_price}</p>
              )}
            </div>
          </div>

          {/* Current Value */}
          <div>
            <label htmlFor="current_value" className="block text-sm font-medium text-gray-700 mb-2">
              Current Value (€)
            </label>
            <input
              type="number"
              id="current_value"
              value={formData.current_value}
              onChange={(e) => handleInputChange('current_value', e.target.value)}
              step="0.01"
              min="0"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.current_value ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.current_value && (
              <p className="mt-1 text-sm text-red-600">{errors.current_value}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any notes about this game..."
            />
          </div>

          {/* Status Options */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Status Options</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_for_sale}
                  onChange={(e) => handleInputChange('is_for_sale', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Available for sale</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_for_trade}
                  onChange={(e) => handleInputChange('is_for_trade', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Available for trade</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_public}
                  onChange={(e) => handleInputChange('is_public', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Public collection (visible to others)</span>
              </label>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>{isSubmitting ? 'Adding...' : 'Add Game'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 