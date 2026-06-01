<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        try {
            $validated = $request->validate([
                'name'     => 'required|string|max:255',
                'email'    => 'required|email',
                'password' => 'required|min:6',
            ]);
            $validated['email'] = Str::lower($validated['email']);

            if (User::whereRaw('lower(email) = ?', [$validated['email']])->exists()) {
                throw ValidationException::withMessages([
                    'email' => ['E-mail ja cadastrado'],
                ]);
            }

            $base = Str::slug($validated['name']) ?: 'rat';

            $username = $base . '-' . Str::lower(Str::random(5));
            while (User::where('username', $username)->exists()) {
                $username = $base . '-' . Str::lower(Str::random(5));
            }

            $user = User::create([
                'name'     => $validated['name'],
                'username' => $username,
                'avatar'   => User::DEFAULT_AVATAR,
                'email'    => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            return response()->json([
                'message' => 'Conta criada com sucesso!',
                'user'    => $user
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation error',
                'errors'  => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Internal server error',
                'error'   => $e->getMessage() // em produção, remova isso
            ], 500);
        }
    }

    public function login(Request $request)
    {
        try {
            $validated = $request->validate([
                'email'    => 'required|email',
                'password' => 'required',
            ]);
            $validated['email'] = Str::lower($validated['email']);

            $user = User::onWriteConnection()
                ->whereRaw('lower(email) = ?', [$validated['email']])
                ->first();

            if (!$user) {
                return response()->json([
                    'message' => 'E-mail nao cadastrado'
                ], 401);
            }

            if (!Hash::check($validated['password'], $user->password)) {
                return response()->json([
                    'message' => 'Senha incorreta'
                ], 401);
            }

            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'user'  => $user,
                'token' => $token
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation error',
                'errors'  => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Internal server error',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function me(Request $request)
    {
        try {
            return response()->json($request->user());

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching user',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'message' => 'Sessao encerrada com sucesso'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error during logout',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}
