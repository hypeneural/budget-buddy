import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api';

interface User {
    id: number;
    name: string;
    email: string;
    company_id: number;
    company?: {
        id: number;
        name: string;
        slug: string;
    };
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                try {
                    const response = await authApi.me();
                    setUser(response.data.user);
                } catch {
                    localStorage.removeItem('auth_token');
                    setToken(null);
                    setUser(null);
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, [token]);

    const login = async (email: string, password: string) => {
        const response = await authApi.login(email, password);
        const { user, token } = response.data;
        localStorage.setItem('auth_token', token);
        setToken(token);
        setUser(user);
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch {
            // Ignore errors on logout
        }
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
