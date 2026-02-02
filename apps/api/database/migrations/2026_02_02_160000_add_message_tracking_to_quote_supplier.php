<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('quote_supplier', function (Blueprint $table) {
            // Message tracking columns
            $table->enum('message_status', ['pending', 'queued', 'sent', 'failed'])
                ->default('pending')
                ->after('responded_at');
            $table->string('zapi_message_id')->nullable()->after('message_status');
            $table->string('zapi_zaap_id')->nullable()->after('zapi_message_id');
            $table->timestamp('queued_at')->nullable()->after('zapi_zaap_id');
            $table->timestamp('sent_at')->nullable()->after('queued_at');
            $table->text('error_message')->nullable()->after('sent_at');
        });
    }

    public function down(): void
    {
        Schema::table('quote_supplier', function (Blueprint $table) {
            $table->dropColumn([
                'message_status',
                'zapi_message_id',
                'zapi_zaap_id',
                'queued_at',
                'sent_at',
                'error_message',
            ]);
        });
    }
};
