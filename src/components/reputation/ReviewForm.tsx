'use client';

import { useState } from 'react';
import { Star, MessageSquare, Truck, Package } from 'lucide-react';

interface ReviewFormProps {
  transactionId: string;
  reviewedUserId: string;
  reviewType: 'buyer' | 'seller';
  onSubmit: (reviewData: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ReviewForm({
  transactionId,
  reviewedUserId,
  reviewType,
  onSubmit,
  onCancel,
  isLoading = false,
}: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [communicationRating, setCommunicationRating] = useState(5);
  const [shippingRating, setShippingRating] = useState(5);
  const [itemConditionRating, setItemConditionRating] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      transactionId,
      reviewedUserId,
      rating,
      comment,
      reviewType,
      communicationRating,
      shippingRating,
      itemConditionRating,
    });
  };

  const renderStars = (value: number, onChange: (value: number) => void, label: string) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`p-1 transition-colors ${
              star <= value ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-400`}
          >
            <Star className="h-5 w-5 fill-current" />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-500">{value}/5</span>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Review {reviewType === 'buyer' ? 'Buyer' : 'Seller'}
        </h3>
        <p className="text-sm text-gray-600">
          Share your experience with this {reviewType}. Your feedback helps build trust in our community.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Overall Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overall Rating *
          </label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`p-1 transition-colors ${
                  star <= rating ? 'text-yellow-400' : 'text-gray-300'
                } hover:text-yellow-400`}
              >
                <Star className="h-6 w-6 fill-current" />
              </button>
            ))}
            <span className="ml-3 text-sm text-gray-500">{rating}/5</span>
          </div>
        </div>

        {/* Detailed Ratings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderStars(
            communicationRating,
            setCommunicationRating,
            'Communication'
          )}
          {renderStars(
            shippingRating,
            setShippingRating,
            'Shipping'
          )}
          {renderStars(
            itemConditionRating,
            setItemConditionRating,
            'Item Condition'
          )}
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Additional Comments
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Share details about your experience..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 