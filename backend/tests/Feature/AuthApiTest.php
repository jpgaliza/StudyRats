<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_and_is_persisted(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Ana Silva',
            'email' => 'ana@example.com',
            'password' => 'secret123',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('message', 'Conta criada com sucesso!')
            ->assertJsonStructure([
                'user' => ['id', 'name', 'username', 'avatar', 'email'],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'ana@example.com',
            'name' => 'Ana Silva',
        ]);

        $this->assertTrue(Hash::check('secret123', User::where('email', 'ana@example.com')->first()->password));
    }

    public function test_user_can_login_and_access_me_endpoint(): void
    {
        User::factory()->create([
            'name' => 'Bruno Lima',
            'email' => 'bruno@example.com',
            'password' => Hash::make('secret123'),
        ]);

        $login = $this->postJson('/api/login', [
            'email' => 'bruno@example.com',
            'password' => 'secret123',
        ]);

        $login
            ->assertOk()
            ->assertJsonStructure(['user' => ['id', 'email'], 'token']);

        $this->withHeader('Authorization', 'Bearer '.$login->json('token'))
            ->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('email', 'bruno@example.com');
    }

    public function test_login_rejects_invalid_credentials(): void
    {
        User::factory()->create([
            'email' => 'carla@example.com',
            'password' => Hash::make('secret123'),
        ]);

        $this->postJson('/api/login', [
            'email' => 'carla@example.com',
            'password' => 'wrong-password',
        ])
            ->assertUnauthorized()
            ->assertJsonPath('message', 'Senha incorreta');
    }
}
