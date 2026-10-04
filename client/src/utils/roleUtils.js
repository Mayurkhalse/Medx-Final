/**
 * Role-based redirection utilities for Med-X application.
 */

/**
 * Helper to get the canonical workspace landing page path for a user role.
 * @param {string} role - The user role ('patient' | 'doctor' | 'hospital_admin' | 'lab_admin')
 * @returns {string} The default route path for the workspace
 */
export function getWorkspacePathForRole(role) {
  switch (role) {
    case 'patient':
      return '/patient';
    case 'doctor':
      return '/doctor';
    case 'hospital_admin':
      return '/hospital';
    case 'lab_admin':
      return '/lab';
    default:
      return '/';
  }
}

/**
 * Check if a specific URL pathname is authorized for a given user role.
 * @param {string} pathname - The target URL path (e.g. '/doctor', '/patient')
 * @param {string} role - The authenticated user's role
 * @returns {boolean} True if the path is allowed for this role
 */
export function isPathAllowedForRole(pathname, role) {
  if (!pathname || typeof pathname !== 'string') return false;
  const path = pathname.toLowerCase();
  if (path === '/' || path === '/login' || path === '/register' || path === '/unauthorized') {
    return false;
  }
  if (path.startsWith('/check-in')) return true;
  if (path.startsWith('/patient') && role === 'patient') return true;
  if (path.startsWith('/doctor') && role === 'doctor') return true;
  if (path.startsWith('/hospital') && role === 'hospital_admin') return true;
  if (path.startsWith('/lab') && role === 'lab_admin') return true;
  return false;
}

export default { getWorkspacePathForRole, isPathAllowedForRole };
