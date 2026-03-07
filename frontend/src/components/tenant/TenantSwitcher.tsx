import { useTenant } from '../../context/TenantContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export function TenantSwitcher() {
  const { currentTenant, tenants, setCurrentTenant } = useTenant();
  const [isOpen, setIsOpen] = useState(false);

  if (tenants.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
      >
        <span className="text-sm font-medium text-white">
          {currentTenant?.name || 'Select Tenant'}
        </span>
        <svg
          className={`w-4 h-4 text-white/70 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-white/10 overflow-hidden z-50"
          >
            {tenants.map((tenant: { id: number; name: string; slug: string }) => (
              <button
                key={tenant.id}
                onClick={() => {
                  setCurrentTenant(tenant);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-white/10 transition-colors ${
                  currentTenant?.id === tenant.id
                    ? 'text-blue-400 bg-blue-500/10'
                    : 'text-white'
                }`}
              >
                {tenant.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
