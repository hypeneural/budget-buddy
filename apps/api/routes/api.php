<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\CityController;
use App\Http\Controllers\Api\V1\QuoteController;
use App\Http\Controllers\Api\V1\StateController;
use App\Http\Controllers\Api\V1\SupplierController;
use App\Http\Controllers\Api\V1\WhatsAppInstanceController;
use App\Http\Controllers\Api\V1\ZApiController;
use App\Http\Controllers\Api\V1\ZApiWebhookController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Health check
    Route::get('/health', function () {
        return response()->json(['status' => 'ok']);
    });

    // Public auth routes
    Route::post('auth/login', [AuthController::class, 'login']);
    Route::post('auth/register', [AuthController::class, 'register']);

    // Z-API Webhooks (public, verified by secret)
    Route::post('webhooks/zapi/{instanceId}', [ZApiWebhookController::class, 'handle']);

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        // Auth
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/me', [AuthController::class, 'me']);

        // Categories (full CRUD)
        Route::apiResource('categories', CategoryController::class);

        // States (read-only, Brazilian states from IBGE)
        Route::get('states', [StateController::class, 'index']);
        Route::get('states/{state}', [StateController::class, 'show']);

        // Cities (read-only, Brazilian municipalities from IBGE)
        Route::get('cities', [CityController::class, 'index']);
        Route::get('cities/{city}', [CityController::class, 'show']);

        // Suppliers
        Route::apiResource('suppliers', SupplierController::class);

        // Quotes
        Route::apiResource('quotes', QuoteController::class);
        Route::post('quotes/{quote}/close', [QuoteController::class, 'close']);
        Route::patch('quotes/{quote}/suppliers/{supplier}', [QuoteController::class, 'updateSupplier']);
        Route::post('quotes/{quote}/broadcast', [QuoteController::class, 'broadcast']);

        // WhatsApp Instances (CRUD)
        Route::apiResource('whatsapp-instances', WhatsAppInstanceController::class);

        // Z-API WhatsApp Operations
        Route::prefix('whatsapp')->group(function () {
            // Instance operations
            Route::get('instances/{whatsappInstance}/status', [ZApiController::class, 'status']);
            Route::get('instances/{whatsappInstance}/qr', [ZApiController::class, 'qrCode']);
            Route::get('instances/{whatsappInstance}/device', [ZApiController::class, 'deviceInfo']);
            Route::get('instances/{whatsappInstance}/full-status', [ZApiController::class, 'fullStatus']);
            Route::get('instances/{whatsappInstance}/phone-code/{phone}', [ZApiController::class, 'phoneCode']);
            Route::post('instances/{whatsappInstance}/disconnect', [ZApiController::class, 'disconnect']);
            Route::put('instances/{whatsappInstance}/credentials', [ZApiController::class, 'updateCredentials']);

            // Messaging
            Route::post('send-text', [ZApiController::class, 'sendText']);
        });
    });
});
