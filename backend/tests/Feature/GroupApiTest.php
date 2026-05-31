<?php

namespace Tests\Feature;

use App\Models\Group;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class GroupApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_create_and_list_groups(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $created = $this->postJson('/api/groups', [
            'name' => 'Matematica',
        ]);

        $created
            ->assertCreated()
            ->assertJsonPath('name', 'Matematica')
            ->assertJsonStructure(['id', 'name', 'owner_id', 'invite_code', 'users_count']);

        $this->assertDatabaseHas('groups', [
            'name' => 'Matematica',
            'owner_id' => $user->id,
        ]);

        $this->assertDatabaseHas('group_user', [
            'group_id' => $created->json('id'),
            'user_id' => $user->id,
        ]);

        $this->getJson('/api/groups')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.name', 'Matematica');
    }

    public function test_user_can_join_group_with_invite_code(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();

        $group = Group::create([
            'name' => 'Fisica',
            'owner_id' => $owner->id,
            'invite_code' => 'ABC123',
        ]);
        $group->users()->attach($owner->id);

        Sanctum::actingAs($member);

        $this->postJson('/api/groups/join', ['code' => 'abc123'])
            ->assertOk()
            ->assertJsonPath('message', 'Voce entrou no grupo!');

        $this->assertDatabaseHas('group_user', [
            'group_id' => $group->id,
            'user_id' => $member->id,
        ]);
    }

    public function test_non_member_cannot_view_group_details(): void
    {
        $owner = User::factory()->create();
        $outsider = User::factory()->create();

        $group = Group::create([
            'name' => 'Quimica',
            'owner_id' => $owner->id,
            'invite_code' => 'XYZ789',
        ]);
        $group->users()->attach($owner->id);

        Sanctum::actingAs($outsider);

        $this->getJson("/api/groups/{$group->id}")
            ->assertForbidden()
            ->assertJsonPath('message', 'Forbidden');
    }

    public function test_only_owner_can_regenerate_invite_code(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();

        $group = Group::create([
            'name' => 'Historia',
            'owner_id' => $owner->id,
            'invite_code' => 'OLD123',
        ]);
        $group->users()->attach([$owner->id, $member->id]);

        Sanctum::actingAs($member);

        $this->postJson("/api/groups/{$group->id}/invite/regenerate")
            ->assertForbidden()
            ->assertJsonPath('message', 'Unauthorized');

        Sanctum::actingAs($owner);

        $this->postJson("/api/groups/{$group->id}/invite/regenerate")
            ->assertOk()
            ->assertJsonStructure(['invite_code']);

        $this->assertNotSame('OLD123', $group->fresh()->invite_code);
    }

    public function test_removed_member_cannot_rejoin_with_invite_code(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();

        $group = Group::create([
            'name' => 'Biologia',
            'owner_id' => $owner->id,
            'invite_code' => 'BAN123',
        ]);
        $group->users()->attach([$owner->id, $member->id]);

        Sanctum::actingAs($owner);

        $this->deleteJson("/api/groups/{$group->id}/members/{$member->id}")
            ->assertOk()
            ->assertJsonPath('message', 'Membro removido');

        $this->assertDatabaseMissing('group_user', [
            'group_id' => $group->id,
            'user_id' => $member->id,
        ]);

        $this->assertDatabaseHas('group_bans', [
            'group_id' => $group->id,
            'user_id' => $member->id,
            'banned_by' => $owner->id,
        ]);

        Sanctum::actingAs($member);

        $this->postJson('/api/groups/join', ['code' => 'BAN123'])
            ->assertForbidden()
            ->assertJsonPath('message', 'Voce foi removido deste grupo e nao pode entrar novamente');
    }

    public function test_user_can_check_in_once_per_day_in_each_group(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $firstGroup = Group::create([
            'name' => 'Matematica',
            'owner_id' => $user->id,
            'invite_code' => 'MAT123',
        ]);
        $secondGroup = Group::create([
            'name' => 'Fisica',
            'owner_id' => $user->id,
            'invite_code' => 'FIS123',
        ]);
        $firstGroup->users()->attach($user->id);
        $secondGroup->users()->attach($user->id);

        Sanctum::actingAs($user);

        $this->postJson("/api/groups/{$firstGroup->id}/check-ins", [
            'topic' => 'Algebra',
            'image' => $this->fakePngUpload('algebra.png'),
        ])->assertCreated();

        $this->postJson("/api/groups/{$firstGroup->id}/check-ins", [
            'topic' => 'Geometria',
            'image' => $this->fakePngUpload('geometria.png'),
        ])
            ->assertStatus(429)
            ->assertJsonPath('message', 'Voce ja fez check-in hoje neste grupo.');

        $this->postJson("/api/groups/{$secondGroup->id}/check-ins", [
            'topic' => 'Cinematica',
            'image' => $this->fakePngUpload('cinematica.png'),
        ])->assertCreated();

        $this->assertDatabaseCount('check_ins', 2);
    }

    private function fakePngUpload(string $name): UploadedFile
    {
        $path = tempnam(sys_get_temp_dir(), 'checkin-proof-');
        file_put_contents(
            $path,
            base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=')
        );

        return new UploadedFile($path, $name, 'image/png', null, true);
    }
}
