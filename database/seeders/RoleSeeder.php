<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use Illuminate\Support\Str;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        Role::create([
            'role_id' => Str::uuid(),
            'role_name' => 'user',
        ]);

        Role::create([
            'role_id' => Str::uuid(),
            'role_name' => 'admin',
        ]);
    }
}