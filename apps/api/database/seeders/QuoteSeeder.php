<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\City;
use App\Models\Company;
use App\Models\Quote;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Seeder;

class QuoteSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::first();
        $user = User::where('company_id', $company->id)->first();

        // Build lookup maps
        $categories = Category::where('company_id', $company->id)->pluck('id', 'name');
        $cities = City::where('company_id', $company->id)->pluck('id', 'name');
        $suppliers = Supplier::where('company_id', $company->id)->get()->keyBy('name');

        $quotes = [
            [
                'title' => 'Cimento e Areia',
                'category' => 'Materiais de Construção',
                'cities' => ['São Paulo', 'Campinas'],
                'message' => "Preciso de orçamento para:\n- 50 sacos de cimento CP-II\n- 10m³ de areia média\n\nPrazo de entrega: 5 dias úteis\nLocal: São Paulo - Zona Sul",
                'general_notes' => 'Urgente - obra iniciando semana que vem',
                'status' => 'open',
                'suppliers' => [
                    [
                        'name' => 'Casa dos Materiais',
                        'status' => 'responded',
                        'value' => 'R$ 2.350,00',
                        'notes' => 'Entrega em 3 dias',
                    ],
                    [
                        'name' => 'Materiais Express',
                        'status' => 'responded',
                        'value' => 'R$ 2.580,00',
                        'notes' => 'Frete incluso',
                    ],
                ],
            ],
            [
                'title' => 'Fiação Elétrica',
                'category' => 'Elétrica',
                'cities' => ['São Paulo', 'Campinas', 'São José dos Campos'],
                'message' => "Orçamento para:\n- 500m de fio 2.5mm\n- 300m de fio 4mm\n- 100m de fio 6mm\n\nMarca: Prysmian ou equivalente",
                'general_notes' => null,
                'status' => 'open',
                'suppliers' => [
                    [
                        'name' => 'Elétrica Central',
                        'status' => 'waiting',
                        'value' => null,
                        'notes' => null,
                    ],
                    [
                        'name' => 'Eletro Solutions',
                        'status' => 'responded',
                        'value' => 'R$ 1.890,00',
                        'notes' => null,
                    ],
                ],
            ],
            [
                'title' => 'Tubos e Conexões',
                'category' => 'Hidráulica',
                'cities' => ['São Paulo'],
                'message' => "Preciso de:\n- 20 tubos PVC 100mm\n- 50 joelhos 90°\n- 30 tês\n- 10 registros de esfera",
                'general_notes' => null,
                'status' => 'open',
                'suppliers' => [
                    [
                        'name' => 'HidroTech',
                        'status' => 'waiting',
                        'value' => null,
                        'notes' => null,
                    ],
                ],
            ],
            [
                'title' => 'Tinta Látex',
                'category' => 'Tintas',
                'cities' => ['São Paulo'],
                'message' => 'Orçamento para 100 litros de tinta látex branco neve, marca Suvinil ou Coral.',
                'general_notes' => null,
                'status' => 'closed',
                'winner' => 'Tintas & Cores',
                'suppliers' => [
                    [
                        'name' => 'Tintas & Cores',
                        'status' => 'winner',
                        'value' => 'R$ 1.200,00',
                        'notes' => 'Melhor custo-benefício',
                    ],
                ],
            ],
        ];

        foreach ($quotes as $quoteData) {
            $quote = Quote::create([
                'company_id' => $company->id,
                'user_id' => $user->id,
                'title' => $quoteData['title'],
                'message' => $quoteData['message'],
                'general_notes' => $quoteData['general_notes'],
                'status' => $quoteData['status'],
                'winner_supplier_id' => isset($quoteData['winner'])
                    ? $suppliers[$quoteData['winner']]->id
                    : null,
                'closed_at' => $quoteData['status'] === 'closed' ? now() : null,
            ]);

            // Attach cities
            $cityIds = collect($quoteData['cities'])->map(fn($name) => $cities[$name])->toArray();
            $quote->cities()->attach($cityIds);

            // Attach suppliers with pivot data
            foreach ($quoteData['suppliers'] as $supplierData) {
                $supplier = $suppliers[$supplierData['name']];
                $quote->suppliers()->attach($supplier->id, [
                    'status' => $supplierData['status'],
                    'value' => $supplierData['value'],
                    'notes' => $supplierData['notes'],
                    'responded_at' => $supplierData['status'] !== 'waiting' ? now() : null,
                ]);
            }
        }
    }
}
