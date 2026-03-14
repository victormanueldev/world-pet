/**
 * PetList — Grid display of pet cards with empty state
 *
 * Responsive grid layout with staggered animations
 */
import { motion } from 'framer-motion';
import { PawPrint } from 'lucide-react';
import type { Pet } from '@/types/pet';
import { PetCard } from './PetCard';

interface PetListProps {
  pets: Pet[];
  loading?: boolean;
  emptyMessage?: string;
  onPetClick?: (pet: Pet) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function PetList({ pets, loading = false, emptyMessage = 'No pets found', onPetClick }: PetListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="glass rounded-xl border border-white/10 overflow-hidden animate-pulse">
            <div className="aspect-square bg-white/5" />
            <div className="p-4 space-y-3">
              <div className="h-5 bg-white/10 rounded w-3/4" />
              <div className="h-4 bg-white/10 rounded w-1/2" />
              <div className="h-3 bg-white/10 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="flex flex-col items-center justify-center py-20 px-4"
      >
        <div className="w-24 h-24 rounded-full glass border border-white/10 flex items-center justify-center mb-6">
          <PawPrint size={48} className="text-text-secondary" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No Pets Yet</h3>
        <p className="text-text-secondary text-center max-w-md">{emptyMessage}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {pets.map((pet) => (
        <motion.div key={pet.id} variants={itemVariants}>
          <PetCard pet={pet} onClick={onPetClick} />
        </motion.div>
      ))}
    </motion.div>
  );
}
