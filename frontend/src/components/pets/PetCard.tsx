/**
 * PetCard — Display card for pets in grid/list views
 *
 * Shows pet photo, name, species, age with dark glassmorphism styling
 */
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Dog, Cat, Bird, Circle } from 'lucide-react';
import { clsx } from 'clsx';
import type { Pet, PetSpecies } from '@/types/pet';
import { calculateAge, formatSpecies, formatStatus } from '@/types/pet';
import { useTenant } from '@/context/TenantContext';

interface PetCardProps {
  pet: Pet;
  onClick?: (pet: Pet) => void;
  className?: string;
}

const SPECIES_ICONS: Record<PetSpecies, React.ElementType> = {
  dog: Dog,
  cat: Cat,
  bird: Bird,
  rabbit: Circle,
  other: Circle,
};

const STATUS_COLORS: Record<string, string> = {
  owned: 'bg-brand/20 text-brand border-brand/30',
  available_for_adoption: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  inactive: 'bg-white/10 text-text-secondary border-white/10',
};

export function PetCard({ pet, onClick, className }: PetCardProps) {
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  const Icon = SPECIES_ICONS[pet.species];

  const handleClick = () => {
    if (onClick) {
      onClick(pet);
    } else {
      // Default navigation to pet detail
      navigate(`/${currentTenant?.slug}/owner/pets/${pet.id}`);
    }
  };

  const age = calculateAge(pet.birth_date);

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={handleClick}
      className={clsx(
        'glass rounded-xl border border-white/10 overflow-hidden cursor-pointer',
        'hover:border-brand/50 hover:shadow-glow transition-all duration-200',
        className
      )}
    >
      {/* Photo */}
      <div className="relative aspect-square bg-gradient-to-br from-white/5 to-white/10">
        {pet.photo_url ? (
          <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Icon size={64} className="text-text-secondary opacity-40" />
          </div>
        )}

        {/* Status Badge */}
        {pet.status !== 'owned' && (
          <div className="absolute top-3 right-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={clsx(
                'px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-sm',
                STATUS_COLORS[pet.status] || STATUS_COLORS.inactive
              )}
            >
              {formatStatus(pet.status)}
            </motion.div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-1 truncate">{pet.name}</h3>

        <div className="flex items-center gap-2 text-sm text-text-secondary mb-3">
          <Icon size={16} />
          <span>{formatSpecies(pet.species)}</span>
          {pet.breed && (
            <>
              <span className="text-white/20">•</span>
              <span className="truncate">{pet.breed}</span>
            </>
          )}
        </div>

        {/* Age and Weight */}
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>{age}</span>
          {pet.weight && <span>{pet.weight} kg</span>}
        </div>
      </div>
    </motion.div>
  );
}
