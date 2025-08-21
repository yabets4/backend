import { badRequest } from '../utils/apiResponse.js';
import { sanitizePrefix } from '../utils/prefix.utils.js';

/**
 * Tenant is determined at login and stored in JWT as user.tenantPrefix.
 * For public routes that accept company name, allow X-Company header or query.
 */
export default function tenantMiddleware(req, res, next) {
  let prefix = req.user?.tenantPrefix || req.headers['x-company'] || req.query.company;
  if (!prefix) return badRequest(res, 'Tenant prefix not provided');
  prefix = sanitizePrefix(String(prefix));
  if (!prefix) return badRequest(res, 'Invalid tenant prefix');
  req.tenantPrefix = prefix;
  next();
}
