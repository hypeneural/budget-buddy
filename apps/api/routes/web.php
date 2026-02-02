<?php

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;

// Redirect root to the SPA
Route::get('/', function () {
    return redirect('/app/');
});

// Serve the SPA for all /app/* routes
Route::get('/app/{any?}', function () {
    $path = public_path('app/index.html');
    abort_unless(File::exists($path), 404);
    return File::get($path);
})->where('any', '.*');

