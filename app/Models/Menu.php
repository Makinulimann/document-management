<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    use HasUuids;

    protected $primaryKey = 'menu_id';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['menu_name', 'parent_id'];

    public function parent()
    {
        return $this->belongsTo(Menu::class, 'parent_id', 'menu_id');
    }

    public function children()
    {
        return $this->hasMany(Menu::class, 'parent_id', 'menu_id');
    }

    public function folders()
    {
        return $this->hasMany(Folder::class, 'menu_id', 'menu_id');
    }
}