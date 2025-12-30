<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\Auth\PasswordResetOtp;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function showLogin()
    {
        return Inertia::render('login/login');
    }

    public function storeLogin(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials, $request->remember)) {
            $request->session()->regenerate();

            return Redirect::intended('dashboard');
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    }

    public function destroy(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return Redirect::route('login');
    }

    public function showForgotPassword()
    {
        return Inertia::render('auth/ForgotPassword');
    }

    public function sendOtp(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:users,email']);

        $otp = random_int(100000, 999999);
        $token = Str::random(40);

        Cache::put('password.reset.'.$token, [
            'email' => $request->email,
            'otp' => $otp,
        ], now()->addMinutes(10));

        Mail::to($request->email)->send(new PasswordResetOtp($otp, $token));

        return Inertia::render('otp/otp', [
            'token' => $token,
            'email' => $request->email,
        ]);
    }

    public function showResetPassword(Request $request)
    {
        $request->validate(['token' => 'required|string']);

        $data = Cache::get('password.reset.'.$request->token);

        if (! $data) {
            return Redirect::route('password.request')->withErrors(['email' => 'Invalid or expired token.']);
        }

        return Inertia::render('auth/ResetPassword', [
            'token' => $request->token,
            'email' => $data['email'],
        ]);
    }

    public function storeResetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|numeric',
        ]);

        $cacheKey = 'password.reset.'.$request->token;
        $data = Cache::get($cacheKey);

        if (! $data || $data['email'] !== $request->email || (string) $data['otp'] !== $request->otp) {
            return back()->withErrors(['otp' => 'Invalid OTP or token.']);
        }

        return Redirect::route('password.reset', ['token' => $request->token]);
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email|exists:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $cacheKey = 'password.reset.'.$request->token;
        $data = Cache::get($cacheKey);

        if (! $data || $data['email'] !== $request->email) {
            return back()->withErrors(['email' => 'Invalid or expired token.']);
        }

        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        Cache::forget($cacheKey);

        return Redirect::route('login')->with('success', 'Your password has been reset successfully.');
    }

    public function resendOtp(Request $request)
    {
        $request->validate(['token' => 'required|string']);
        $oldToken = $request->token;
        $data = Cache::get('password.reset.'.$oldToken);

        if (! $data) {
            return Redirect::route('password.request')->withErrors(['email' => 'Invalid or expired token.']);
        }

        $email = $data['email'];
        $otp = random_int(100000, 999999);
        $token = Str::random(40);

        Cache::forget('password.reset.'.$oldToken);
        Cache::put('password.reset.'.$token, [
            'email' => $email,
            'otp' => $otp,
        ], now()->addMinutes(10));

        Mail::to($email)->send(new PasswordResetOtp($otp, $token));

        return Inertia::render('otp/otp', [
            'token' => $token,
            'email' => $email,
        ]);
    }
}
