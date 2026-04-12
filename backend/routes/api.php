<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GroupController;

Route::get('/test', function () {
    return response()->json(['status' => 'ok']);
});

// Sem auth por enquanto para testar
Route::post('/groups', [GroupController::class, 'store']);
Route::post('/groups/join', [GroupController::class, 'join']);