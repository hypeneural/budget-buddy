<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StatesBrazilSeeder extends Seeder
{
    public function run(): void
    {
        $states = [
            ['id' => 11, 'uf' => 'RO', 'name' => 'Rondônia', 'latitude' => -10.83, 'longitude' => -63.34, 'region' => 'Norte'],
            ['id' => 12, 'uf' => 'AC', 'name' => 'Acre', 'latitude' => -8.77, 'longitude' => -70.55, 'region' => 'Norte'],
            ['id' => 13, 'uf' => 'AM', 'name' => 'Amazonas', 'latitude' => -3.47, 'longitude' => -65.1, 'region' => 'Norte'],
            ['id' => 14, 'uf' => 'RR', 'name' => 'Roraima', 'latitude' => 1.99, 'longitude' => -61.33, 'region' => 'Norte'],
            ['id' => 15, 'uf' => 'PA', 'name' => 'Pará', 'latitude' => -3.79, 'longitude' => -52.48, 'region' => 'Norte'],
            ['id' => 16, 'uf' => 'AP', 'name' => 'Amapá', 'latitude' => 1.41, 'longitude' => -51.77, 'region' => 'Norte'],
            ['id' => 17, 'uf' => 'TO', 'name' => 'Tocantins', 'latitude' => -9.46, 'longitude' => -48.26, 'region' => 'Norte'],
            ['id' => 21, 'uf' => 'MA', 'name' => 'Maranhão', 'latitude' => -5.42, 'longitude' => -45.44, 'region' => 'Nordeste'],
            ['id' => 22, 'uf' => 'PI', 'name' => 'Piauí', 'latitude' => -6.6, 'longitude' => -42.28, 'region' => 'Nordeste'],
            ['id' => 23, 'uf' => 'CE', 'name' => 'Ceará', 'latitude' => -5.2, 'longitude' => -39.53, 'region' => 'Nordeste'],
            ['id' => 24, 'uf' => 'RN', 'name' => 'Rio Grande do Norte', 'latitude' => -5.81, 'longitude' => -36.59, 'region' => 'Nordeste'],
            ['id' => 25, 'uf' => 'PB', 'name' => 'Paraíba', 'latitude' => -7.28, 'longitude' => -36.72, 'region' => 'Nordeste'],
            ['id' => 26, 'uf' => 'PE', 'name' => 'Pernambuco', 'latitude' => -8.38, 'longitude' => -37.86, 'region' => 'Nordeste'],
            ['id' => 27, 'uf' => 'AL', 'name' => 'Alagoas', 'latitude' => -9.62, 'longitude' => -36.82, 'region' => 'Nordeste'],
            ['id' => 28, 'uf' => 'SE', 'name' => 'Sergipe', 'latitude' => -10.57, 'longitude' => -37.45, 'region' => 'Nordeste'],
            ['id' => 29, 'uf' => 'BA', 'name' => 'Bahia', 'latitude' => -13.29, 'longitude' => -41.71, 'region' => 'Nordeste'],
            ['id' => 31, 'uf' => 'MG', 'name' => 'Minas Gerais', 'latitude' => -18.1, 'longitude' => -44.38, 'region' => 'Sudeste'],
            ['id' => 32, 'uf' => 'ES', 'name' => 'Espírito Santo', 'latitude' => -19.19, 'longitude' => -40.34, 'region' => 'Sudeste'],
            ['id' => 33, 'uf' => 'RJ', 'name' => 'Rio de Janeiro', 'latitude' => -22.25, 'longitude' => -42.66, 'region' => 'Sudeste'],
            ['id' => 35, 'uf' => 'SP', 'name' => 'São Paulo', 'latitude' => -22.19, 'longitude' => -48.79, 'region' => 'Sudeste'],
            ['id' => 41, 'uf' => 'PR', 'name' => 'Paraná', 'latitude' => -24.89, 'longitude' => -51.55, 'region' => 'Sul'],
            ['id' => 42, 'uf' => 'SC', 'name' => 'Santa Catarina', 'latitude' => -27.45, 'longitude' => -50.95, 'region' => 'Sul'],
            ['id' => 43, 'uf' => 'RS', 'name' => 'Rio Grande do Sul', 'latitude' => -30.17, 'longitude' => -53.5, 'region' => 'Sul'],
            ['id' => 50, 'uf' => 'MS', 'name' => 'Mato Grosso do Sul', 'latitude' => -20.51, 'longitude' => -54.54, 'region' => 'Centro-Oeste'],
            ['id' => 51, 'uf' => 'MT', 'name' => 'Mato Grosso', 'latitude' => -12.64, 'longitude' => -55.42, 'region' => 'Centro-Oeste'],
            ['id' => 52, 'uf' => 'GO', 'name' => 'Goiás', 'latitude' => -15.98, 'longitude' => -49.86, 'region' => 'Centro-Oeste'],
            ['id' => 53, 'uf' => 'DF', 'name' => 'Distrito Federal', 'latitude' => -15.83, 'longitude' => -47.86, 'region' => 'Centro-Oeste'],
        ];

        $now = now();
        foreach ($states as &$state) {
            $state['created_at'] = $now;
            $state['updated_at'] = $now;
        }

        DB::table('states')->insert($states);
    }
}
