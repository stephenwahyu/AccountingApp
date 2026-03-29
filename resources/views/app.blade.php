<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description"
        content="Sistem akuntansi modern, intuitif, dan bertenaga untuk mengelola keuangan bisnis dengan mudah.">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <script>
        (function() {
            try {
                const saved = localStorage.getItem('appearance') || 'system';
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const isDark = saved === 'dark' || (saved === 'system' && prefersDark);
                document.documentElement.classList.toggle('dark', isDark);
            } catch (e) {
                console.error('Failed to initialize theme:', e);
            }
        })();
    </script>
    @viteReactRefresh
    @vite(['resources/js/app.jsx', 'resources/css/app.css'])
    <link rel="preload" as="image" href="/logo-sm.webp" type="image/webp" fetchpriority="high">
    @if (Route::is('login') || Route::is('password.*'))
        <link rel="preload" as="image" href="/image.webp" type="image/webp" fetchpriority="high"
            media="(min-width: 768px)">
    @endif
    {{-- <title>{{ config('app.name', 'Accounting App') }}</title> --}}
    <link rel="icon" type="image/webp" href="{{ asset('logo.webp') }}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    @inertiaHead
</head>

<body>
    @inertia
    @routes()
</body>

</html>
