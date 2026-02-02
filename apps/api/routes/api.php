<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\CityController;
use App\Http\Controllers\Api\V1\QuoteController;
use App\Http\Controllers\Api\V1\SupplierController;
use App\Http\Controllers\Api\V1\WhatsAppInstanceController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Health check
    Route::get('/health', function () {
        return response()->json(['status' => 'ok']);
    });

    // Public auth routes
    Route::post('auth/login', [AuthController::class, 'login']);
    Route::post('auth/register', [AuthController::class, 'register']);

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        // Auth
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/me', [AuthController::class, 'me']);

        // Categories
        Route::apiResource('categories', CategoryController::class);

        // Cities
        Route::apiResource('cities', CityController::class);

        // Suppliers
        Route::apiResource('suppliers', SupplierController::class);

        // Quotes
        Route::apiResource('quotes', QuoteController::class);
        Route::post('quotes/{quote}/close', [QuoteController::class, 'close']);
        Route::patch('quotes/{quote}/suppliers/{supplier}', [QuoteController::class, 'updateSupplier']);

        // WhatsApp Instances
        Route::apiResource('whatsapp-instances', WhatsAppInstanceController::class);
    });
});
