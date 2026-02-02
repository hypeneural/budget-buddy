<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('cities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('state', 2);
            $table->timestamps();

            $table->unique(['company_id', 'name', 'state']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cities');
    }
};
