/**
 * PetFilters — Search and filter controls for admin pet management
 *
 * Provides search, status, species filters with dark glassmorphism styling
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Filter } from 'lucide-react';
import { clsx } from 'clsx';
import type { PetStatus, PetSpecies } from '@/types/pet';
import { Button } from '@/components/ui/Button';

export interface PetFilterValues {
  search: string;
  status?: PetStatus;
  species?: PetSpecies;
}

interface PetFiltersProps {
  values: PetFilterValues;
  onChange: (values: PetFilterValues) => void;
  onClear?: () => void;
  className?: string;
}

const STATUS_OPTIONS: { value: PetStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'owned', label: 'Owned' },
  { value: 'available_for_adoption', label: 'Available for Adoption' },
  { value: 'inactive', label: 'Inactive' },
];

const SPECIES_OPTIONS: { value: PetSpecies | ''; label: string }[] = [
  { value: '', label: 'All Species' },
  { value: 'dog', label: 'Dogs' },
  { value: 'cat', label: 'Cats' },
  { value: 'bird', label: 'Birds' },
  { value: 'rabbit', label: 'Rabbits' },
  { value: 'other', label: 'Other' },
];

export function PetFilters({ values, onChange, onClear, className }: PetFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearchChange = (search: string) => {
    onChange({ ...values, search });
  };

  const handleStatusChange = (status: string) => {
    onChange({ ...values, status: status as PetStatus | undefined });
  };

  const handleSpeciesChange = (species: string) => {
    onChange({ ...values, species: species as PetSpecies | undefined });
  };

  const handleClear = () => {
    onChange({ search: '', status: undefined, species: undefined });
    onClear?.();
  };

  const hasActiveFilters = values.status || values.species;

  const inputClasses = clsx(
    'w-full h-10 px-4 rounded-lg',
    'glass border border-white/10',
    'text-white placeholder:text-text-secondary',
    'focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand',
    'transition-all duration-200'
  );

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Search Bar - Always Visible */}
      <div className="relative">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          value={values.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search pets by name..."
          className={clsx(inputClasses, 'pl-12 pr-10')}
        />
        {values.search && (
          <button
            onClick={() => handleSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/10 transition-colors"
          >
            <X size={16} className="text-text-secondary" />
          </button>
        )}
      </div>

      {/* Filter Toggle Button */}
      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          size="md"
          onClick={() => setIsExpanded(!isExpanded)}
          leftIcon={<Filter size={16} />}
          className="relative"
        >
          Filters
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand rounded-full" />
          )}
        </Button>

        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleClear}
            className="text-sm text-text-secondary hover:text-white transition-colors"
          >
            Clear filters
          </motion.button>
        )}
      </div>

      {/* Filter Options - Collapsible */}
      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="overflow-hidden"
      >
        <div className="glass rounded-xl border border-white/10 p-4 space-y-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Status</label>
            <select
              value={values.status || ''}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={inputClasses}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Species Filter */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Species</label>
            <select
              value={values.species || ''}
              onChange={(e) => handleSpeciesChange(e.target.value)}
              className={inputClasses}
            >
              {SPECIES_OPTIONS.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Filters */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Quick Filters</label>
            <div className="flex flex-wrap gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleStatusChange('available_for_adoption')}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  values.status === 'available_for_adoption'
                    ? 'bg-brand text-white'
                    : 'glass border border-white/10 text-text-secondary hover:text-white hover:border-brand/50'
                )}
              >
                Available for Adoption
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleStatusChange('owned')}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  values.status === 'owned'
                    ? 'bg-brand text-white'
                    : 'glass border border-white/10 text-text-secondary hover:text-white hover:border-brand/50'
                )}
              >
                Owned
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
