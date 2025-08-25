<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class UserVerificationController extends Controller
{
    public function index(): Response
    {

        $users = User::with('role')->get();

        return Inertia::render('Admin/Users', [
            'users' => $users,
        ]);
    }

    public function verify(string $user_id): RedirectResponse
    {

        $user = User::findOrFail($user_id);
        $user->update(['email_verified_at' => now()]);

        return redirect()->route('admin.users')->with('status', 'User verified successfully.');
    }
}