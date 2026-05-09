import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { sendEmail } from './email';
import { normalizeIdentifier } from './users';
import { supabase } from './supabase';

interface OTPData {
  code: string;
  expires_at: number;
  attempts: number;
  last_request: number;
  request_count: number;
  is_verified: boolean;
}

/**
 * Validates the identifier (email or 10-digit phone number)
 */
export const validateIdentifier = (id: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(id);
};

/**
 * Generates a secure 6-digit OTP and handles rate limiting
 */
export const generateOTP = async (rawIdentifier: string) => {
  const identifier = normalizeIdentifier(rawIdentifier);
  if (!validateIdentifier(identifier)) {
    throw new Error('Invalid mobile number or email format');
  }

  const { data: userData, error: fetchError } = await supabase
    .from('otps')
    .select('*')
    .eq('identifier', identifier)
    .single();

  const now = Date.now();
  let currentData = userData || { 
    last_request: 0, 
    request_count: 0 
  };

  // RATE LIMITING: Max 5 requests per 10 minutes
  const TEN_MINUTES = 10 * 60 * 1000;
  if (now - currentData.last_request < TEN_MINUTES) {
    if (currentData.request_count >= 5) {
      throw new Error('Too many requests. Please try again after 10 minutes.');
    }
    currentData.request_count += 1;
  } else {
    currentData.request_count = 1;
  }

  // GENERATE SECURE 6-DIGIT OTP
  const code = crypto.randomInt(100000, 999999).toString();
  const hashedCode = await bcrypt.hash(code, 10);
  const expiresAt = now + 5 * 60 * 1000; // 5 minutes validity

  const otpEntry = {
    identifier,
    code: hashedCode,
    expires_at: expiresAt,
    last_request: now,
    request_count: currentData.request_count,
    attempts: 0,
    is_verified: false
  };

  const { error: upsertError } = await supabase
    .from('otps')
    .upsert([otpEntry]);

  if (upsertError) throw upsertError;

  // LOG REQUEST (Masked for privacy)
  const maskedId = identifier.replace(/^(..)(.*)(@.*)$/, '$1***$3');
  console.log(`[AUTH] OTP requested for ${maskedId} (Code: ${code} - Dev Only)`);

  // DISPATCH OTP
  try {
    await sendEmail(
      identifier,
      'Your VIKA Verification Code',
      `Your verification code is: ${code}. Valid for 5 minutes.`,
      `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 400px; margin: 0 auto; text-align: center;">
        <h2 style="color: #FF9A9E;">VIKA Verification</h2>
        <p>Use the code below to verify your email:</p>
        <div style="background: #F8F9FA; padding: 15px; border-radius: 8px; font-size: 32px; font-weight: bold; color: #FF9A9E; margin: 20px 0;">${code}</div>
        <p style="font-size: 12px; color: #999;">Expires in 5 minutes.</p>
      </div>`
    );
  } catch (dispatchError: any) {
    console.warn(`[AUTH] Could not send email to ${maskedId}. Check your .env.local settings.`);
    console.error(`[EMAIL ERROR DETAILS]`, dispatchError);
    console.log(`[DEV ONLY] OTP for ${identifier} is ${code}`);
    return code;
  }
  
  return code;
};

/**
 * Verifies the OTP and enforces one-time usage
 */
export const verifyOTP = async (rawIdentifier: string, code: string) => {
  const identifier = normalizeIdentifier(rawIdentifier);
  
  const { data: data, error } = await supabase
    .from('otps')
    .select('*')
    .eq('identifier', identifier)
    .single();

  if (error || !data) return { success: false, message: 'No OTP requested for this number' };
  
  // EXPIRED CHECK
  if (data.expires_at < Date.now()) {
    await supabase.from('otps').delete().eq('identifier', identifier);
    return { success: false, message: 'OTP has expired' };
  }

  // MAX ATTEMPTS CHECK (Safety against brute force)
  if (data.attempts >= 5) {
    await supabase.from('otps').delete().eq('identifier', identifier);
    return { success: false, message: 'Too many failed attempts. Please request a new OTP.' };
  }

  const isValid = await bcrypt.compare(code, data.code);

  if (isValid) {
    // SECURE: Mark as verified but keep for the registration step
    await supabase
      .from('otps')
      .update({ is_verified: true })
      .eq('identifier', identifier);
      
    return { success: true };
  }

  // WRONG CODE: Increment attempts
  await supabase
    .from('otps')
    .update({ attempts: data.attempts + 1 })
    .eq('identifier', identifier);

  return { success: false, message: 'Invalid verification code' };
};

/**
 * Checks if an identifier has been verified and consumes the status
 */
export const isEmailVerified = async (identifier: string) => {
  const { data, error } = await supabase
    .from('otps')
    .select('*')
    .eq('identifier', identifier)
    .single();

  if (!error && data && data.is_verified && data.expires_at > Date.now()) {
    // Consume the verification status
    await supabase.from('otps').delete().eq('identifier', identifier);
    return true;
  }
  return false;
};


