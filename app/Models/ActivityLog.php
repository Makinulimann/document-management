<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    use HasUuids;

    protected $primaryKey = 'log_id';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['user_id', 'file_id', 'action', 'timestamp'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function file()
    {
        return $this->belongsTo(File::class, 'file_id', 'file_id');
    }
}