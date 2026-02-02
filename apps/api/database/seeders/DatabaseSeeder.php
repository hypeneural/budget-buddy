<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            StatesBrazilSeeder::class,
            CitiesBrazilSeeder::class,
            CompanySeeder::class,
            UserSeeder::class,
            CategorySeeder::class,
            SupplierSeeder::class,
            QuoteSeeder::class,
            WhatsAppInstanceSeeder::class,
        ]);
    }
}
