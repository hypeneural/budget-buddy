<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $categories = Category::where('company_id', $request->user()->company_id)
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $categories]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'icon' => 'nullable|string|max:255',
        ]);

        $category = Category::create([
            'company_id' => $request->user()->company_id,
            'name' => $validated['name'],
            'icon' => $validated['icon'] ?? null,
        ]);

        return response()->json(['data' => $category], 201);
    }

    public function show(Request $request, Category $category): JsonResponse
    {
        $this->authorize('view', $category);

        return response()->json(['data' => $category]);
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        $this->authorize('update', $category);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'icon' => 'nullable|string|max:255',
        ]);

        $category->update($validated);

        return response()->json(['data' => $category]);
    }

    public function destroy(Request $request, Category $category): JsonResponse
    {
        $this->authorize('delete', $category);

        $category->delete();

        return response()->json(null, 204);
    }
}
