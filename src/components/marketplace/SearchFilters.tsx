'use client';

import { useState } from 'react';
import { Search, Filter } from 'lucide-react';

interface SearchFiltersProps {
  onSearchChange: (search: string) => void;
  onFiltersChange: (filters: FilterState) => void;
  onSortChange: (sort: string) => void;
}

export interface FilterState {
  condition: string[];
  priceRange: { min: number; max: number };
  location: string[];
  listingType: string[];
}

export default function SearchFilters({
  onSearchChange,
  onFiltersChange,
  onSortChange,
}: SearchFiltersProps) {
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    condition: [],
    priceRange: { min: 0, max: 1000 },
    location: [],
    listingType: [],
  });
  const [sortBy, setSortBy] = useState('relevance');

  const conditions = [
    { value: 'new', label: 'New (Sealed)' },
    { value: 'like_new', label: 'Like New' },
    { value: 'very_good', label: 'Very Good' },
    { value: 'good', label: 'Good' },
    { value: 'acceptable', label: 'Acceptable' },
  ];

  const listingTypes = [
    { value: 'fixed', label: 'Fixed Price' },
    { value: 'auction', label: 'Auction' },
    { value: 'trade', label: 'Trade Only' },
  ];

  const locations = [
    { value: 'Tallinn', label: 'Tallinn' },
    { value: 'Riga', label: 'Riga' },
    { value: 'Vilnius', label: 'Vilnius' },
    { value: 'Tartu', label: 'Tartu' },
    { value: 'Kaunas', label: 'Kaunas' },
    { value: 'Klaipėda', label: 'Klaipėda' },
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'date_new', label: 'Date: Newest First' },
    { value: 'date_old', label: 'Date: Oldest First' },
  ];

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearchChange(value);
  };

  const handleConditionChange = (condition: string) => {
    const newConditions = filters.condition.includes(condition)
      ? filters.condition.filter(c => c !== condition)
      : [...filters.condition, condition];

    const newFilters = { ...filters, condition: newConditions };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleLocationChange = (location: string) => {
    const newLocations = filters.location.includes(location)
      ? filters.location.filter(l => l !== location)
      : [...filters.location, location];

    const newFilters = { ...filters, location: newLocations };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleListingTypeChange = (type: string) => {
    const newTypes = filters.listingType.includes(type)
      ? filters.listingType.filter(t => t !== type)
      : [...filters.listingType, type];

    const newFilters = { ...filters, listingType: newTypes };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handlePriceRangeChange = (field: 'min' | 'max', value: number) => {
    const newPriceRange = { ...filters.priceRange, [field]: value };
    const newFilters = { ...filters, priceRange: newPriceRange };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    onSortChange(value);
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      condition: [],
      priceRange: { min: 0, max: 1000 },
      location: [],
      listingType: [],
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const activeFiltersCount =
    filters.condition.length +
    filters.location.length +
    filters.listingType.length +
    (filters.priceRange.min > 0 || filters.priceRange.max < 1000 ? 1 : 0);

  return (
    <div className='space-y-4'>
      {/* Search Bar */}
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5' />
        <input
          type='text'
          placeholder='Search games...'
          value={search}
          onChange={e => handleSearchChange(e.target.value)}
          className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        />
      </div>

      {/* Filter Toggle */}
      <div className='flex items-center justify-between'>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className='flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900'
        >
          <Filter className='h-4 w-4' />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className='bg-blue-500 text-white text-xs px-2 py-1 rounded-full'>
              {activeFiltersCount}
            </span>
          )}
        </button>

        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className='text-sm text-gray-500 hover:text-gray-700'
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className='bg-gray-50 rounded-lg p-4 space-y-4'>
          {/* Condition Filter */}
          <div>
            <h4 className='text-sm font-medium text-gray-700 mb-2'>
              Condition
            </h4>
            <div className='grid grid-cols-2 gap-2'>
              {conditions.map(condition => (
                <label key={condition.value} className='flex items-center'>
                  <input
                    type='checkbox'
                    checked={filters.condition.includes(condition.value)}
                    onChange={() => handleConditionChange(condition.value)}
                    className='mr-2'
                  />
                  <span className='text-sm'>{condition.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <h4 className='text-sm font-medium text-gray-700 mb-2'>
              Price Range (EUR)
            </h4>
            <div className='grid grid-cols-2 gap-2'>
              <div>
                <label className='block text-xs text-gray-600 mb-1'>Min</label>
                <input
                  type='number'
                  value={filters.priceRange.min}
                  onChange={e =>
                    handlePriceRangeChange('min', Number(e.target.value))
                  }
                  className='w-full px-2 py-1 text-sm border border-gray-300 rounded'
                  min='0'
                />
              </div>
              <div>
                <label className='block text-xs text-gray-600 mb-1'>Max</label>
                <input
                  type='number'
                  value={filters.priceRange.max}
                  onChange={e =>
                    handlePriceRangeChange('max', Number(e.target.value))
                  }
                  className='w-full px-2 py-1 text-sm border border-gray-300 rounded'
                  min='0'
                />
              </div>
            </div>
          </div>

          {/* Location Filter */}
          <div>
            <h4 className='text-sm font-medium text-gray-700 mb-2'>Location</h4>
            <div className='grid grid-cols-2 gap-2'>
              {locations.map(location => (
                <label key={location.value} className='flex items-center'>
                  <input
                    type='checkbox'
                    checked={filters.location.includes(location.value)}
                    onChange={() => handleLocationChange(location.value)}
                    className='mr-2'
                  />
                  <span className='text-sm'>{location.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Listing Type Filter */}
          <div>
            <h4 className='text-sm font-medium text-gray-700 mb-2'>
              Listing Type
            </h4>
            <div className='grid grid-cols-1 gap-2'>
              {listingTypes.map(type => (
                <label key={type.value} className='flex items-center'>
                  <input
                    type='checkbox'
                    checked={filters.listingType.includes(type.value)}
                    onChange={() => handleListingTypeChange(type.value)}
                    className='mr-2'
                  />
                  <span className='text-sm'>{type.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sort Options */}
      <div className='flex items-center space-x-2'>
        <span className='text-sm text-gray-600'>Sort by:</span>
        <select
          value={sortBy}
          onChange={e => handleSortChange(e.target.value)}
          className='text-sm border border-gray-300 rounded px-2 py-1'
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
