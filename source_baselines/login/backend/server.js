require('dotenv').config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');

const {
  PORT = 5000,
  FRONTEND_URL = 'http://localhost:3000',
  SESSION_SECRET = 'dev_session_secret',
  JWT_SECRET = 'dev_jwt_secret',
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL = 'http://localhost:5000/auth/google/callback'
} = process.env;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn(
    'Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in backend .env'
  );
}

const app = express();

/* ---------------------------------------------------------
   Middleware
   --------------------------------------------------------- */

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true
  })
);

app.use(express.json());

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: 'lax'
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL
    },
    (accessToken, refreshToken, profile, done) => {
      done(null, profile);
    }
  )
);

app.use(passport.initialize());
app.use(passport.session());

/* ---------------------------------------------------------
   Health check
   --------------------------------------------------------- */

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

/* ---------------------------------------------------------
   Google authentication
   --------------------------------------------------------- */

app.get('/auth/google', (req, res, next) => {
  const {
    role = 'candidate',
    company = '',
    redirect = ''
  } = req.query;

  req.session.oauth = {
    role,
    company,
    redirect
  };

  passport.authenticate('google', {
    scope: ['profile', 'email']
  })(req, res, next);
});

app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${FRONTEND_URL}/login?error=google`
  }),
  (req, res) => {
    const {
      role = 'candidate',
      company = '',
      redirect = ''
    } = req.session.oauth || {};

    req.session.oauth = null;

    const profile = req.user || {};

    const email =
      Array.isArray(profile.emails) && profile.emails[0]
        ? profile.emails[0].value
        : null;

    const name =
      profile.displayName ||
      email ||
      'User';

    const avatar =
      Array.isArray(profile.photos) && profile.photos[0]
        ? profile.photos[0].value
        : null;

    /*
     * Med-X currently maps:
     *
     * candidate    -> Patient
     * organization -> Healthcare Professional
     *
     * Keep the internal role values for backend compatibility.
     */

    const payload = {
      id: profile.id,
      email,
      name,
      avatar,

      roleRaw: role,
      role,

      company,
      provider: 'google'
    };

    const token = jwt.sign(
      payload,
      JWT_SECRET,
      {
        expiresIn: '7d'
      }
    );

    const redirectUrl = new URL(
      redirect || '/auth/callback',
      FRONTEND_URL
    );

    redirectUrl.searchParams.set('token', token);

    res.redirect(redirectUrl.toString());
  }
);

/* ---------------------------------------------------------
   Authentication middleware
   --------------------------------------------------------- */

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || '';

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({
      message: 'Missing token'
    });
  }

  try {
    req.user = jwt.verify(
      token,
      JWT_SECRET
    );

    return next();
  } catch (err) {
    return res.status(401).json({
      message: 'Invalid token'
    });
  }
};

/* ---------------------------------------------------------
   Current authenticated user
   --------------------------------------------------------- */

app.get('/auth/me', requireAuth, (req, res) => {
  res.json({
    user: req.user
  });
});

/* ---------------------------------------------------------
   Logout
   --------------------------------------------------------- */

app.post('/auth/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(() => {
      res.json({
        success: true
      });
    });

    return;
  }

  res.json({
    success: true
  });
});

/* ---------------------------------------------------------
   Email/password placeholders
   --------------------------------------------------------- */

app.post('/auth/login', (req, res) => {
  res.status(501).json({
    message:
      'Email/password login is not configured. Use Google sign in.'
  });
});

app.post('/auth/register', (req, res) => {
  res.status(501).json({
    message:
      'Email/password registration is not configured. Use Google sign up.'
  });
});

app.put('/auth/updateprofile', (req, res) => {
  res.status(501).json({
    message:
      'Profile updates require a database.'
  });
});

/* ---------------------------------------------------------
   Start server
   --------------------------------------------------------- */

app.listen(PORT, () => {
  console.log(`Auth server running on port ${PORT}`);
});
