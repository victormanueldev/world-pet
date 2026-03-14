/**
 * OwnerPets Page
 *
 * Pet owner interface for viewing and managing their own pets
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { PetList } from '@/components/pets/PetList';
import { listPets } from '@/services/pets';
import { extractApiError } from '@/services/api';
import { useTenant } from '@/context/TenantContext';
import type { Pet } from '@/types/pet';

export function OwnerPets() {
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listPets();
      setPets(response.items);
    } catch (err) {
      const apiError = extractApiError(err);
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPet = () => {
    navigate(`/${currentTenant?.slug}/owner/pets/new`);
  };

  const handlePetClick = (pet: Pet) => {
    navigate(`/${currentTenant?.slug}/owner/pets/${pet.id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="My Pets" subtitle="Manage your pets">
        <Button variant="primary" size="md" leftIcon={<Plus size={20} />} onClick={handleAddPet}>
          Add Pet
        </Button>
      </PageHeader>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl border border-status-error/30 bg-status-error/10 p-4"
        >
          <p className="text-status-error text-sm">{error}</p>
          <button onClick={loadPets} className="text-sm text-white/70 hover:text-white underline mt-2">
            Try again
          </button>
        </motion.div>
      )}

      <PetList
        pets={pets}
        loading={loading}
        emptyMessage="You haven't added any pets yet. Click 'Add Pet' to get started!"
        onPetClick={handlePetClick}
      />
    </div>
  );
}
