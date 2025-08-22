<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EnsureIsAdmin
{
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check() && Auth::user()->role->role_name === 'admin' && !is_null(Auth::user()->email_verified_at)) {
            return $next($request);
        }

        return redirect('dashboard')->with('status', 'Unauthorized access.');
    }
}