<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Folder extends Model
{
    use HasUuids;

    protected $primaryKey = 'folder_id';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['menu_id', 'parent_id', 'folder_name', 'created_by'];

    public function menu()
    {
        return $this->belongsTo(Menu::class, 'menu_id', 'menu_id');
    }

    public function parent()
    {
        return $this->belongsTo(Folder::class, 'parent_id', 'folder_id');
    }

    public function children()
    {
        return $this->hasMany(Folder::class, 'parent_id', 'folder_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by', 'user_id');
    }

    public function files()
    {
        return $this->hasMany(File::class, 'folder_id', 'folder_id');
    }
}