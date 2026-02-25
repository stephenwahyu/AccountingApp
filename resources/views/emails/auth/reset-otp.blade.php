<x-mail::message>
# Pengaturan Ulang Kata Sandi

Halo,

Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda pada **Sistem Akuntansi PT. Sarana Pembangunan Riau Trada**.

Gunakan kode verifikasi (OTP) di bawah ini untuk melanjutkan proses:

<x-mail::panel>
<h1 style="text-align: center; font-size: 32px; letter-spacing: 5px; color: #f92f02; margin: 0;">{{ $otp }}</h1>
</p>
</x-mail::panel>

Kode ini berlaku selama **10 menit**. Pastikan untuk tidak membagikan kode ini kepada siapapun demi keamanan akun Anda.

Jika Anda tidak merasa meminta pengaturan ulang kata sandi, Anda dapat mengabaikan email ini dengan aman.

<x-mail::button :url="route('password.reset', ['token' => $token])" color="error">
Atur Ulang Kata Sandi
</x-mail::button>

Terima kasih,<br>
**Tim IT PT. Sarana Pembangunan Riau Trada**

<x-mail::subcopy>
Jika Anda mengalami kendala saat mengklik tombol, salin dan tempel URL berikut ke browser Anda: [{{ route('password.reset', ['token' => $token]) }}]({{ route('password.reset', ['token' => $token]) }})
</x-mail::subcopy>
</x-mail::message>
