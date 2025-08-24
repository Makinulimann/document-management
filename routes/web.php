<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\UserVerificationController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::prefix('system-owner')->group(function () {
        Route::get('/dpp', function () {
            return Inertia::render('SystemOwner/dppPage', [
                'title' => 'Data DPP',
            ]);
        })->name('system-owner.dpp');
    });

    Route::middleware('admin')->group(function () {
        Route::get('/admin/users', [UserVerificationController::class, 'index'])->name('admin.users');
        Route::post('/admin/users/{user_id}/verify', [UserVerificationController::class, 'verify'])->name('admin.users.verify');
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';