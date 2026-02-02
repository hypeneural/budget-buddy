<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CitiesBrazilSeeder extends Seeder
{
    public function run(): void
    {
        // Read SQL file with cities data
        $sqlPath = base_path('../../../municipios-brasileiros-main/sql/municipios.sql');

        if (!file_exists($sqlPath)) {
            // Try alternative path
            $sqlPath = 'C:/laragon/www/budget-buddy/municipios-brasileiros-main/sql/municipios.sql';
        }

        if (!file_exists($sqlPath)) {
            $this->command->error("SQL file not found: $sqlPath");
            return;
        }

        $content = file_get_contents($sqlPath);

        // Extract INSERT statement
        preg_match('/INSERT INTO municipios VALUES\s*(.+)/s', $content, $matches);

        if (empty($matches[1])) {
            $this->command->error("Could not parse INSERT statement");
            return;
        }

        $valuesStr = trim($matches[1]);

        // Parse individual rows - format: (codigo_ibge,'name',lat,lon,BOOLEAN,codigo_uf,'siafi_id',ddd,'timezone')
        preg_match_all('/\((\d+),\'([^\']+)\',(-?[\d.]+),(-?[\d.]+),(TRUE|FALSE),(\d+),\'(\d+)\',(\d+),\'([^\']+)\'\)/', $valuesStr, $rows, PREG_SET_ORDER);

        $this->command->info("Found " . count($rows) . " cities to insert");

        $now = now();
        $batch = [];
        $batchSize = 500;

        foreach ($rows as $index => $row) {
            $batch[] = [
                'id' => (int) $row[1],          // codigo_ibge
                'name' => $row[2],               // nome
                'latitude' => (float) $row[3],
                'longitude' => (float) $row[4],
                'is_capital' => $row[5] === 'TRUE',
                'state_id' => (int) $row[6],     // codigo_uf
                'ddd' => (int) $row[8],
                'timezone' => $row[9],
                'created_at' => $now,
                'updated_at' => $now,
            ];

            // Insert in batches
            if (count($batch) >= $batchSize) {
                DB::table('cities')->insert($batch);
                $batch = [];
                $this->command->info("Inserted " . ($index + 1) . " cities...");
            }
        }

        // Insert remaining
        if (!empty($batch)) {
            DB::table('cities')->insert($batch);
        }

        $this->command->info("Successfully inserted " . count($rows) . " cities!");
    }
}
