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

        $group = Group::create([
            'name'        => $validated['name'],
            'owner_id'    => 1,
            'invite_code' => $this->generateInviteCode(),
        ]);

        $group->users()->attach(1);

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

        $group->users()->syncWithoutDetaching(1);

        return response()->json(['message' => 'Entrou no grupo com sucesso']);
    }
}
