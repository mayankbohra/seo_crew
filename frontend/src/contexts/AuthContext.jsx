import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Clear any existing session data on mount
        localStorage.removeItem('supabase.auth.token');

        const initializeAuth = async () => {
            try {
                // Force check session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    throw sessionError;
                }

                // Only set user if we have a valid session
                if (session?.user && session?.access_token) {
                    setUser(session.user);
                } else {
                    setUser(null);
                }

                // Listen for auth changes
                const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                    if (event === 'SIGNED_IN' && session?.user) {
                        setUser(session.user);
                    } else if (event === 'SIGNED_OUT') {
                        setUser(null);
                    }
                });

                return () => {
                    subscription?.unsubscribe();
                };
            } catch (error) {
                console.error('Auth error:', error);
                setError(error.message);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    // Provide sign out functionality
    const signOut = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        signOut
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
