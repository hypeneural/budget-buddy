<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\City;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CityController extends Controller
{
    /**
     * List cities with optional filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = City::with('state:id,uf,name');

        // Filter by state
        if ($request->has('state_id')) {
            $query->where('state_id', $request->state_id);
        }

        // Filter by UF (state abbreviation)
        if ($request->has('uf')) {
            $query->whereHas('state', function ($q) use ($request) {
                $q->where('uf', strtoupper($request->uf));
            });
        }

        // Filter by DDD
        if ($request->has('ddd')) {
            $query->where('ddd', $request->ddd);
        }

        // Filter capitals only
        if ($request->boolean('capitals')) {
            $query->where('is_capital', true);
        }

        // Search by name
        if ($request->has('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        // Limit results for autocomplete
        $limit = $request->input('limit', 100);

        $cities = $query->orderBy('name')
            ->limit(min($limit, 500))
            ->get()
            ->map(function ($city) {
                return [
                    'id' => $city->id,
                    'name' => $city->name,
                    'state_id' => $city->state_id,
                    'uf' => $city->state?->uf,
                    'is_capital' => $city->is_capital,
                    'ddd' => $city->ddd,
                    'display_name' => "{$city->name} - {$city->state?->uf}",
                ];
            });

        return response()->json(['data' => $cities]);
    }

    /**
     * Show city details.
     */
    public function show(City $city): JsonResponse
    {
        return response()->json([
            'data' => [
                ...$city->toArray(),
                'state' => $city->state,
                'display_name' => "{$city->name} - {$city->state?->uf}",
            ],
        ]);
    }
}
