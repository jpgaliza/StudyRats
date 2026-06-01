<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Group;
use Illuminate\Support\Str;

class GroupController extends Controller
{
    private function generateInviteCode(): string
    {
        do {
            $code = strtoupper(Str::random(6));
        } while (Group::where('invite_code', $code)->exists());

        return $code;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date',
        ]);

        if (
            !empty($validated['starts_at']) &&
            !empty($validated['ends_at']) &&
            strtotime($validated['ends_at']) < strtotime($validated['starts_at'])
        ) {
            return response()->json([
                'message' => 'A data final precisa ser depois da data de inicio.',
            ], 422);
        }

        $userId = $request->user()->id;

        $group = Group::create([
            'name'        => $validated['name'],
            'description' => $validated['description'] ?? null,
            'starts_at'   => $validated['starts_at'] ?? null,
            'ends_at'     => $validated['ends_at'] ?? null,
            'owner_id'    => $userId,
            'invite_code' => $this->generateInviteCode(),
        ]);

        $group->users()->attach($userId);

        return response()->json($group->loadCount('users'), 201);
    }

    public function join(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $group = Group::where('invite_code', strtoupper(trim($validated['code'])))->first();

        if (!$group) {
            return response()->json(['message' => 'Grupo nao encontrado'], 404);
        }

        $userId = $request->user()->id;

        if ($group->bannedUsers()->whereKey($userId)->exists()) {
            return response()->json([
                'message' => 'Voce foi removido deste grupo e nao pode entrar novamente',
            ], 403);
        }

        $group->users()->syncWithoutDetaching([$userId]);

        return response()->json([
            'message' => 'Voce entrou no grupo!'
        ]);
    }

    public function index(Request $request)
    {
        return $request->user()
            ->groups()
            ->withCount('users')
            ->orderBy('name')
            ->get();
    }

    public function update(Request $request, $id)
    {
        $group = Group::findOrFail($id);

        if ($group->owner_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date',
        ]);

        if (
            $request->filled('starts_at') &&
            $request->filled('ends_at') &&
            strtotime($request->ends_at) < strtotime($request->starts_at)
        ) {
            return response()->json([
                'message' => 'A data final precisa ser depois da data de inicio.',
            ], 422);
        }

        $group->update([
            'name' => $request->name,
            'description' => $request->description,
            'starts_at' => $request->starts_at,
            'ends_at' => $request->ends_at,
        ]);

        return response()->json($group);
    }

    public function destroy($id)
    {
        $group = Group::findOrFail($id);

        if ($group->owner_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $group->delete();

        return response()->json(['message' => 'Deleted']);
    }

    public function show(Request $request, $id)
    {
        $group = Group::with(['users:id,name,username,avatar,email'])->findOrFail($id);

        if (!$request->user()->groups()->whereKey((int) $id)->exists()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($group->loadCount('users'));
    }

    public function regenerateInvite(Request $request, int $id)
    {
        $group = Group::findOrFail($id);

        if ($group->owner_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $group->update([
            'invite_code' => $this->generateInviteCode(),
        ]);

        return response()->json([
            'invite_code' => $group->invite_code,
        ]);
    }

    public function removeMember(Request $request, int $id, int $userId)
    {
        $group = Group::findOrFail($id);

        if ($group->owner_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ((int) $userId === $group->owner_id) {
            return response()->json(['message' => 'Nao e possivel remover o dono do grupo'], 422);
        }

        if (!$group->users()->whereKey($userId)->exists()) {
            return response()->json(['message' => 'Membro nao encontrado neste grupo'], 404);
        }

        $group->users()->detach($userId);
        $group->bannedUsers()->syncWithoutDetaching([
            $userId => ['banned_by' => $request->user()->id],
        ]);

        return response()->json(['message' => 'Membro removido']);
    }

    public function transferOwnership(Request $request, int $id, int $userId)
    {
        $group = Group::findOrFail($id);

        if ($group->owner_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!$group->users()->whereKey($userId)->exists()) {
            return response()->json(['message' => 'Membro nao encontrado neste grupo'], 404);
        }

        $group->update(['owner_id' => $userId]);

        return response()->json([
            'message' => 'Lideranca transferida',
            'group' => $group->fresh()->loadCount('users'),
        ]);
    }
}
