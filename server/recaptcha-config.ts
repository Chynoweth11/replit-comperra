/**
 * Google reCAPTCHA Enterprise configuration and verification
 */

export const RECAPTCHA_CONFIG = {
  // Development-friendly reCAPTCHA configuration
  siteKey: process.env.NODE_ENV === 'development' 
    ? '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI' // Google's test key for localhost
    : '6LcUZYIrAAAAAHwZwRABhcP_nYWzSmALqoXKXDjo', // Production key
  projectId: 'comperra-done',
  apiEndpoint: 'https://recaptchaenterprise.googleapis.com/v1/projects/comperra-done/assessments'
};

export interface RecaptchaAssessment {
  event: {
    token: string;
    expectedAction: string;
    siteKey: string;
    transactionData?: {
      transactionId?: string;
      paymentMethod?: string;
      cardBin?: string;
      cardLastFour?: string;
      currencyCode?: string;
      value?: number;
      user?: {
        email?: string;
      };
      billingAddress?: {
        recipient?: string;
        address?: string[];
        locality?: string;
        administrativeArea?: string;
        regionCode?: string;
        postalCode?: string;
      };
    };
  };
}

export interface RecaptchaResponse {
  name: string;
  event: {
    token: string;
    siteKey: string;
    userAgent: string;
    userIpAddress: string;
    expectedAction: string;
  };
  score: number;
  tokenProperties: {
    valid: boolean;
    invalidReason?: string;
    hostname: string;
    action: string;
    createTime: string;
  };
  riskAnalysis: {
    score: number;
    reasons: string[];
  };
  fraudPreventionAssessment?: {
    transactionRisk: number;
  };
}

/**
 * Verify reCAPTCHA token with Google reCAPTCHA Enterprise
 */
export async function verifyRecaptchaToken(
  token: string, 
  expectedAction: string, 
  transactionData?: RecaptchaAssessment['event']['transactionData']
): Promise<{ success: boolean; score?: number; transactionRisk?: number; error?: string }> {
  try {
    // In development mode with Google's test key, always pass verification
    if (process.env.NODE_ENV === 'development' && RECAPTCHA_CONFIG.siteKey === '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI') {
      console.log('✅ Development mode: reCAPTCHA verification bypassed');
      return { success: true, score: 0.9 };
    }

    const apiKey = process.env.RECAPTCHA_API_KEY;
    if (!apiKey) {
      console.error('❌ RECAPTCHA_API_KEY not configured');
      return { success: false, error: 'reCAPTCHA API key not configured' };
    }

    const requestBody: RecaptchaAssessment = {
      event: {
        token,
        expectedAction,
        siteKey: RECAPTCHA_CONFIG.siteKey,
        ...(transactionData && { transactionData })
      }
    };

    const response = await fetch(`${RECAPTCHA_CONFIG.apiEndpoint}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ reCAPTCHA verification failed:', response.status, errorText);
      return { success: false, error: `reCAPTCHA verification failed: ${response.status}` };
    }

    const result: RecaptchaResponse = await response.json();
    
    // Check if token is valid
    if (!result.tokenProperties.valid) {
      console.error('❌ Invalid reCAPTCHA token:', result.tokenProperties.invalidReason);
      return { success: false, error: 'Invalid reCAPTCHA token' };
    }

    // Check if action matches
    if (result.tokenProperties.action !== expectedAction) {
      console.error('❌ reCAPTCHA action mismatch:', result.tokenProperties.action, 'expected:', expectedAction);
      return { success: false, error: 'reCAPTCHA action mismatch' };
    }

    // Check score (0.0 is likely a bot, 1.0 is likely a human)
    const score = result.riskAnalysis.score;
    const threshold = 0.5; // Minimum score threshold
    
    if (score < threshold) {
      console.warn('⚠️ Low reCAPTCHA score:', score, 'threshold:', threshold);
      return { success: false, error: 'reCAPTCHA score too low', score };
    }

    const transactionRisk = result.fraudPreventionAssessment?.transactionRisk;
    
    console.log('✅ reCAPTCHA verification successful:', { 
      score, 
      action: result.tokenProperties.action,
      transactionRisk 
    });
    
    return { success: true, score, transactionRisk };

  } catch (error) {
    console.error('❌ reCAPTCHA verification error:', error);
    return { success: false, error: 'reCAPTCHA verification error' };
  }
}