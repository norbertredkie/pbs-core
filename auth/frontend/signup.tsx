/**
 * Unified OAuth Signup/Login Component
 * Gen Z aesthetic with neon + glassmorphism
 * Works across all 19 PBS products
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './signup.module.css';

interface SignupProps {
  productName: string;
  productId: string;
  onSuccess?: (token: string) => void;
  requiresAgeVerification?: boolean;
  minAge?: number;
}

interface FormData {
  email: string;
  name: string;
  acceptPrivacyPolicy: boolean;
  acceptTermsOfService: boolean;
  acceptSafetyPolicy: boolean;
  age18Plus: boolean;
}

const Signup: React.FC<SignupProps> = ({
  productName,
  productId,
  onSuccess,
  requiresAgeVerification = false,
  minAge = 13,
}) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'signup' | 'legal' | 'loading'>('signup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    name: '',
    acceptPrivacyPolicy: false,
    acceptTermsOfService: false,
    acceptSafetyPolicy: false,
    age18Plus: false,
  });

  const handleProviderClick = (provider: 'google' | 'apple' | 'discord' | 'fortnite') => {
    setSelectedProvider(provider);
    
    // Build OAuth redirect
    const redirectUri = `${window.location.origin}/auth/callback/${provider}`;
    const state = btoa(JSON.stringify({ productId, step: 'signup' }));
    
    const oauthUrls = {
      google: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.REACT_APP_GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=openid+email+profile&state=${state}`,
      apple: `https://appleid.apple.com/auth/authorize?client_id=${process.env.REACT_APP_APPLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=openid+email&state=${state}`,
      discord: `https://discord.com/api/oauth2/authorize?client_id=${process.env.REACT_APP_DISCORD_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=identify+email&state=${state}`,
      fortnite: `https://www.epicgames.com/id/authorize?client_id=${process.env.REACT_APP_FORTNITE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=basic+profile+email&state=${state}`,
    };
    
    window.location.href = oauthUrls[provider];
  };

  const handleLegalCheckboxChange = (field: keyof FormData) => {
    setFormData({
      ...formData,
      [field]: !formData[field],
    });
  };

  const isLegalAccepted = () => {
    return (
      formData.acceptPrivacyPolicy &&
      formData.acceptTermsOfService &&
      formData.acceptSafetyPolicy &&
      (!requiresAgeVerification || formData.age18Plus)
    );
  };

  const handleLegalProceed = () => {
    if (isLegalAccepted() && selectedProvider) {
      setStep('loading');
      handleProviderClick(selectedProvider as 'google' | 'apple' | 'discord' | 'fortnite');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Join {productName}</h1>
          <p className={styles.subtitle}>
            {step === 'signup'
              ? 'Choose your sign-up method'
              : 'Review and accept our terms'}
          </p>
        </div>

        {/* Signup Step */}
        {step === 'signup' && (
          <div className={styles.signupStep}>
            <div className={styles.oauthGrid}>
              {/* Google Button */}
              <button
                className={`${styles.oauthButton} ${styles.google}`}
                onClick={() => {
                  setSelectedProvider('google');
                  setStep('legal');
                }}
                aria-label="Sign up with Google"
              >
                <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Google</span>
              </button>

              {/* Apple Button */}
              <button
                className={`${styles.oauthButton} ${styles.apple}`}
                onClick={() => {
                  setSelectedProvider('apple');
                  setStep('legal');
                }}
                aria-label="Sign up with Apple"
              >
                <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 13.5c-.91 2.92 1.18 5.5 4.05 5.5 1.02 0 2.02-.28 2.88-.77V16c-1.06.67-2.3.88-3.24.4-1.44-.75-2.94-2.58-2.69-5.9M9 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m7.05 10.5c.9-2.92-1.18-5.5-4.05-5.5-1.02 0-2.02.28-2.88.77V8c1.06-.67 2.3-.88 3.24-.4 1.44.75 2.94 2.58 2.69 5.9" />
                </svg>
                <span>Apple</span>
              </button>

              {/* Discord Button */}
              <button
                className={`${styles.oauthButton} ${styles.discord}`}
                onClick={() => {
                  setSelectedProvider('discord');
                  setStep('legal');
                }}
                aria-label="Sign up with Discord"
              >
                <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.211.375-.445.864-.608 1.25a18.27 18.27 0 0 0-5.487 0c-.163-.386-.398-.875-.609-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.042-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.294.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.294a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.076.076 0 0 0-.041.107c.36.699.772 1.365 1.225 1.994a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.057c.5-4.718-.838-8.812-3.549-12.454a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-.965-2.157-2.156 0-1.193.96-2.157 2.157-2.157 1.198 0 2.157.964 2.157 2.157 0 1.19-.96 2.155-2.157 2.155zm7.975 0c-1.183 0-2.157-.965-2.157-2.156 0-1.193.96-2.157 2.157-2.157 1.198 0 2.157.964 2.157 2.157 0 1.19-.959 2.155-2.157 2.155z" />
                </svg>
                <span>Discord</span>
              </button>

              {/* Fortnite Button */}
              <button
                className={`${styles.oauthButton} ${styles.fortnite}`}
                onClick={() => {
                  setSelectedProvider('fortnite');
                  setStep('legal');
                }}
                aria-label="Sign up with Fortnite"
              >
                <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0m0 3c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9m1.5 4c-.83 0-1.5.67-1.5 1.5S12.67 10 13.5 10s1.5-.67 1.5-1.5S14.33 7 13.5 7m-3 0c-.83 0-1.5.67-1.5 1.5S8.67 10 9.5 10 11 9.33 11 8.5 10.33 7 9.5 7m1.5 10.5c-2.21 0-4-1.79-4-4h8c0 2.21-1.79 4-4 4z" />
                </svg>
                <span>Fortnite</span>
              </button>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {/* Login Link */}
            <p className={styles.loginLink}>
              Already have an account?{' '}
              <button onClick={() => navigate('/login')}>Sign in</button>
            </p>
          </div>
        )}

        {/* Legal Step */}
        {step === 'legal' && (
          <div className={styles.legalStep}>
            {/* Privacy Policy Checkbox */}
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={formData.acceptPrivacyPolicy}
                onChange={() => handleLegalCheckboxChange('acceptPrivacyPolicy')}
              />
              <span>
                I accept the{' '}
                <a href={`/docs/privacy-policy`} target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </a>
              </span>
            </label>

            {/* Terms of Service Checkbox */}
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={formData.acceptTermsOfService}
                onChange={() => handleLegalCheckboxChange('acceptTermsOfService')}
              />
              <span>
                I accept the{' '}
                <a href={`/docs/terms-of-service`} target="_blank" rel="noopener noreferrer">
                  Terms of Service
                </a>
              </span>
            </label>

            {/* Safety Policy Checkbox */}
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={formData.acceptSafetyPolicy}
                onChange={() => handleLegalCheckboxChange('acceptSafetyPolicy')}
              />
              <span>
                I agree to the{' '}
                <a href={`/docs/safety-policy`} target="_blank" rel="noopener noreferrer">
                  Safety & Acceptable Use Policy
                </a>
              </span>
            </label>

            {/* Age Verification (if required) */}
            {requiresAgeVerification && (
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={formData.age18Plus}
                  onChange={() => handleLegalCheckboxChange('age18Plus')}
                />
                <span>I confirm I am 18 years old or older</span>
              </label>
            )}

            {/* Action Buttons */}
            <div className={styles.actions}>
              <button
                className={styles.backButton}
                onClick={() => {
                  setStep('signup');
                  setSelectedProvider(null);
                }}
              >
                ← Back
              </button>
              <button
                className={`${styles.proceedButton} ${
                  isLegalAccepted() ? styles.enabled : styles.disabled
                }`}
                onClick={handleLegalProceed}
                disabled={!isLegalAccepted()}
              >
                Continue with {selectedProvider?.charAt(0).toUpperCase() + selectedProvider?.slice(1)}
              </button>
            </div>
          </div>
        )}

        {/* Loading Step */}
        {step === 'loading' && (
          <div className={styles.loadingStep}>
            <div className={styles.spinner}></div>
            <p>Redirecting to {selectedProvider}...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;
