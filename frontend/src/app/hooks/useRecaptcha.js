'use client';

import { useEffect, useState } from 'react';

export default function useRecaptcha() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (window.grecaptcha) {
      setIsLoaded(true);
      return;
    }

    // Set up an interval to check for reCAPTCHA loading
    const interval = setInterval(() => {
      if (window.grecaptcha) {
        setIsLoaded(true);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const executeRecaptcha = async (action) => {
    if (!isLoaded) {
      throw new Error('reCAPTCHA not loaded yet');
    }

    try {
      const token = await window.grecaptcha.execute(
        process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
        { action }
      );
      return token;
    } catch (error) {
      console.error('reCAPTCHA execution error:', error);
      throw error;
    }
  };

  return { executeRecaptcha, isLoaded };
}