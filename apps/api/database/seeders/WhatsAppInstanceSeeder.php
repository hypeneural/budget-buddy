<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\WhatsAppInstance;
use Illuminate\Database\Seeder;

class WhatsAppInstanceSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::first();

        $instances = [
            [
                'name' => 'Comercial Principal',
                'status' => 'connected',
                'phone_number' => '+55 11 99999-8888',
                'connected_at' => now()->subDays(30),
            ],
            [
                'name' => 'Suporte',
                'status' => 'disconnected',
                'phone_number' => null,
                'connected_at' => null,
            ],
        ];

        foreach ($instances as $instance) {
            WhatsAppInstance::create([
                'company_id' => $company->id,
                'name' => $instance['name'],
                'status' => $instance['status'],
                'phone_number' => $instance['phone_number'],
                'connected_at' => $instance['connected_at'],
            ]);
        }
    }
}
