<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('whatsapp_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('whatsapp_instance_id')->constrained()->onDelete('cascade');
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->enum('direction', ['outbound', 'inbound'])->default('outbound');
            $table->string('phone', 20);
            $table->text('message');
            $table->enum('status', ['pending', 'queued', 'sent', 'failed', 'delivered', 'read'])->default('pending');
            $table->string('zaap_id')->nullable();
            $table->string('whatsapp_message_id')->nullable();
            $table->json('provider_payload')->nullable();
            $table->json('provider_response')->nullable();
            $table->text('error_message')->nullable();
            $table->string('idempotency_key')->nullable()->unique();
            $table->foreignId('quote_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('supplier_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamps();

            $table->index(['whatsapp_instance_id', 'status']);
            $table->index(['phone', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_messages');
    }
};
