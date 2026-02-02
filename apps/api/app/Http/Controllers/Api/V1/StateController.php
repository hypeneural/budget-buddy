<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\State;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StateController extends Controller
{
    /**
     * List all Brazilian states.
     */
    public function index(Request $request): JsonResponse
    {
        $query = State::query();

        // Filter by region
        if ($request->has('region')) {
            $query->where('region', $request->region);
        }

        // Search by name or UF
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('uf', 'like', "%{$search}%");
            });
        }

        $states = $query->orderBy('name')->get();

        return response()->json(['data' => $states]);
    }

    /**
     * Show a specific state with its cities.
     */
    public function show(State $state): JsonResponse
    {
        return response()->json([
            'data' => $state->load('cities:id,state_id,name,is_capital,ddd'),
        ]);
    }
}
