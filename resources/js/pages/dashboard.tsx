import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

// 1. Fungsi tidak lagi menerima props, karena URL didefinisikan di dalam
export default function Dashboard() {
    // 2. Definisikan URL Looker Studio Anda di sini sebagai konstanta
    const lookerStudioUrl = "https://lookerstudio.google.com/embed/reporting/5aa64aeb-9706-486e-9d66-0210f407b993/page/p_ovcwg4uytd";

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-auto">
                
                {/* Logika if/else tetap berguna jika Anda ingin menghapus URL sementara */}
                {lookerStudioUrl ? (
                    <iframe
                        className="w-full flex-1 rounded-lg"
                        // 3. Gunakan konstanta yang sudah Anda definisikan di atas
                        src={lookerStudioUrl}
                        title="Looker Studio Dashboard"
                        style={{ border: 0 }}
                        allowFullScreen
                        sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                        loading="lazy"
                    ></iframe>
                ) : (
                    <div className="flex h-full items-center justify-center rounded-lg bg-slate-100">
                        <p className="text-center text-slate-500">
                            Dashboard tidak tersedia.
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}