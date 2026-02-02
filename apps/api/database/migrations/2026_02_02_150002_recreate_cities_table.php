<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Disable FK checks for MariaDB/MySQL
        Schema::disableForeignKeyConstraints();

        // Drop old cities table
        Schema::dropIfExists('cities');

        // Create new cities table with IBGE structure
        Schema::create('cities', function (Blueprint $table) {
            $table->unsignedInteger('id')->primary(); // codigo_ibge from IBGE
            $table->unsignedInteger('state_id');
            $table->string('name', 100);
            $table->decimal('latitude', 10, 6)->nullable();
            $table->decimal('longitude', 10, 6)->nullable();
            $table->boolean('is_capital')->default(false);
            $table->unsignedSmallInteger('ddd')->nullable();
            $table->string('timezone', 32)->default('America/Sao_Paulo');
            $table->timestamps();

            $table->foreign('state_id')->references('id')->on('states')->cascadeOnDelete();
            $table->index('state_id');
            $table->index('name');
            $table->index('is_capital');
            $table->index('ddd');
        });

        // Re-enable FK checks
        Schema::enableForeignKeyConstraints();
    }

    public function down(): void
    {
        Schema::dropIfExists('cities');

        // Recreate old structure
        Schema::create('cities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('state', 2);
            $table->timestamps();

            $table->unique(['company_id', 'name', 'state']);
        });
    }
};
