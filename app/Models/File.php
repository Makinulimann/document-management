<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class File extends Model
{
    use HasUuids;

    protected $table = 'files';
    protected $primaryKey = 'file_id';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['folder_id', 'file_name', 'file_path', 'file_size', 'file_type', 'uploaded_by'];

    public function folder()
    {
        return $this->belongsTo(Folder::class, 'folder_id', 'folder_id');
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by', 'user_id');
    }

    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class, 'file_id', 'file_id');
    }
}