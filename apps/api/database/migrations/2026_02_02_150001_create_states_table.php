<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('states', function (Blueprint $table) {
            $table->unsignedInteger('id')->primary(); // codigo_uf from IBGE
            $table->string('uf', 2)->unique();
            $table->string('name', 100);
            $table->decimal('latitude', 10, 6)->nullable();
            $table->decimal('longitude', 10, 6)->nullable();
            $table->string('region', 20);
            $table->timestamps();

            $table->index('uf');
            $table->index('region');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('states');
    }
};
