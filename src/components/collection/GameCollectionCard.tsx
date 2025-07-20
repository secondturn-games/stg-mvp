'use client';

import { useState } from 'react';
import { Edit, Trash2, Star, Tag, DollarSign, Users, Calendar } from 'lucide-react';
import type { GameCollection } from '@/lib/game-collection-service';

interface GameCollectionCardProps {
  game: GameCollection;
  onEdit?: (game: GameCollection) => void;
  onDelete?: (gameId: string) => void;
  onRate?: (game: GameCollection) => void;
  className?: string;
}

export default function GameCollectionCard({
  game,
  onEdit,
  onDelete,
  onRate,
  className = '',
}: GameCollectionCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new':
        return 'bg-green-100 text-green-800';
      case 'like_new':
        return 'bg-blue-100 text-blue-800';
      case 'good':
        return 'bg-yellow-100 text-yellow-800';
      case 'fair':
        return 'bg-orange-100 text-orange-800';
      case 'poor':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case 'new':
        return 'New';
      case 'like_new':
        return 'Like New';
      case 'good':
        return 'Good';
      case 'fair':
        return 'Fair';
      case 'poor':
        return 'Poor';
      default:
        return condition;
    }
  };

  const handleDelete = async () => {
    if (!onDelete || isDeleting) return;
    
    setIsDeleting(true);
    try {
      await onDelete(game.id);
    } catch (error) {
      console.error('Error deleting game:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {game.game_title}
            </h3>
            {game.game_category && (
              <p className="text-sm text-gray-600 mb-2">
                <Tag className="inline h-3 w-3 mr-1" />
                {game.game_category}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {onRate && (
              <button
                onClick={() => onRate(game)}
                className="p-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 rounded-lg transition-colors"
                title="Rate this game"
              >
                <Star className="h-4 w-4" />
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(game)}
                className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit game"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                title="Remove from collection"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Condition and Status */}
        <div className="flex items-center space-x-4 mb-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(game.game_condition)}`}>
            {getConditionLabel(game.game_condition)}
          </span>
          {game.is_for_sale && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              For Sale
            </span>
          )}
          {game.is_for_trade && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
              For Trade
            </span>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Current Value</p>
              <p className="text-sm font-medium text-gray-900">
                {formatCurrency(game.current_value)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Acquired</p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(game.acquisition_date)}
              </p>
            </div>
          </div>
          {game.acquisition_price && (
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Purchase Price</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatCurrency(game.acquisition_price)}
                </p>
              </div>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Visibility</p>
              <p className="text-sm font-medium text-gray-900">
                {game.is_public ? 'Public' : 'Private'}
              </p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {game.notes && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1">Notes</p>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
              {game.notes}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Added {formatDate(game.created_at)}</span>
          <span>Last updated {formatDate(game.updated_at)}</span>
        </div>
      </div>
    </div>
  );
} 