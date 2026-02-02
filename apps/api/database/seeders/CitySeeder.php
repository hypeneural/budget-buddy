<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\Company;
use Illuminate\Database\Seeder;

class CitySeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::first();

        $cities = [
            ['name' => 'São Paulo', 'state' => 'SP'],
            ['name' => 'Campinas', 'state' => 'SP'],
            ['name' => 'Santos', 'state' => 'SP'],
            ['name' => 'Ribeirão Preto', 'state' => 'SP'],
            ['name' => 'São José dos Campos', 'state' => 'SP'],
        ];

        foreach ($cities as $city) {
            City::create([
                'company_id' => $company->id,
                'name' => $city['name'],
                'state' => $city['state'],
            ]);
        }
    }
}
