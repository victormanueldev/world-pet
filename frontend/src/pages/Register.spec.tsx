/**
 * Register Page Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Register } from './Register';
import { AuthProvider } from '@/context/AuthContext';

// Mock the auth service
vi.mock('@/services/auth', () => ({
    login: vi.fn(),
    register: vi.fn(),
    refreshTokens: vi.fn(),
    getCurrentUser: vi.fn(),
    logout: vi.fn(),
}));

// Mock token storage
vi.mock('@/lib/tokenStorage', () => ({
    getAccessToken: vi.fn(() => null),
    getRefreshToken: vi.fn(() => null),
    setAccessToken: vi.fn(),
    setRefreshToken: vi.fn(),
    setTokens: vi.fn(),
    clearTokens: vi.fn(),
    isTokenExpired: vi.fn(() => true),
    getTokenExpiresIn: vi.fn(() => 0),
}));

function renderRegister() {
    return render(
        <BrowserRouter>
            <AuthProvider>
                <Register />
            </AuthProvider>
        </BrowserRouter>
    );
}

describe('Register', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders registration form', () => {
        renderRegister();
        
        expect(screen.getByText('World Pet')).toBeInTheDocument();
        expect(screen.getByText('Crea tu cuenta')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Tu nombre')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('tu@correo.com')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Minimo 8 caracteres')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Repite tu contrasena')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument();
    });

    it('shows validation error for empty name', async () => {
        const user = userEvent.setup();
        renderRegister();
        
        const nameInput = screen.getByPlaceholderText('Tu nombre');
        await user.click(nameInput);
        await user.tab();
        
        await waitFor(() => {
            expect(screen.getByText('El nombre es requerido')).toBeInTheDocument();
        });
    });

    it('shows validation error for short name', async () => {
        const user = userEvent.setup();
        renderRegister();
        
        const nameInput = screen.getByPlaceholderText('Tu nombre');
        await user.type(nameInput, 'A');
        await user.tab();
        
        await waitFor(() => {
            expect(screen.getByText('El nombre debe tener al menos 2 caracteres')).toBeInTheDocument();
        });
    });

    it('shows validation error for invalid email', async () => {
        const user = userEvent.setup();
        renderRegister();
        
        const emailInput = screen.getByPlaceholderText('tu@correo.com');
        await user.type(emailInput, 'notanemail');
        await user.tab();
        
        await waitFor(() => {
            expect(screen.getByText('Ingresa un correo valido')).toBeInTheDocument();
        });
    });

    it('shows validation error for weak password', async () => {
        const user = userEvent.setup();
        renderRegister();
        
        const passwordInput = screen.getByPlaceholderText('Minimo 8 caracteres');
        await user.type(passwordInput, 'weakpass');
        await user.tab();
        
        await waitFor(() => {
            expect(screen.getByText('Debe incluir mayusculas, minusculas y numeros')).toBeInTheDocument();
        });
    });

    it('shows validation error for mismatched passwords', async () => {
        const user = userEvent.setup();
        renderRegister();
        
        const passwordInput = screen.getByPlaceholderText('Minimo 8 caracteres');
        const confirmInput = screen.getByPlaceholderText('Repite tu contrasena');
        
        await user.type(passwordInput, 'StrongPass123');
        await user.type(confirmInput, 'DifferentPass123');
        await user.tab();
        
        await waitFor(() => {
            expect(screen.getByText('Las contrasenas no coinciden')).toBeInTheDocument();
        });
    });

    it('has link to login page', () => {
        renderRegister();
        
        const loginLink = screen.getByRole('link', { name: /inicia sesion/i });
        expect(loginLink).toBeInTheDocument();
        expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('validates password has required complexity', async () => {
        const user = userEvent.setup();
        renderRegister();
        
        const passwordInput = screen.getByPlaceholderText('Minimo 8 caracteres');
        
        // Only lowercase
        await user.type(passwordInput, 'onlylowercase');
        await user.tab();
        
        await waitFor(() => {
            expect(screen.getByText('Debe incluir mayusculas, minusculas y numeros')).toBeInTheDocument();
        });
        
        // Clear and type valid password
        await user.clear(passwordInput);
        await user.type(passwordInput, 'ValidPass123');
        
        await waitFor(() => {
            expect(screen.queryByText('Debe incluir mayusculas, minusculas y numeros')).not.toBeInTheDocument();
        });
    });
});
