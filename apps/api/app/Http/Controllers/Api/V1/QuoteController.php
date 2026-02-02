<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Quote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuoteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Quote::where('company_id', $request->user()->company_id)
            ->with(['user', 'cities', 'suppliers.category', 'suppliers.city', 'winnerSupplier']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $quotes = $query->orderByDesc('created_at')->get();

        return response()->json(['data' => $quotes]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'general_notes' => 'nullable|string',
            'city_ids' => 'required|array|min:1',
            'city_ids.*' => 'exists:cities,id',
            'supplier_ids' => 'required|array|min:1',
            'supplier_ids.*' => 'exists:suppliers,id',
        ]);

        $quote = Quote::create([
            'company_id' => $request->user()->company_id,
            'user_id' => $request->user()->id,
            'title' => $validated['title'],
            'message' => $validated['message'],
            'general_notes' => $validated['general_notes'] ?? null,
            'status' => 'open',
        ]);

        // Attach cities
        $quote->cities()->attach($validated['city_ids']);

        // Attach suppliers with initial status
        foreach ($validated['supplier_ids'] as $supplierId) {
            $quote->suppliers()->attach($supplierId, [
                'status' => 'waiting',
            ]);
        }

        return response()->json([
            'data' => $quote->load(['user', 'cities', 'suppliers.category', 'suppliers.city']),
        ], 201);
    }

    public function show(Request $request, Quote $quote): JsonResponse
    {
        $this->authorize('view', $quote);

        return response()->json([
            'data' => $quote->load(['user', 'cities', 'suppliers.category', 'suppliers.city', 'winnerSupplier']),
        ]);
    }

    public function update(Request $request, Quote $quote): JsonResponse
    {
        $this->authorize('update', $quote);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'message' => 'sometimes|required|string',
            'general_notes' => 'nullable|string',
        ]);

        $quote->update($validated);

        return response()->json([
            'data' => $quote->load(['user', 'cities', 'suppliers.category', 'suppliers.city']),
        ]);
    }

    public function destroy(Request $request, Quote $quote): JsonResponse
    {
        $this->authorize('delete', $quote);

        $quote->delete();

        return response()->json(null, 204);
    }

    public function close(Request $request, Quote $quote): JsonResponse
    {
        $this->authorize('update', $quote);

        $validated = $request->validate([
            'winner_supplier_id' => 'required|exists:suppliers,id',
        ]);

        // Update quote status
        $quote->update([
            'status' => 'closed',
            'closed_at' => now(),
            'winner_supplier_id' => $validated['winner_supplier_id'],
        ]);

        // Update supplier pivot status
        $quote->suppliers()->updateExistingPivot($validated['winner_supplier_id'], [
            'status' => 'winner',
        ]);

        return response()->json([
            'data' => $quote->load(['user', 'cities', 'suppliers.category', 'suppliers.city', 'winnerSupplier']),
        ]);
    }

    public function updateSupplier(Request $request, Quote $quote, int $supplierId): JsonResponse
    {
        $this->authorize('update', $quote);

        $validated = $request->validate([
            'status' => 'sometimes|in:waiting,responded,winner',
            'value' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
        ]);

        $pivotData = $validated;
        if (isset($validated['status']) && $validated['status'] === 'responded') {
            $pivotData['responded_at'] = now();
        }

        $quote->suppliers()->updateExistingPivot($supplierId, $pivotData);

        return response()->json([
            'data' => $quote->load(['user', 'cities', 'suppliers.category', 'suppliers.city']),
        ]);
    }
}
