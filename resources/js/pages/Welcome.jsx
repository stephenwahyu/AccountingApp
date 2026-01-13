import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

export default function Welcome() {
    return (
        <React.Fragment>
            <Head title="Welcome" />
            <div className="relative min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <div className="absolute top-0 right-0 p-6">
                    <Button asChild variant="outline">
                        <Link href={route('login')}>
                            Log in
                        </Link>
                    </Button>
                </div>

                <div className="text-center p-8 max-w-2xl mx-auto">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-gray-900 dark:text-gray-100 mb-4">
                        Welcome to AccountingApp
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                        A modern, intuitive, and powerful accounting application to manage your finances with ease.
                    </p>
                    <Button asChild size="lg">
                        <Link href={route('login')}>
                            Get Started
                        </Link>
                    </Button>
                </div>
            </div>
        </React.Fragment>
    );
}
