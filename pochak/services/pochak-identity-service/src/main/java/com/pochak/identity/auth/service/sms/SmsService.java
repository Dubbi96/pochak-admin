package com.pochak.identity.auth.service.sms;

public interface SmsService {

    /**
     * Sends a verification code to the given phone number.
     *
     * @param phoneNumber the recipient phone number
     * @param code        the verification code to send
     */
    void sendVerificationCode(String phoneNumber, String code);
}
