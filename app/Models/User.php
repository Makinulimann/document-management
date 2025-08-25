<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasUuids;

    protected $primaryKey = 'user_id';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'role_name',
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id', 'role_id');
    }

    public function folders()
    {
        return $this->hasMany(Folder::class, 'created_by', 'user_id');
    }

    public function files()
    {
        return $this->hasMany(File::class, 'uploaded_by', 'user_id');
    }

    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class, 'user_id', 'user_id');
    }

    /**
     * Boot the model and set up event listeners.
     */
    protected static function booted()
    {
        // Automatically set role_name when creating a user
        static::creating(function ($user) {
            if ($user->role_id) {
                $role = Role::find($user->role_id);
                $user->role_name = $role ? $role->role_name : null;
            }
        });

        // Automatically update role_name when role_id is updated
        static::updating(function ($user) {
            if ($user->isDirty('role_id')) {
                $role = Role::find($user->role_id);
                $user->role_name = $role ? $role->role_name : null;
            }
        });
    }
}