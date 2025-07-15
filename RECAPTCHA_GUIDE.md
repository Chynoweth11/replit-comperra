# Google reCAPTCHA Enterprise Integration Guide

## Overview
This guide documents the complete Google reCAPTCHA Enterprise implementation for the Comperra platform, providing bot protection and fraud detection for lead submissions.

## Setup Components

### 1. Frontend Integration
- **HTML Script**: Added to `client/index.html` - loads reCAPTCHA with site key
- **useRecaptcha Hook**: `client/src/hooks/useRecaptcha.ts` - manages token generation
- **Lead Capture Modal**: Updated to generate reCAPTCHA tokens on submission
- **Professional Network**: Ready for reCAPTCHA integration

### 2. Backend Verification
- **Configuration**: `server/recaptcha-config.ts` - verification logic and types
- **API Integration**: Connects to Google reCAPTCHA Enterprise API
- **Lead Endpoint**: `/api/lead/submit` includes reCAPTCHA verification
- **Fraud Prevention**: Transaction risk assessment for enhanced security

## Configuration Details

### Site Key
- **Public Site Key**: `6LcUZYIrAAAAAHwZwRABhcP_nYWzSmALqoXKXDjo`
- **Project ID**: `comperra-done`
- **API Endpoint**: `https://recaptchaenterprise.googleapis.com/v1/projects/comperra-done/assessments`

### Required Environment Variable
```bash
RECAPTCHA_API_KEY=your_secret_api_key_here
```

## Implementation Features

### 1. Score-Based Protection
- **Threshold**: 0.5 (adjustable)
- **Actions**: SUBMIT_LEAD, LOGIN, PURCHASE
- **Real-time Assessment**: Immediate bot detection

### 2. Fraud Prevention
- **Transaction Data**: Includes budget, user info, billing address
- **Risk Analysis**: Additional transaction risk scoring
- **High Risk Threshold**: 0.8 (blocks suspicious activity)

### 3. User Experience
- **Invisible Protection**: No user interaction required
- **Loading States**: Proper UI feedback during verification
- **Error Handling**: Clear error messages for failures

## Request/Response Flow

### 1. Frontend Token Generation
```javascript
const token = await executeRecaptcha('SUBMIT_LEAD');
```

### 2. Backend Verification Request
```json
{
  "event": {
    "token": "TOKEN_FROM_FRONTEND",
    "expectedAction": "SUBMIT_LEAD",
    "siteKey": "6LcUZYIrAAAAAHwZwRABhcP_nYWzSmALqoXKXDjo",
    "transactionData": {
      "transactionId": "lead-1234567890-abc123",
      "paymentMethod": "service-request",
      "currencyCode": "USD",
      "value": 5000,
      "user": {
        "email": "customer@example.com"
      },
      "billingAddress": {
        "recipient": "John Doe",
        "address": ["123 Main St"],
        "locality": "Denver",
        "administrativeArea": "CO",
        "regionCode": "USA",
        "postalCode": "80202"
      }
    }
  }
}
```

### 3. API Response
```json
{
  "score": 0.9,
  "fraudPreventionAssessment": {
    "transactionRisk": 0.1
  },
  "tokenProperties": {
    "valid": true,
    "action": "SUBMIT_LEAD"
  }
}
```

## Security Measures

### 1. Token Validation
- **Expiration**: 2-minute token lifetime
- **Action Matching**: Verifies expected action
- **Site Key Validation**: Ensures correct site origin

### 2. Fraud Detection
- **Transaction Analysis**: Budget and user behavior patterns
- **Risk Scoring**: Multi-factor risk assessment
- **Geographic Validation**: ZIP code and billing address verification

### 3. Error Handling
- **Graceful Degradation**: Form submission continues without reCAPTCHA if unavailable
- **Clear Feedback**: User-friendly error messages
- **Retry Logic**: Automatic token regeneration on failures

## Testing Instructions

### 1. Lead Submission Test
1. Navigate to any product page
2. Click "Get Pricing" button
3. Fill out the lead capture form
4. Submit and verify reCAPTCHA verification in console logs

### 2. API Key Configuration
```bash
# Add to .env file
RECAPTCHA_API_KEY=your_actual_api_key_here
```

### 3. Console Monitoring
- **Success**: `✅ reCAPTCHA verification successful`
- **Failure**: `❌ reCAPTCHA verification failed`
- **Risk**: `⚠️ High transaction risk detected`

## Benefits

1. **Bot Protection**: Prevents automated spam submissions
2. **Fraud Detection**: Identifies suspicious transaction patterns
3. **User Experience**: Invisible protection without user friction
4. **Scalability**: Enterprise-grade security for high-volume sites
5. **Analytics**: Detailed reporting on bot activity and patterns

## Next Steps

1. **Obtain API Key**: Configure `RECAPTCHA_API_KEY` environment variable
2. **Test Integration**: Verify end-to-end functionality
3. **Monitor Metrics**: Track bot detection rates and user impact
4. **Optimize Thresholds**: Adjust score thresholds based on analytics
5. **Expand Coverage**: Add reCAPTCHA to authentication and payment flows

## Support

For issues or questions about the reCAPTCHA implementation:
- Check console logs for verification details
- Verify environment variables are configured
- Ensure API key has proper permissions
- Test with different score thresholds if needed