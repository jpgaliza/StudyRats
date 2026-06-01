<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE groups ADD COLUMN IF NOT EXISTS description TEXT NULL');
        DB::statement('ALTER TABLE groups ADD COLUMN IF NOT EXISTS ends_at TIMESTAMP(0) WITHOUT TIME ZONE NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE groups DROP COLUMN IF EXISTS description');
        DB::statement('ALTER TABLE groups DROP COLUMN IF EXISTS ends_at');
    }
};
