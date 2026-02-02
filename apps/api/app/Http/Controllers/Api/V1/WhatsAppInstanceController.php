<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\WhatsAppInstance;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WhatsAppInstanceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $instances = WhatsAppInstance::where('company_id', $request->user()->company_id)
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $instances]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $instance = WhatsAppInstance::create([
            'company_id' => $request->user()->company_id,
            'name' => $validated['name'],
            'status' => 'disconnected',
        ]);

        return response()->json(['data' => $instance], 201);
    }

    public function show(Request $request, WhatsAppInstance $whatsappInstance): JsonResponse
    {
        $this->authorize('view', $whatsappInstance);

        return response()->json(['data' => $whatsappInstance]);
    }

    public function update(Request $request, WhatsAppInstance $whatsappInstance): JsonResponse
    {
        $this->authorize('update', $whatsappInstance);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'status' => 'sometimes|in:connected,disconnected,qrcode',
            'phone_number' => 'nullable|string|max:20',
            'qr_code_base64' => 'nullable|string',
        ]);

        // Handle status changes
        if (isset($validated['status'])) {
            if ($validated['status'] === 'connected') {
                $validated['connected_at'] = now();
            } elseif ($validated['status'] === 'disconnected') {
                $validated['connected_at'] = null;
                $validated['phone_number'] = null;
                $validated['qr_code_base64'] = null;
            }
        }

        $whatsappInstance->update($validated);

        return response()->json(['data' => $whatsappInstance]);
    }

    public function destroy(Request $request, WhatsAppInstance $whatsappInstance): JsonResponse
    {
        $this->authorize('delete', $whatsappInstance);

        $whatsappInstance->delete();

        return response()->json(null, 204);
    }
}
