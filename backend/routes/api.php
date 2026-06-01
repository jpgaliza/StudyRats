<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CheckInController;
use App\Http\Controllers\LeaderboardController;
use App\Http\Controllers\ProfileController;

Route::get('/test', function () {
    return response()->json(['status' => 'ok']);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::middleware('api.token')->group(function () {
    Route::get('/me',           [AuthController::class, 'me']);
    Route::patch('/me',         [ProfileController::class, 'update']);
    Route::post('/me',          [ProfileController::class, 'update']);
    Route::get('/me/dashboard', [ProfileController::class, 'dashboard']);
    Route::post('/logout',      [AuthController::class, 'logout']);

    Route::get('/feed/check-ins', [CheckInController::class, 'feed']);

    Route::post('/groups',      [GroupController::class, 'store']);
    Route::post('/groups/join', [GroupController::class, 'join']);
    Route::get('/groups',       [GroupController::class, 'index']);

    Route::post('/groups/{groupId}/check-ins', [CheckInController::class, 'store']);
    Route::get('/groups/{groupId}/leaderboard/preview', [LeaderboardController::class, 'preview']);
    Route::get('/groups/{groupId}/leaderboard', [LeaderboardController::class, 'index']);
    Route::get('/groups/{groupId}/members/{userId}/profile', [ProfileController::class, 'publicProfile']);
    Route::post('/groups/{id}/invite/regenerate', [GroupController::class, 'regenerateInvite']);
    Route::post('/groups/{id}/members/{userId}/transfer-owner', [GroupController::class, 'transferOwnership']);
    Route::delete('/groups/{id}/members/{userId}', [GroupController::class, 'removeMember']);

    Route::get('/groups/{id}',  [GroupController::class, 'show']);
    Route::put('/groups/{id}',  [GroupController::class, 'update']);
    Route::delete('/groups/{id}', [GroupController::class, 'destroy']);
});
