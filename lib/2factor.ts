export class TwoFactorService {
  private static get API_KEY() {
    return process.env.TWO_FACTOR_API_KEY;
  }
  
  private static readonly BASE_URL = 'https://2factor.in/API/V1';

  /**
   * Sends an OTP to the given phone number using 2Factor.in
   * @param phoneNumber The mobile number (preferably with country code, e.g., +91)
   * @param templateName Optional template name defined in 2Factor dashboard
   * @returns The session ID for the OTP, which is required for verification
   */
  static async sendOTP(phoneNumber: string, templateName?: string): Promise<{ sessionId?: string; error?: string }> {
    if (!this.API_KEY) {
      console.warn('TWO_FACTOR_API_KEY is not defined. Using Mock OTP mode. Use OTP: 123456');
      return { sessionId: 'mock-session-id' };
    }

    try {
      // 2Factor expects number without '+' symbol for the API URL usually, but it's safe to url-encode it or just pass digits.
      // Easiest is to strip non-digit characters just in case, though country code without + is standard (e.g., 919876543210).
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      
      let url = `${this.BASE_URL}/${this.API_KEY}/SMS/${cleanNumber}/AUTOGEN`;
      if (templateName) {
        url += `/${templateName}`;
      }

      const response = await fetch(url, { method: 'GET' });
      const data = await response.json();

      if (data.Status === 'Success') {
        return { sessionId: data.Details };
      } else {
        return { error: data.Details || 'Failed to send OTP.' };
      }
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      return { error: 'An unexpected error occurred while sending OTP.' };
    }
  }

  /**
   * Verifies the OTP entered by the user.
   * @param sessionId The session ID returned when the OTP was sent
   * @param otp The OTP entered by the user
   * @returns True if OTP matched, otherwise an error message
   */
  static async verifyOTP(sessionId: string, otp: string): Promise<{ success: boolean; error?: string }> {
    if (!this.API_KEY || sessionId === 'mock-session-id') {
      if (otp === '123456') {
        return { success: true };
      }
      return { success: false, error: 'Invalid mock OTP. Use 123456.' };
    }

    try {
      const url = `${this.BASE_URL}/${this.API_KEY}/SMS/VERIFY/${sessionId}/${otp}`;
      const response = await fetch(url, { method: 'GET' });
      const data = await response.json();

      if (data.Status === 'Success' && data.Details === 'OTP Matched') {
        return { success: true };
      } else {
        return { success: false, error: data.Details || 'Invalid OTP.' };
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      return { success: false, error: 'An unexpected error occurred while verifying OTP.' };
    }
  }

  /**
   * Sends a transactional SMS (e.g. for booking updates)
   * @param phoneNumber The mobile number
   * @param message The SMS text to send
   */
  static async sendTransactionalSMS(phoneNumber: string, message: string): Promise<{ success: boolean; error?: string }> {
    if (!this.API_KEY) {
      console.warn('TWO_FACTOR_API_KEY not defined. Mock sending SMS:', message);
      return { success: true };
    }

    try {
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      const encodedMessage = encodeURIComponent(message);
      const url = `https://2factor.in/API/V1/${this.API_KEY}/ADDON_SERVICES/SEND/TSMS?From=AGRIRENT&To=${cleanNumber}&Msg=${encodedMessage}`;

      const response = await fetch(url, { method: 'GET' });
      const data = await response.json();

      if (data.Status === 'Success') {
        return { success: true };
      } else {
        return { success: false, error: data.Details || 'Failed to send SMS.' };
      }
    } catch (error: any) {
      console.error('Error sending transactional SMS:', error);
      return { success: false, error: 'An unexpected error occurred while sending SMS.' };
    }
  }

  /**
   * Sends a WhatsApp message (e.g. for booking updates)
   * Note: In production, 2Factor requires predefined WhatsApp templates.
   * @param phoneNumber The mobile number
   * @param message The message text to send
   */
  static async sendWhatsAppMessage(phoneNumber: string, message: string): Promise<{ success: boolean; error?: string }> {
    if (!this.API_KEY) {
      console.warn('TWO_FACTOR_API_KEY not defined. Mock sending WhatsApp message:', message);
      return { success: true };
    }

    try {
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      const encodedMessage = encodeURIComponent(message);
      // Using generic addon services endpoint, but normally requires specific template IDs for WA
      const url = `https://2factor.in/API/V1/${this.API_KEY}/ADDON_SERVICES/SEND/WAPP?From=AGRIRENT&To=${cleanNumber}&Msg=${encodedMessage}`;

      const response = await fetch(url, { method: 'GET' });
      const data = await response.json();

      if (data.Status === 'Success') {
        return { success: true };
      } else {
        return { success: false, error: data.Details || 'Failed to send WhatsApp message.' };
      }
    } catch (error: any) {
      console.error('Error sending WhatsApp message:', error);
      return { success: false, error: 'An unexpected error occurred while sending WhatsApp message.' };
    }
  }
}
