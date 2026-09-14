/**
 * Role-Based Access Control (RBAC) middleware.
 * Verifies that the authenticated user possesses one of the permitted roles.
 *
 * @param  {...string} allowedRoles Roles authorized to access the resource
 */
export function requireRole(...allowedRoles) {
  // Flatten if passed as an array
  const flatRoles = allowedRoles.flat();

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication is required prior to role authorization.'
        }
      });
    }

    if (!flatRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Role '${req.user.role}' is not authorized to access this resource. Required role(s): [${flatRoles.join(', ')}].`
        }
      });
    }

    next();
  };
}

export default requireRole;
