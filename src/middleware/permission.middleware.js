import { forbidden } from '../utils/apiResponse.js';

export default function permission(requiredRole) {
  return (req, res, next) => {
    const roles = req.user?.roles || [];
    if (!requiredRole || roles.includes(requiredRole) || roles.includes('super_admin')) return next();
    return forbidden(res, 'Insufficient permissions');
  };
}
