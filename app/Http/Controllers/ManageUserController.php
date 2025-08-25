<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class ManageUserController extends Controller
{
    /**
     * Menampilkan daftar semua pengguna.
     */
    public function index(): Response
    {
        return Inertia::render('Admin/ManageUser', [
            'users' => User::with('role')
                ->orderBy('name')
                ->paginate(10)
                ->through(fn($user) => [
                    'id' => $user->user_id, // Menggunakan user_id sebagai id
                    'name' => $user->name,
                    'email' => $user->email,
                    'role_name' => $user->role->role_name ?? 'No Role', // Pastikan ada fallback
                    'role_id' => $user->role_id,
                    'email_verified_at' => $user->email_verified_at ? $user->email_verified_at->toFormattedDateString() : null,
                    'created_at' => $user->created_at->toFormattedDateString(),
                ]),
            'roles' => Role::all(['role_id', 'role_name']),
        ]);
    }

    /**
     * Menyimpan pengguna baru.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role_id' => 'required|exists:roles,role_id',
        ]);

        try {
            User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => bcrypt($request->password),
                'role_id' => $request->role_id,
            ]);

            return Redirect::route('manage-user.index')
                ->with('success', 'User created successfully.');
        } catch (\Exception $e) {
            \Log::error('Failed to create user: ' . $e->getMessage());
            return Redirect::route('manage-user.index')
                ->with('error', 'Failed to create user.');
        }
    }

    /**
     * Memperbarui data pengguna.
     */
    public function update(Request $request, $user_id)
    {
        try {
            $user = User::findOrFail($user_id);

            $request->validate([
                'name' => 'sometimes|string|max:255',
                'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->user_id . ',user_id',
                'role_id' => 'sometimes|exists:roles,role_id',
                'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            ]);

            if ($request->has('name')) {
                $user->name = $request->name;
            }

            if ($request->has('email')) {
                $user->email = $request->email;
            }

            if ($request->has('role_id')) {
                $user->role_id = $request->role_id;
            }

            if ($request->filled('password')) {
                $user->password = bcrypt($request->password);
            }

            $user->save();

            return Redirect::route('manage-user.index')
                ->with('success', 'User updated successfully.');

        } catch (\Exception $e) {
            \Log::error('Failed to update user: ' . $user_id . ' Error: ' . $e->getMessage());
            return Redirect::route('manage-user.index')
                ->with('error', 'Failed to update user.');
        }
    }

    /**
     * Menghapus pengguna.
     */
    public function destroy(Request $request, $user_id)
    {
        try {
            \Log::info('Attempting to delete user with ID: ' . $user_id);
            $user = User::findOrFail($user_id);

            // Prevent user from deleting their own account
            if ($user->user_id === auth()->id()) {
                \Log::warning('User attempted to delete own account: ' . $user->user_id);
                return Redirect::route('manage-user.index')
                    ->with('error', 'You cannot delete your own account.');
            }

            // Use database transaction for consistency
            DB::transaction(function() use ($user) {
                // Delete related records first
                $user->folders()->delete();
                $user->files()->delete();
                $user->activityLogs()->delete();
                $user->delete();
            });

            \Log::info('User deleted successfully: ' . $user->user_id);
            
            return Redirect::route('manage-user.index')
                ->with('success', 'User deleted successfully.');

        } catch (\Exception $e) {
            \Log::error('Failed to delete user: ' . $user_id . ' Error: ' . $e->getMessage());
            return Redirect::route('manage-user.index')
                ->with('error', 'Failed to delete user.');
        }
    }

    /**
     * Menghapus multiple pengguna sekaligus.
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,user_id'
        ]);

        try {
            $userIds = $request->user_ids;
            $currentUserId = auth()->id();
            
            // Remove current user from deletion list if present
            $userIds = array_filter($userIds, fn($id) => $id !== $currentUserId);
            
            if (empty($userIds)) {
                return Redirect::route('manage-user.index')
                    ->with('error', 'No valid users selected for deletion.');
            }

            DB::transaction(function() use ($userIds) {
                $users = User::whereIn('user_id', $userIds)->get();
                
                foreach ($users as $user) {
                    // Delete related records first
                    $user->folders()->delete();
                    $user->files()->delete();
                    $user->activityLogs()->delete();
                    $user->delete();
                }
            });

            \Log::info('Bulk delete completed for users: ' . implode(', ', $userIds));
            
            return Redirect::route('manage-user.index')
                ->with('success', count($userIds) . ' user(s) deleted successfully.');

        } catch (\Exception $e) {
            \Log::error('Bulk delete failed: ' . $e->getMessage());
            return Redirect::route('manage-user.index')
                ->with('error', 'Failed to delete users.');
        }
    }

    /**
     * Memverifikasi email pengguna.
     */
    public function verify($user_id)
    {
        try {
            $user = User::findOrFail($user_id);

            if (!$user->hasVerifiedEmail()) {
                $user->markEmailAsVerified();
            }

            return Redirect::route('manage-user.index')
                ->with('success', 'User verified successfully.');

        } catch (\Exception $e) {
            \Log::error('Failed to verify user: ' . $user_id . ' Error: ' . $e->getMessage());
            return Redirect::route('manage-user.index')
                ->with('error', 'Failed to verify user.');
        }
    }
}