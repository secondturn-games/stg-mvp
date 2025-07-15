import ListingForm from '@/components/listings/ListingForm'

export default function TestAuctionPage() {
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Auction Creation Test</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Test Auction Creation Form</h2>
        <p className="text-gray-600 mb-6">
          This page tests the auction creation form with the new 24-hour format DateTimeInput component.
          Try creating an auction and check if the end time input shows 24-hour format instead of AM/PM.
        </p>
        
        <ListingForm />
      </div>
    </div>
  )
} 