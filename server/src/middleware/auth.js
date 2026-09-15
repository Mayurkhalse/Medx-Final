import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import { User } from '../models/User.js';

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required. No Bearer token provided in Authorization header.'
        }
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid Authorization header format.'
        }
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Authentication token has expired. Please log in again.'
          }
        });
      }
      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid authentication token.'
        }
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'The user corresponding to this token no longer exists.'
        }
      });
    }

    if (user.isDeactivated) {
      return res.status(401).json({
        error: {
          code: 'ACCOUNT_DEACTIVATED',
          message: 'This account has been deactivated and is no longer accessible.'
        }
      });
    }

    req.user = user;
    req.tokenPayload = decoded;
    next();
  } catch (error) {
    next(error);
  }
}

export default requireAuth;
