<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('whatsapp_instances', function (Blueprint $table) {
            $table->string('instance_id')->nullable()->after('name');
            $table->text('instance_token')->nullable()->after('instance_id');
            $table->text('client_token')->nullable()->after('instance_token');
            $table->boolean('smartphone_connected')->default(false)->after('status');
            $table->string('last_status_error')->nullable()->after('smartphone_connected');
            $table->timestamp('last_status_at')->nullable()->after('last_status_error');
            $table->timestamp('last_qr_at')->nullable()->after('last_status_at');
        });
    }

    public function down(): void
    {
        Schema::table('whatsapp_instances', function (Blueprint $table) {
            $table->dropColumn([
                'instance_id',
                'instance_token',
                'client_token',
                'smartphone_connected',
                'last_status_error',
                'last_status_at',
                'last_qr_at',
            ]);
        });
    }
};
