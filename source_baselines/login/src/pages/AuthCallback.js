import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleAuthCallback } = useAuth();

  const [status, setStatus] = useState('Completing authentication...');

  useEffect(() => {
    let cancelled = false;

    const completeAuthentication = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');
      const errorDescription =
        searchParams.get('error_description');

      if (error) {
        setStatus(
          `Authentication failed: ${
            errorDescription || error
          }`
        );

        setTimeout(() => {
          if (!cancelled) {
            navigate(
              `/login?error=${encodeURIComponent(
                errorDescription || error
              )}`,
              { replace: true }
            );
          }
        }, 1500);

        return;
      }

      if (!token) {
        setStatus('No authentication token was received.');

        setTimeout(() => {
          if (!cancelled) {
            navigate('/login?error=missing_token', {
              replace: true
            });
          }
        }, 1500);

        return;
      }

      try {
        setStatus('Verifying your Med-X account...');

        /*
         * Important:
         *
         * handleAuthCallback:
         *   1. stores the JWT
         *   2. configures Axios authorization
         *   3. calls /auth/me
         *   4. establishes the authenticated user
         */
        const user = await handleAuthCallback(token);

        if (cancelled) {
          return;
        }

        if (!user) {
          throw new Error(
            'The authentication token could not be verified.'
          );
        }

        setStatus('Authentication successful. Opening Med-X...');

        /*
         * Preserve an explicitly requested destination when
         * one exists.
         */
        const storedRedirect =
          localStorage.getItem('postLoginRedirect');

        if (storedRedirect) {
          localStorage.removeItem('postLoginRedirect');
        }

        /*
         * Med-X workspace is determined by authenticated role.
         *
         * candidate      -> Patient
         * organization   -> Healthcare Professional
         */


        // The selected Med-X role is preserved locally across OAuth.
        // Backend role remains authoritative when available.
        const selectedRole = sessionStorage.getItem('medxSelectedRole');

        const effectiveRole =
          user.role === 'organization' || selectedRole === 'organization'
            ? 'organization'
            : 'candidate';



        const destination =
          effectiveRole === 'organization'
            ? '/professional'
            : '/dashboard';



        navigate(destination, {
          replace: true
        });

      } catch (err) {
        console.error(
          'Authentication callback failed:',
          err
        );

        if (cancelled) {
          return;
        }

        setStatus(
          'We could not verify your Med-X account.'
        );

        /*
         * Remove the unusable token so the application does
         * not repeatedly try to restore a failed session.
         */
        localStorage.removeItem('token');

        setTimeout(() => {
          if (!cancelled) {
            navigate('/login?error=verification', {
              replace: true
            });
          }
        }, 1800);
      }
    };

    completeAuthentication();

    return () => {
      cancelled = true;
    };
  }, [searchParams, navigate, handleAuthCallback]);

  return (
    <div className="auth-container">
      <div className="auth-card">

        <div className="medx-auth-brand">
          <p className="medx-eyebrow">Med-X</p>
          <h1>Med-X</h1>
        </div>

        <h2 className="auth-title">
          Authentication
        </h2>

        <div
          style={{
            marginTop: '24px',
            padding: '22px',
            borderRadius: '14px',
            background: '#f8fafc',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}
        >
          <div
            className="spinner"
            style={{
              margin: '0 auto 16px'
            }}
          />

          <p
            style={{
              margin: 0,
              color: '#475569',
              lineHeight: 1.6
            }}
          >
            {status}
          </p>
        </div>

        <p
          className="auth-footer"
          style={{
            marginTop: '20px'
          }}
        >
          Please wait while Med-X securely verifies
          your account.
        </p>

      </div>
    </div>
  );
};

export default AuthCallback;
