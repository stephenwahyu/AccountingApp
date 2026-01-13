<x-mail::message>
# Password Reset Request

You are receiving this email because we received a password reset request for your account.

Your One-Time Password (OTP) is:

<x-mail::panel>
{{ $otp }}
</x-mail::panel>

This OTP will expire in 10 minutes.

If you’re having trouble clicking the "Reset Password" button, copy and paste the URL below into your web browser: [{{ route('password.reset', ['token' => $token]) }}]({{ route('password.reset', ['token' => $token]) }})
</x-mail::message>
