import React from 'react';
import { motion } from 'framer-motion';
import {
    Heart,
    Calendar,
    Dna,
    Syringe,
    Beef,
    MapPin,
    Clock
} from 'lucide-react';

const PetProfile: React.FC = () => {
    // Mock data for demonstration
    const pet = {
        name: 'Luna',
        species: 'Dog',
        breed: 'Golden Retriever',
        sex: 'Female',
        birthDate: '2022-05-15',
        weight: '24 kg',
        sterilized: true,
        photoPath: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=300',
        address: '123 Pet Lane, Pawsome City'
    };

    const records = [
        { type: 'Vaccine', name: 'Rabies', date: '2023-10-12', icon: Syringe, color: '#3b82f6' },
        { type: 'Medical', name: 'Annual Checkup', date: '2023-11-20', icon: Calendar, color: '#10b981' },
        { type: 'Nutrition', name: 'Premium Kibble', date: '2024-01-05', icon: Beef, color: '#f59e0b' },
    ];

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {/* Header card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="premium-card"
                style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', marginBottom: '2rem' }}
            >
                <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: 'var(--radius-xl)',
                    overflow: 'hidden',
                    flexShrink: 0
                }}>
                    <img src={pet.photoPath} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <h1 style={{ margin: 0, fontSize: '2rem' }}>{pet.name}</h1>
                        <Heart size={24} style={{ fill: '#ef4444', color: '#ef4444' }} />
                    </div>
                    <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.25rem 0' }}>
                        <Dna size={16} /> {pet.species} • {pet.breed}
                    </p>
                    <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.25rem 0' }}>
                        <MapPin size={16} /> {pet.address}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="glassmorphism" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
                        Edit Profile
                    </button>
                </div>
            </motion.div>

            {/* Grid for details */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem'
            }}>
                {/* Basic Info */}
                <section>
                    <h3 style={{ marginBottom: '1rem' }}>General Information</h3>
                    <div className="premium-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Age</p>
                            <p style={{ fontWeight: 600 }}>1 year, 8 months</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Weight</p>
                            <p style={{ fontWeight: 600 }}>{pet.weight}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Sex</p>
                            <p style={{ fontWeight: 600 }}>{pet.sex}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Sterilized</p>
                            <p style={{ fontWeight: 600 }}>Yes</p>
                        </div>
                    </div>
                </section>

                {/* Recent Activity */}
                <section>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0 }}>Recent Records</h3>
                        <button style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>View All</button>
                    </div>
                    <div className="premium-card">
                        {records.map((record, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem 0',
                                borderBottom: index === records.length - 1 ? 'none' : '1px solid var(--border)'
                            }}>
                                <div style={{
                                    backgroundColor: `${record.color}15`,
                                    color: record.color,
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-md)'
                                }}>
                                    <record.icon size={20} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 600, margin: 0 }}>{record.name}</p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{record.type}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Clock size={12} /> {record.date}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default PetProfile;
