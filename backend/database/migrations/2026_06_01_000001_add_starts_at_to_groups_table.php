<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('groups', 'starts_at')) {
            Schema::table('groups', function (Blueprint $table) {
                $table->timestamp('starts_at')->nullable();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('groups', 'starts_at')) {
            Schema::table('groups', function (Blueprint $table) {
                $table->dropColumn('starts_at');
            });
        }
    }
};
