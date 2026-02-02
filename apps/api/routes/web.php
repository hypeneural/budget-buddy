<?php

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/app/{any?}', function () {
    $path = public_path('app/index.html');
    abort_unless(File::exists($path), 404);
    return File::get($path);
})->where('any', '.*');
