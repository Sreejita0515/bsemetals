// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth as firebaseAuth, isFirebaseConfigured } from '../firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(!isFirebaseConfigured);

  // Sync token and claims for Firebase User
  const syncFirebaseUser = async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const jwtToken = await firebaseUser.getIdToken(true);

        // Fetch profile from DB — role stored there is the source of truth
        let role = 'customer'; // safe default
        let dbProfile = null;
        try {
          const profileRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/profile`, {
            headers: { 'Authorization': `Bearer ${jwtToken}` }
          });
          if (profileRes.ok) {
            dbProfile = await profileRes.json();
            role = dbProfile.role || 'customer'; // DB role wins
          }
        } catch (e) {
          console.error('Could not fetch user profile from DB', e);
          // Fallback to Firebase claims if DB unreachable
          const tokenResult = await firebaseUser.getIdTokenResult(true);
          role = tokenResult.claims.role || (firebaseUser.email?.endsWith('@bsemetals.com') ? 'admin' : 'customer');
        }

        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          role,
          name: dbProfile?.name || firebaseUser.displayName || firebaseUser.email.split('@')[0],
          ...(dbProfile || {}),
        };

        setUser(userData);
        setToken(jwtToken);
        localStorage.setItem('bsemetals_token', jwtToken);
      } catch (err) {
        console.error('Error syncing user:', err);
        setUser(null);
        setToken(null);
        localStorage.removeItem('bsemetals_token');
      }
    } else {
      setUser(null);
      setToken(null);
      localStorage.removeItem('bsemetals_token');
    }
  };

  useEffect(() => {
    if (!isMock) {
      const unsubscribe = onAuthStateChanged(firebaseAuth, async (fbUser) => {
        setLoading(true);
        await syncFirebaseUser(fbUser);
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Dev mode mock persistence check
      const mockSession = localStorage.getItem('bsemetals_mock_session');
      if (mockSession) {
        try {
          const parsed = JSON.parse(mockSession);
          setUser(parsed.user);
          setToken(parsed.token);
          localStorage.setItem('bsemetals_token', parsed.token);
        } catch (err) {
          localStorage.removeItem('bsemetals_mock_session');
        }
      }
      setLoading(false);
    }
  }, [isMock]);

  // Login handler
  const login = async (email, password, role = 'customer', adminSecret = '') => {
    setLoading(true);

    // If attempting to login as admin, pre-verify the secret key
    if (role === 'admin' && adminSecret) {
      try {
        const verifyRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/verify-secret`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ secret: adminSecret })
        });
        if (!verifyRes.ok) {
          const err = await verifyRes.json();
          throw new Error(err.error || 'Invalid Admin Secret Key');
        }
      } catch (err) {
        setLoading(false);
        throw err;
      }
    }

    if (isMock) {
      // Simulate login delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockToken = `mock-token-${role}`;
      const userData = role === 'admin' 
        ? { uid: 'demo-admin-uid', email: 'admin@bsemetals.com', role: 'admin', name: 'Admin Dashboard User' }
        : { uid: 'demo-customer-uid', email: 'rajesh@alphaelec.com', role: 'customer', name: 'Rajesh Patel' };

      setUser(userData);
      setToken(mockToken);
      localStorage.setItem('bsemetals_token', mockToken);
      localStorage.setItem('bsemetals_mock_session', JSON.stringify({ user: userData, token: mockToken }));
      setLoading(false);
      return userData;
    } else {
      try {
        const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
        // Force token refresh to ensure custom claims (role) are loaded
        await credential.user.getIdToken(true);
        await syncFirebaseUser(credential.user);
        // Read the updated user state after sync
        const tokenResult = await credential.user.getIdTokenResult(true);
        const resolvedRole = tokenResult.claims.role || (credential.user.email?.endsWith('@bsemetals.com') ? 'admin' : 'customer');
        setLoading(false);
        return { uid: credential.user.uid, email: credential.user.email, role: resolvedRole };
      } catch (error) {
        setLoading(false);
        throw error;
      }
    }
  };

  // Signup handler
  const signup = async (profileData, role = 'customer', adminSecret = '') => {
    setLoading(true);

    // If attempting to signup as admin, pre-verify the secret key
    if (role === 'admin' && adminSecret) {
      try {
        const verifyRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/verify-secret`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ secret: adminSecret })
        });
        if (!verifyRes.ok) {
          const err = await verifyRes.json();
          throw new Error(err.error || 'Invalid Admin Secret Key');
        }
      } catch (err) {
        setLoading(false);
        throw err;
      }
    }

    if (isMock) {
      // In mock mode, simply simulate a login
      return await login(profileData.email, profileData.password, role, adminSecret);
    } else {
      try {
        const credential = await createUserWithEmailAndPassword(firebaseAuth, profileData.email, profileData.password);
        
        // get token to save profile
        const jwtToken = await credential.user.getIdToken();

        // assign role explicitly via backend
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/set-role`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
          },
          body: JSON.stringify({
            uid: credential.user.uid,
            email: credential.user.email,
            role: role
          })
        });

        // save profile to backend (with role — DB is source of truth)
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/profile`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`
          },
          body: JSON.stringify({
            name: profileData.name || 'Admin',
            email: profileData.email,
            role: role,  // Store role in DB
            phone: profileData.phone || '',
            companyName: profileData.companyName || '',
            companyAddress: profileData.companyAddress || '',
            gstin: profileData.gstin || ''
          })
        });

        // Force a token refresh to load new claims
        await credential.user.getIdToken(true);
        await syncFirebaseUser(credential.user);
        setLoading(false);
        return credential.user;
      } catch (error) {
        setLoading(false);
        throw error;
      }
    }
  };

  // Logout handler
  const logout = async () => {
    setLoading(true);
    if (isMock) {
      setUser(null);
      setToken(null);
      localStorage.removeItem('bsemetals_token');
      localStorage.removeItem('bsemetals_mock_session');
      setLoading(false);
    } else {
      try {
        await signOut(firebaseAuth);
        setUser(null);
        setToken(null);
        localStorage.removeItem('bsemetals_token');
        setLoading(false);
      } catch (error) {
        setLoading(false);
        throw error;
      }
    }
  };

  // REST API fetch wrapper helper
  const apiFetch = async (endpoint, options = {}) => {
    const activeToken = localStorage.getItem('bsemetals_token') || token;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (activeToken) {
      headers['Authorization'] = `Bearer ${activeToken}`;
    }

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
    }

    return response.json();
  };

  const value = {
    user,
    token,
    loading,
    isMock,
    login,
    signup,
    logout,
    apiFetch,
    toggleDevMode: () => {
      setIsMock(prev => !prev);
      setUser(null);
      setToken(null);
      localStorage.removeItem('bsemetals_token');
      localStorage.removeItem('bsemetals_mock_session');
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
}
