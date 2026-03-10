/**
 * Login Page Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Login } from './Login';
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

function renderLogin() {
    return render(
        <BrowserRouter>
            <AuthProvider>
                <Login />
            </AuthProvider>
        </BrowserRouter>
    );
}

describe('Login', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders login form', () => {
        renderLogin();
        
        expect(screen.getByText('World Pet')).toBeInTheDocument();
        expect(screen.getByText('Inicia sesion en tu cuenta')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('tu@correo.com')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Tu contrasena')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /iniciar sesion/i })).toBeInTheDocument();
    });

    it('shows validation error for empty email', async () => {
        const user = userEvent.setup();
        renderLogin();
        
        const emailInput = screen.getByPlaceholderText('tu@correo.com');
        await user.click(emailInput);
        await user.tab(); // Blur to trigger validation
        
        await waitFor(() => {
            expect(screen.getByText('El correo es requerido')).toBeInTheDocument();
        });
    });

    it('shows validation error for invalid email format', async () => {
        const user = userEvent.setup();
        renderLogin();
        
        const emailInput = screen.getByPlaceholderText('tu@correo.com');
        await user.type(emailInput, 'invalid-email');
        await user.tab();
        
        await waitFor(() => {
            expect(screen.getByText('Ingresa un correo valido')).toBeInTheDocument();
        });
    });

    it('shows validation error for empty password', async () => {
        const user = userEvent.setup();
        renderLogin();
        
        const passwordInput = screen.getByPlaceholderText('Tu contrasena');
        await user.click(passwordInput);
        await user.tab();
        
        await waitFor(() => {
            expect(screen.getByText('La contrasena es requerida')).toBeInTheDocument();
        });
    });

    it('shows validation error for short password', async () => {
        const user = userEvent.setup();
        renderLogin();
        
        const passwordInput = screen.getByPlaceholderText('Tu contrasena');
        await user.type(passwordInput, '12345');
        await user.tab();
        
        await waitFor(() => {
            expect(screen.getByText('La contrasena debe tener al menos 6 caracteres')).toBeInTheDocument();
        });
    });

    it('has link to registration page', () => {
        renderLogin();
        
        const registerLink = screen.getByRole('link', { name: /registrate/i });
        expect(registerLink).toBeInTheDocument();
        expect(registerLink).toHaveAttribute('href', '/register');
    });

    it('clears validation errors when user types valid input', async () => {
        const user = userEvent.setup();
        renderLogin();
        
        const emailInput = screen.getByPlaceholderText('tu@correo.com');
        
        // Trigger validation error
        await user.click(emailInput);
        await user.tab();
        
        await waitFor(() => {
            expect(screen.getByText('El correo es requerido')).toBeInTheDocument();
        });
        
        // Type valid email
        await user.type(emailInput, 'valid@email.com');
        
        await waitFor(() => {
            expect(screen.queryByText('El correo es requerido')).not.toBeInTheDocument();
        });
    });
});
