import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type');

    useEffect(() => {
        if (!tokenHash || type !== 'recovery') {
            navigate('/login');
        }
    }, [tokenHash, type, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            // First, verify the OTP to ensure the token is valid
            const { error: verifyError } = await supabase.auth.verifyOtp({
                token_hash: tokenHash,
                type: 'recovery',
                options: {
                    shouldCreateSession: false
                }
            });

            if (verifyError) throw verifyError;

            // Then, attempt to update the password
            const { error } = await supabase.auth.updateUser(
                { password: password },
                {
                    // Force update even without an active session
                    skipSessionRefresh: true
                }
            );

            if (error) throw error;

            toast.success('Password updated successfully!', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: false
            });
            setTimeout(() => {
                navigate('/login');
            }, 4000);
        } catch (error) {
            console.error('Error resetting password:', error);

            // Provide more specific error messages
            if (error.message.includes('AuthSessionMissingError')) {
                setError('Session expired. Please request a new password reset link.');
            } else if (error.message.includes('Invalid token')) {
                setError('Invalid or expired reset link. Please request a new one.');
            } else {
                setError(error.message || 'Failed to reset password. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Reset Your Password</h2>
                    <p className="mt-2 text-gray-600">Enter your new password below</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl shadow-xl p-8 border border-gray-100"
                >
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                New Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md
                                         shadow-sm focus:outline-none focus:ring-indigo-500
                                         focus:border-indigo-500"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm New Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md
                                         shadow-sm focus:outline-none focus:ring-indigo-500
                                         focus:border-indigo-500"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg
                                     hover:bg-indigo-700 transition-colors flex items-center justify-center
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Updating Password...
                                </>
                            ) : (
                                'Update Password'
                            )}
                        </button>
                    </form>
                </motion.div>
            </motion.div>
        </div>
    );
}
