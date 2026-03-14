/**
 * PetDetailPage — Detailed view of a pet (Owner)
 *
 * Shows pet information with tabs for overview, appointments, vaccines, nutrition
 */
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Edit, Calendar, Syringe, Apple, Info } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { getPet } from '@/services/pets';
import { extractApiError } from '@/services/api';
import { useTenant } from '@/context/TenantContext';
import { calculateAge, formatSpecies, formatSex } from '@/types/pet';
import type { Pet } from '@/types/pet';

type TabType = 'overview' | 'appointments' | 'vaccines' | 'nutrition';

const TABS: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: Info },
  { id: 'appointments', label: 'Appointments', icon: Calendar },
  { id: 'vaccines', label: 'Vaccines', icon: Syringe },
  { id: 'nutrition', label: 'Nutrition', icon: Apple },
];

export function PetDetailPage() {
  const navigate = useNavigate();
  const { petId } = useParams<{ petId: string }>();
  const { currentTenant } = useTenant();

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  useEffect(() => {
    if (petId) {
      loadPet(parseInt(petId));
    }
  }, [petId]);

  const loadPet = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPet(id);
      setPet(data);
    } catch (err) {
      const apiError = extractApiError(err);
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/${currentTenant?.slug}/owner/pets/${petId}/edit`);
  };

  const handleBack = () => {
    navigate(`/${currentTenant?.slug}/owner/pets`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Loading..." subtitle="Please wait" />
        <div className="glass rounded-xl border border-white/10 p-6 animate-pulse">
          <div className="flex gap-6">
            <div className="w-64 h-64 bg-white/5 rounded-lg" />
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-white/5 rounded w-1/3" />
              <div className="h-6 bg-white/5 rounded w-1/2" />
              <div className="h-6 bg-white/5 rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="space-y-6">
        <PageHeader title="Pet Not Found" subtitle="The pet could not be loaded">
          <Button variant="ghost" size="md" leftIcon={<ArrowLeft size={20} />} onClick={handleBack}>
            Back to Pets
          </Button>
        </PageHeader>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl border border-status-error/30 bg-status-error/10 p-6 text-center"
        >
          <p className="text-status-error text-sm">{error || 'Pet not found'}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={pet.name} subtitle={`${formatSpecies(pet.species)} • ${calculateAge(pet.birth_date)}`}>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="md" leftIcon={<Edit size={20} />} onClick={handleEdit}>
            Edit
          </Button>
          <Button variant="ghost" size="md" leftIcon={<ArrowLeft size={20} />} onClick={handleBack}>
            Back
          </Button>
        </div>
      </PageHeader>

      {/* Pet Header Card */}
      <div className="glass rounded-xl border border-white/10 overflow-hidden">
        <div className="flex flex-col md:flex-row gap-6 p-6">
          {/* Photo */}
          <div className="w-full md:w-64 h-64 rounded-lg overflow-hidden bg-gradient-to-br from-white/5 to-white/10">
            {pet.photo_url ? (
              <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Info size={64} className="text-text-secondary opacity-40" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-text-secondary mb-1">Species</p>
                <p className="text-white font-medium">{formatSpecies(pet.species)}</p>
              </div>
              {pet.breed && (
                <div>
                  <p className="text-sm text-text-secondary mb-1">Breed</p>
                  <p className="text-white font-medium">{pet.breed}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-text-secondary mb-1">Sex</p>
                <p className="text-white font-medium">{formatSex(pet.sex)}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-1">Age</p>
                <p className="text-white font-medium">{calculateAge(pet.birth_date)}</p>
              </div>
              {pet.weight && (
                <div>
                  <p className="text-sm text-text-secondary mb-1">Weight</p>
                  <p className="text-white font-medium">{pet.weight} kg</p>
                </div>
              )}
              <div>
                <p className="text-sm text-text-secondary mb-1">Sterilized</p>
                <p className="text-white font-medium">{pet.sterilized ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass rounded-xl border border-white/10 overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all whitespace-nowrap relative
                  ${
                    activeTab === tab.id
                      ? 'text-white bg-white/5'
                      : 'text-text-secondary hover:text-white hover:bg-white/5'
                  }`}
              >
                <Icon size={18} />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-lg font-semibold text-white mb-4">Pet Overview</h3>
                <p className="text-text-secondary">
                  {pet.name} is a {calculateAge(pet.birth_date)} old {formatSpecies(pet.species).toLowerCase()}
                  {pet.breed && ` of breed ${pet.breed}`}.
                </p>
              </motion.div>
            )}

            {activeTab === 'appointments' && (
              <motion.div
                key="appointments"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="text-center py-12"
              >
                <Calendar size={48} className="text-text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Appointments Yet</h3>
                <p className="text-text-secondary">Appointment scheduling will be available soon</p>
              </motion.div>
            )}

            {activeTab === 'vaccines' && (
              <motion.div
                key="vaccines"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="text-center py-12"
              >
                <Syringe size={48} className="text-text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Vaccine Records</h3>
                <p className="text-text-secondary">Vaccination tracking will be available soon</p>
              </motion.div>
            )}

            {activeTab === 'nutrition' && (
              <motion.div
                key="nutrition"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="text-center py-12"
              >
                <Apple size={48} className="text-text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Nutrition Logs</h3>
                <p className="text-text-secondary">Nutrition tracking will be available soon</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
