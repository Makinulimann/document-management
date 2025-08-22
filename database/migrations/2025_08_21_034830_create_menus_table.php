<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('menus', function (Blueprint $table) {
            $table->uuid('menu_id')->primary(); // UUID sebagai primary key
            $table->string('menu_name');
            $table->uuid('parent_id')->nullable(); // Self-referencing
            $table->timestamps();

            $table->foreign('parent_id')->references('menu_id')->on('menus')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menus');
    }
};