import { useCallback, useEffect, useState } from 'react';

export function initializeTheme() {
    const savedAppearance = localStorage.getItem('appearance') || 'system';
    const isDark =
        savedAppearance === 'dark' ||
        (savedAppearance === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

export function useAppearance() {
    const [appearance, setAppearance] = useState('system');

    useEffect(() => {
        const savedAppearance = localStorage.getItem('appearance') || 'system';
        setAppearance(savedAppearance);
    }, []);

    const updateAppearance = useCallback((value) => {
        setAppearance(value);
        localStorage.setItem('appearance', value);

        const isDark =
            value === 'dark' ||
            (value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    return { appearance, updateAppearance };
}
