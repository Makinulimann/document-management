<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\ManageUserController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::prefix('system-owner')->group(function () {
        Route::get('/{menuSlug}', [DocumentController::class, 'index'])
            ->where('menuSlug', 'dpp|rm|lccm|psm')
            ->name('system-owner.documents');

        Route::post('/{menuSlug}/upload', [DocumentController::class, 'store'])
            ->where('menuSlug', 'dpp|rm|lccm|psm')
            ->name('system-owner.documents.store');

        Route::post('/{menuSlug}/create-folder', [DocumentController::class, 'createFolder'])
            ->where('menuSlug', 'dpp|rm|lccm|psm')
            ->name('system-owner.documents.create-folder');

        Route::get('/download/{fileId}', [DocumentController::class, 'download'])
            ->name('system-owner.documents.download');

        Route::patch('/{menuSlug}/{id}/{type}/update', [DocumentController::class, 'update'])
            ->where('menuSlug', 'dpp|rm|lccm|psm')
            ->where('type', 'file|folder')
            ->name('system-owner.documents.update');

        Route::delete('/{menuSlug}/{id}/{type}', [DocumentController::class, 'destroy'])
            ->where('menuSlug', 'dpp|rm|lccm|psm')
            ->where('type', 'file|folder')
            ->name('system-owner.documents.destroy');

        Route::get('/dpp', function () {
            return redirect()->route('system-owner.documents', 'dpp');
        });
    });

    Route::middleware('admin')->group(function () {
        Route::post('manage-user/{user}/verify', [ManageUserController::class, 'verify'])->name('manage-user.verify');
        Route::resource('manage-user', ManageUserController::class)->except(['show', 'create', 'edit']);
        Route::post('/manage-user/bulk-delete', [ManageUserController::class, 'bulkDelete'])->name('manage-user.bulk-delete');
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';