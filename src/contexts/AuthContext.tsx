// src/contexts/AuthContext.tsx
import {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';

interface UserProfile {
	id: string;
	username: string;
	display_name: string;
	avatar_url: string;
	is_admin: boolean;
	[key: string]: any;
}

interface AuthContextType {
	user: User | null;
	userProfile: UserProfile | null;
	isAdmin: boolean;
	loading: boolean;
	signIn: (email, password) => Promise<{ error: any }>;
	signUp: (email, password, username) => Promise<{ error: any }>;
	signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
	const [isAdmin, setIsAdmin] = useState(false);
	const [loading, setLoading] = useState(true);

	const fetchUserProfile = async (user: User) => {
		if (user) {
			const { data: profile, error } = await supabase
				.from('profiles')
				.select('*')
				.eq('id', user.id)
				.single();

			if (error) {
				console.error('Error fetching profile:', error);
				// Even if profile fetch fails, we've authenticated, so stop loading
				setLoading(false);
			} else if (profile) {
				setUserProfile(profile);
				setIsAdmin(profile.is_admin || false);
			}
		}
	};

	useEffect(() => {
		const getSession = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			setUser(session?.user ?? null);

			if (session?.user) {
				await fetchUserProfile(session.user);
			}
			setLoading(false);
		};

		getSession();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(
			async (_event: AuthChangeEvent, session: Session | null) => {
				setUser(session?.user ?? null);
				if (session?.user) {
					await fetchUserProfile(session.user);
				} else {
					// User logged out
					setUserProfile(null);
					setIsAdmin(false);
				}
				// Only set loading to false here if we didn't do it in getSession
				if (loading) {
					setLoading(false);
				}
			}
		);

		return () => {
			subscription.unsubscribe();
		};
	}, []); // Empty dependency array ensures this runs once on mount

	const signIn = async (email, password) => {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});
		// The onAuthStateChange listener will handle fetching the profile
		return { error };
	};

	const signUp = async (email, password, username) => {
		// --- THIS IS THE FIX (Part 1) ---
		// Removed the stray underscore after the brackets
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					username: username,
					display_name: username, // Default display_name to username
				},
			},
		});
		// The onAuthStateChange listener will handle setting the user
		// The database trigger will create the profile
        
		// --- THIS IS THE FIX (Part 2) ---
		// Changed `_` to `error`
		return { error };
	};

	const signOut = async () => {
		await supabase.auth.signOut();
		setUser(null);
		setUserProfile(null);
		setIsAdmin(false);
	};

	const value = {
		user,
		userProfile,
		isAdmin,
		loading,
		signIn,
		signUp,
		signOut,
	};

	return (
		<AuthContext.Provider value={value}>
			{!loading && children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};