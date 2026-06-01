<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar')->nullable()->after('remember_token');
            $table->string('username')->nullable()->unique()->after('avatar');
        });

        Schema::create('check_ins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('group_id')->constrained()->cascadeOnDelete();
            $table->string('topic');
            $table->text('note')->nullable();
            $table->string('image_path');
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['group_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('check_ins');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['avatar', 'username']);
        });
    }
};
