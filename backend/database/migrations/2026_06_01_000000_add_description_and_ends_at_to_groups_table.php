<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('groups', function (Blueprint $table) {
            if (!Schema::hasColumn('groups', 'description')) {
                $table->text('description')->nullable();
            }

            if (!Schema::hasColumn('groups', 'starts_at')) {
                $table->timestamp('starts_at')->nullable();
            }

            if (!Schema::hasColumn('groups', 'ends_at')) {
                $table->timestamp('ends_at')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('groups', function (Blueprint $table) {
            $columns = array_values(array_filter([
                Schema::hasColumn('groups', 'description') ? 'description' : null,
                Schema::hasColumn('groups', 'starts_at') ? 'starts_at' : null,
                Schema::hasColumn('groups', 'ends_at') ? 'ends_at' : null,
            ]));

            if ($columns) {
                $table->dropColumn($columns);
            }
        });
    }
};
