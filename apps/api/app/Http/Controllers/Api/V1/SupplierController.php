<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Supplier::where('company_id', $request->user()->company_id)
            ->with(['category', 'city']);

        // Filters
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('city_id')) {
            $query->where('city_id', $request->city_id);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('whatsapp', 'like', "%{$search}%");
            });
        }

        $suppliers = $query->orderBy('name')->get();

        return response()->json(['data' => $suppliers]);
    }

    /**
     * Get filter options with only cities/categories that have suppliers
     */
    public function filters(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;

        // Get categories with supplier count
        $categories = \DB::table('suppliers')
            ->join('categories', 'suppliers.category_id', '=', 'categories.id')
            ->where('suppliers.company_id', $companyId)
            ->groupBy('categories.id', 'categories.name')
            ->select('categories.id', 'categories.name', \DB::raw('COUNT(suppliers.id) as count'))
            ->orderBy('categories.name')
            ->get();

        // Get cities with supplier count
        $cities = \DB::table('suppliers')
            ->join('cities', 'suppliers.city_id', '=', 'cities.id')
            ->join('states', 'cities.state_id', '=', 'states.id')
            ->where('suppliers.company_id', $companyId)
            ->groupBy('cities.id', 'cities.name', 'states.uf')
            ->select('cities.id', 'cities.name', 'states.uf', \DB::raw('COUNT(suppliers.id) as count'))
            ->orderBy('cities.name')
            ->get();

        return response()->json([
            'data' => [
                'categories' => $categories,
                'cities' => $cities,
            ]
        ]);
    }

    /**
     * Get cities that have suppliers in a specific category
     */
    public function citiesByCategory(Request $request): JsonResponse
    {
        $request->validate([
            'category_id' => 'required|integer|exists:categories,id',
        ]);

        $companyId = $request->user()->company_id;
        $categoryId = $request->category_id;

        $cities = \DB::table('suppliers')
            ->join('cities', 'suppliers.city_id', '=', 'cities.id')
            ->join('states', 'cities.state_id', '=', 'states.id')
            ->where('suppliers.company_id', $companyId)
            ->where('suppliers.category_id', $categoryId)
            ->where('suppliers.is_active', true)
            ->groupBy('cities.id', 'cities.name', 'states.uf')
            ->select('cities.id', 'cities.name', 'states.uf', \DB::raw('COUNT(suppliers.id) as count'))
            ->orderBy('cities.name')
            ->get();

        return response()->json(['data' => $cities]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'city_id' => 'required|exists:cities,id',
            'address' => 'nullable|string|max:255',
            'whatsapp' => 'required|string|max:20',
            'notes' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $supplier = Supplier::create([
            'company_id' => $request->user()->company_id,
            ...$validated,
        ]);

        return response()->json(['data' => $supplier->load(['category', 'city'])], 201);
    }

    public function show(Request $request, Supplier $supplier): JsonResponse
    {
        $this->authorize('view', $supplier);

        return response()->json(['data' => $supplier->load(['category', 'city'])]);
    }

    public function update(Request $request, Supplier $supplier): JsonResponse
    {
        $this->authorize('update', $supplier);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'category_id' => 'sometimes|required|exists:categories,id',
            'city_id' => 'sometimes|required|exists:cities,id',
            'address' => 'nullable|string|max:255',
            'whatsapp' => 'sometimes|required|string|max:20',
            'notes' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $supplier->update($validated);

        return response()->json(['data' => $supplier->load(['category', 'city'])]);
    }

    public function destroy(Request $request, Supplier $supplier): JsonResponse
    {
        $this->authorize('delete', $supplier);

        $supplier->delete();

        return response()->json(null, 204);
    }
}
