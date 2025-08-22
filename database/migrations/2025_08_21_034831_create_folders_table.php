<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('folders', function (Blueprint $table) {
            $table->uuid('folder_id')->primary(); // UUID sebagai primary key
            $table->uuid('menu_id');
            $table->uuid('parent_id')->nullable(); // Self-referencing
            $table->string('folder_name');
            $table->uuid('created_by');
            $table->timestamps();

            $table->foreign('menu_id')->references('menu_id')->on('menus')->onDelete('cascade');
            $table->foreign('parent_id')->references('folder_id')->on('folders')->onDelete('set null');
            $table->foreign('created_by')->references('user_id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('folders');
    }
};