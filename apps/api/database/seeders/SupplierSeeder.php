<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\City;
use App\Models\Company;
use App\Models\Supplier;
use Illuminate\Database\Seeder;

class SupplierSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::first();

        $suppliers = [
            [
                'name' => 'Casa dos Materiais',
                'category' => 'Materiais de Construção',
                'city' => 'São Paulo',
                'address' => 'Rua das Flores, 123',
                'whatsapp' => '11999998888',
                'notes' => 'Entrega rápida',
            ],
            [
                'name' => 'Elétrica Central',
                'category' => 'Elétrica',
                'city' => 'Campinas',
                'address' => 'Av. Principal, 456',
                'whatsapp' => '19988887777',
                'notes' => null,
            ],
            [
                'name' => 'HidroTech',
                'category' => 'Hidráulica',
                'city' => 'São Paulo',
                'address' => null,
                'whatsapp' => '11977776666',
                'notes' => 'Melhor preço da região',
            ],
            [
                'name' => 'Ferragens SP',
                'category' => 'Ferramentas',
                'city' => 'Santos',
                'address' => 'Rua do Porto, 789',
                'whatsapp' => '13966665555',
                'notes' => null,
            ],
            [
                'name' => 'Acabamentos Premium',
                'category' => 'Acabamentos',
                'city' => 'Ribeirão Preto',
                'address' => null,
                'whatsapp' => '16955554444',
                'notes' => null,
            ],
            [
                'name' => 'Tintas & Cores',
                'category' => 'Tintas',
                'city' => 'São Paulo',
                'address' => 'Rua das Tintas, 321',
                'whatsapp' => '11944443333',
                'notes' => 'Frete grátis acima de R$ 500',
            ],
            [
                'name' => 'Materiais Express',
                'category' => 'Materiais de Construção',
                'city' => 'Campinas',
                'address' => null,
                'whatsapp' => '19933332222',
                'notes' => null,
            ],
            [
                'name' => 'Eletro Solutions',
                'category' => 'Elétrica',
                'city' => 'São José dos Campos',
                'address' => 'Av. Tecnológica, 1000',
                'whatsapp' => '12922221111',
                'notes' => null,
            ],
        ];

        foreach ($suppliers as $supplierData) {
            $category = Category::where('company_id', $company->id)
                ->where('name', $supplierData['category'])
                ->first();

            $city = City::where('company_id', $company->id)
                ->where('name', $supplierData['city'])
                ->first();

            Supplier::create([
                'company_id' => $company->id,
                'category_id' => $category->id,
                'city_id' => $city->id,
                'name' => $supplierData['name'],
                'address' => $supplierData['address'],
                'whatsapp' => $supplierData['whatsapp'],
                'notes' => $supplierData['notes'],
                'is_active' => true,
            ]);
        }
    }
}
