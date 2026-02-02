<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\City;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CityController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $cities = City::where('company_id', $request->user()->company_id)
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $cities]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'state' => 'required|string|size:2',
        ]);

        $city = City::create([
            'company_id' => $request->user()->company_id,
            'name' => $validated['name'],
            'state' => strtoupper($validated['state']),
        ]);

        return response()->json(['data' => $city], 201);
    }

    public function show(Request $request, City $city): JsonResponse
    {
        $this->authorize('view', $city);

        return response()->json(['data' => $city]);
    }

    public function update(Request $request, City $city): JsonResponse
    {
        $this->authorize('update', $city);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'state' => 'sometimes|required|string|size:2',
        ]);

        if (isset($validated['state'])) {
            $validated['state'] = strtoupper($validated['state']);
        }

        $city->update($validated);

        return response()->json(['data' => $city]);
    }

    public function destroy(Request $request, City $city): JsonResponse
    {
        $this->authorize('delete', $city);

        $city->delete();

        return response()->json(null, 204);
    }
}
