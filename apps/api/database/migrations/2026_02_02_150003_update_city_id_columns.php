<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::disableForeignKeyConstraints();

        // Drop old foreign key and modify column type to match IBGE city IDs
        Schema::table('suppliers', function (Blueprint $table) {
            $table->dropForeign(['city_id']);
            $table->unsignedInteger('city_id')->change();
            $table->foreign('city_id')->references('id')->on('cities')->cascadeOnDelete();
        });

        // Also update quote_city pivot table
        Schema::table('quote_city', function (Blueprint $table) {
            $table->dropForeign(['city_id']);
            $table->unsignedInteger('city_id')->change();
            $table->foreign('city_id')->references('id')->on('cities')->cascadeOnDelete();
        });

        Schema::enableForeignKeyConstraints();
    }

    public function down(): void
    {
        Schema::disableForeignKeyConstraints();

        Schema::table('suppliers', function (Blueprint $table) {
            $table->dropForeign(['city_id']);
            $table->unsignedBigInteger('city_id')->change();
            $table->foreign('city_id')->references('id')->on('cities')->cascadeOnDelete();
        });

        Schema::table('quote_city', function (Blueprint $table) {
            $table->dropForeign(['city_id']);
            $table->unsignedBigInteger('city_id')->change();
            $table->foreign('city_id')->references('id')->on('cities')->cascadeOnDelete();
        });

        Schema::enableForeignKeyConstraints();
    }
};
