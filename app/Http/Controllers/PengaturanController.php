<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class PengaturanController extends Controller
{
    /**
     * Tampilkan halaman pengaturan profil.
     */
    public function editProfile(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'status' => session('status'),
        ]);
    }

    /**
     * Perbarui informasi profil pengguna.
     */
    public function updateProfile(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email,'.$user->id],
        ]);

        $user->fill($validated);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return redirect()->back()->with('status', 'profile-updated');
    }

    /**
     * Tampilkan halaman pengaturan kata sandi.
     */
    public function editPassword(Request $request): Response
    {
        return Inertia::render('settings/password');
    }

    /**
     * Perbarui kata sandi pengguna.
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return redirect()->back()->with('status', 'password-updated');
    }

    /**
     * Tampilkan halaman pengaturan tampilan.
     */
    public function editAppearance(Request $request): Response
    {
        return Inertia::render('settings/appearance');
    }
}
