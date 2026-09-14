import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

/*
 * Med-X authentication backend
 *
 * The current backend exposes:
 *
 *   GET  /auth/me
 *   POST /auth/login
 *   POST /auth/register
 *   POST /auth/logout
 *   PUT  /auth/updateprofile
 *
 * The old Med-X frontend environment contains /api, so we remove
 * that suffix for authentication requests.
 */
const configuredApiUrl =
  process.env.REACT_APP_API_URL || 'http://localhost:5000';

const API_URL = configuredApiUrl.replace(/\/api\/?$/, '');

const OAUTH_URL =
  process.env.REACT_APP_OAUTH_URL || API_URL;


/*
 * Med-X terminology
 *
 * Backend compatibility:
 *
 *   candidate     -> Patient
 *   organization  -> Healthcare Professional
 *
 * We retain the backend role values internally because the existing
 * authentication system uses them.
 */
const normalizeRole = (role) => {
  if (role === 'jobseeker') return 'candidate';
  if (role === 'employer') return 'organization';
  if (role === 'admin') return 'organization';

  return role;
};


const normalizeUser = (user) => {
  if (!user) return null;

  const roleRaw = user.roleRaw || user.role;

  return {
    ...user,
    roleRaw,
    role: normalizeRole(roleRaw)
  };
};


const isOrganizationRole = (role) =>
  normalizeRole(role) === 'organization';


const isCandidateRole = (role) =>
  normalizeRole(role) === 'candidate';


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  /*
   * Restore an existing JWT session.
   */
  const checkAuth = useCallback(async () => {
    setLoading(true);

    const token = localStorage.getItem('token');

    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      axios.defaults.headers.common['Authorization'] =
        `Bearer ${token}`;

      const response = await axios.get(
        `${API_URL}/auth/me`,
        {
          timeout: 10000
        }
      );

      const normalizedUser =
        normalizeUser(response.data.user);

      setUser(normalizedUser);

      return normalizedUser;

    } catch (err) {
      console.error('Auth check failed:', err);

      localStorage.removeItem('token');

      delete axios.defaults.headers.common['Authorization'];

      setUser(null);

      return null;

    } finally {
      setLoading(false);
    }
  }, []);


  /*
   * Restore authentication when the application starts.
   */
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);


  /*
   * Email/password login.
   *
   * The current backend returns 501 because Google authentication
   * is currently the implemented authentication mechanism.
   */
  const login = async (email, password) => {
    try {
      setError(null);

      const response = await axios.post(
        `${API_URL}/auth/login`,
        {
          email,
          password
        },
        {
          withCredentials: true
        }
      );

      const { token, user } = response.data;

      localStorage.setItem('token', token);

      axios.defaults.headers.common['Authorization'] =
        `Bearer ${token}`;

      const normalizedUser =
        normalizeUser(user);

      setUser(normalizedUser);

      return {
        success: true,
        user: normalizedUser
      };

    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Login failed';

      setError(message);

      return {
        success: false,
        message
      };
    }
  };


  /*
   * Email/password registration.
   *
   * Kept because it belongs to the eventual authentication
   * architecture, although Google is currently implemented.
   */
  const register = async (
    name,
    email,
    password,
    role,
    company
  ) => {
    try {
      setError(null);

      const response = await axios.post(
        `${API_URL}/auth/register`,
        {
          name,
          email,
          password,
          role,
          company
        },
        {
          withCredentials: true
        }
      );

      const { token, user } = response.data;

      localStorage.setItem('token', token);

      axios.defaults.headers.common['Authorization'] =
        `Bearer ${token}`;

      const normalizedUser =
        normalizeUser(user);

      setUser(normalizedUser);

      return {
        success: true,
        user: normalizedUser
      };

    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Registration failed';

      setError(message);

      return {
        success: false,
        message
      };
    }
  };


  /*
   * Start Google OAuth.
   *
   * The selected Med-X role is passed to the backend and eventually
   * becomes part of the JWT payload.
   */
  const loginWithGoogle = useCallback((selectedRole = 'candidate', company = '') => {
    const role = selectedRole === 'organization'
      ? 'organization'
      : 'candidate';

    // Preserve the user's Med-X role across the Google OAuth round-trip.
    sessionStorage.setItem('medxSelectedRole', role);

    const params = new URLSearchParams();
    params.set('role', role);

    if (company) {
      params.set('company', company);
    }

    const redirect = localStorage.getItem('postLoginRedirect');
    if (redirect) {
      params.set('redirect', redirect);
    }

    window.location.href =
      `${OAUTH_URL}/auth/google?${params.toString()}`;
  }, []);


  /*
   * Complete Google OAuth callback.
   *
   * Store JWT → verify it through /auth/me → establish user.
   */
  const handleAuthCallback = useCallback(async (token) => {
    if (!token) {
      return null;
    }

    localStorage.setItem('token', token);

    axios.defaults.headers.common['Authorization'] =
      `Bearer ${token}`;

    return await checkAuth();

  }, [checkAuth]);


  /*
   * Logout.
   */
  const logout = async () => {
    try {
      await axios.post(
        `${API_URL}/auth/logout`,
        {},
        {
          withCredentials: true
        }
      );

    } catch (err) {
      console.error('Logout error:', err);
    }

    localStorage.removeItem('token');

    delete axios.defaults.headers.common['Authorization'];

    setUser(null);
  };


  /*
   * Profile update.
   */
  const updateProfile = async (profileData) => {
    try {
      setError(null);

      const response = await axios.put(
        `${API_URL}/auth/updateprofile`,
        profileData
      );

      const normalizedUser =
        normalizeUser(response.data.user);

      setUser(normalizedUser);

      return {
        success: true,
        user: normalizedUser
      };

    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Update failed';

      setError(message);

      return {
        success: false,
        message
      };
    }
  };


  const value = {
    user,
    loading,
    error,

    login,
    register,
    loginWithGoogle,
    handleAuthCallback,
    logout,
    updateProfile,

    isAuthenticated: !!user,

    isOrganization:
      isOrganizationRole(
        user?.roleRaw || user?.role
      ),

    isCandidate:
      isCandidateRole(
        user?.roleRaw || user?.role
      ),

    isAdmin:
      user?.roleRaw === 'admin'
  };


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () =>
  useContext(AuthContext);
