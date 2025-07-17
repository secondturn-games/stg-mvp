import LoadingSpinner from '@/components/feedback/LoadingSpinner';

export default function Loading() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='text-center'>
        <LoadingSpinner size='lg' className='mb-4' />
        <p className='text-gray-600'>Loading...</p>
      </div>
    </div>
  );
}
