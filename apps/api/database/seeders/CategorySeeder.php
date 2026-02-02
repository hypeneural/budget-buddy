<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Company;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::first();

        $categories = [
            ['name' => 'Materiais de Construção'],
            ['name' => 'Elétrica'],
            ['name' => 'Hidráulica'],
            ['name' => 'Ferramentas'],
            ['name' => 'Acabamentos'],
            ['name' => 'Tintas'],
        ];

        foreach ($categories as $category) {
            Category::create([
                'company_id' => $company->id,
                'name' => $category['name'],
            ]);
        }
    }
}
