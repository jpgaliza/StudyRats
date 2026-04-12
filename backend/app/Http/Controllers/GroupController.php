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
        ]);

        $userId = $request->user()->id;

        $group = Group::create([
            'name'        => $validated['name'],
            'owner_id'    => $userId,
            'invite_code' => $this->generateInviteCode(),
        ]);

        $group->users()->attach($userId);

        return response()->json($group, 201);
    }

    public function join(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string',
        ]);

        $group = Group::where('invite_code', $validated['code'])->first();

        if (!$group) {
            return response()->json(['error' => 'Código inválido'], 404);
        }

        $userId = $request->user()->id;

        $group->users()->syncWithoutDetaching($userId);

        return response()->json([
            'message' => 'Entrou no grupo com sucesso'
        ]);
    }

    public function index(Request $request)
    {
        return Group::select('id', 'name', 'invite_code')
            ->withCount('users')
            ->get();
    }
}
