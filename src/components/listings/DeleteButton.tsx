'use client';

import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DeleteButtonProps {
  itemId: string;
  itemType: 'listing' | 'auction';
  itemName: string;
}

export default function DeleteButton({
  itemId,
  itemType,
  itemName,
}: DeleteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const endpoint =
        itemType === 'listing'
          ? `/api/listings/${itemId}`
          : `/api/auctions/${itemId}`;
      const response = await fetch(endpoint, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh the page to show updated list
        router.refresh();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete item');
      }
    } catch (err) {
      setError('An error occurred while deleting the item');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className='text-gray-400 hover:text-red-600 transition-colors'
        disabled={isDeleting}
      >
        <Trash2 className='h-4 w-4' />
      </button>

      {isOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg max-w-sm w-full p-6'>
            <div className='flex items-center space-x-3 mb-4'>
              <div className='flex-shrink-0'>
                <AlertTriangle className='h-6 w-6 text-red-500' />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Delete {itemType === 'auction' ? 'Auction' : 'Listing'}
                </h3>
                <p className='text-sm text-gray-600'>
                  Are you sure you want to delete &quot;{itemName}&quot;?
                </p>
              </div>
            </div>

            {error && (
              <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-md'>
                <p className='text-sm text-red-600'>{error}</p>
              </div>
            )}

            <div className='flex space-x-3'>
              <button
                onClick={() => setIsOpen(false)}
                className='flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className='flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50'
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
