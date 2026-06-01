<?php

namespace App\Http\Controllers;

use App\Models\CheckIn;
use App\Models\Group;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CheckInController extends Controller
{
    public function store(Request $request, int $groupId)
    {
        $group = Group::findOrFail($groupId);

        if (!$request->user()->groups()->whereKey($groupId)->exists()) {
            return response()->json(['message' => 'Voce nao participa deste grupo'], 403);
        }

        $validated = $request->validate([
            'topic' => 'required|string|max:500',
            'note' => 'nullable|string|max:2000',
            'image' => 'required|image|max:5120',
        ]);

        $alreadyCheckedInToday = CheckIn::query()
            ->where('user_id', $request->user()->id)
            ->where('group_id', $group->id)
            ->whereDate('created_at', now()->toDateString())
            ->exists();

        if ($alreadyCheckedInToday) {
            return response()->json([
                'message' => 'Voce ja fez check-in hoje neste grupo.',
            ], 429);
        }

        $path = $request->file('image')->store('checkins', 'public');

        $checkIn = CheckIn::query()->create([
            'user_id' => $request->user()->id,
            'group_id' => $group->id,
            'topic' => $validated['topic'],
            'note' => $validated['note'] ?? null,
            'image_path' => $path,
        ]);

        $checkIn->load('user:id,name,username,avatar,email');

        return response()->json([
            'message' => 'Check-in registrado',
            'check_in' => $this->serializeCheckIn($checkIn),
        ], 201);
    }

    public function feed(Request $request)
    {
        $validated = $request->validate([
            'limit' => 'sometimes|integer|min:1|max:100',
        ]);

        $limit = $validated['limit'] ?? 30;

        $groupIds = $request->user()->groups()->pluck('groups.id');

        if ($groupIds->isEmpty()) {
            return response()->json([]);
        }

        $rows = CheckIn::query()
            ->with(['user:id,name,username,avatar,email', 'group:id,name'])
            ->whereIn('group_id', $groupIds)
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();

        return response()->json($rows->map(fn (CheckIn $c) => $this->serializeCheckIn($c)));
    }

    private function serializeCheckIn(CheckIn $checkIn): array
    {
        $user = $checkIn->user;

        return [
            'id' => $checkIn->id,
            'topic' => $checkIn->topic,
            'note' => $checkIn->note,
            'image_url' => $checkIn->image_path ? '/storage/'.$checkIn->image_path : null,
            'created_at' => $checkIn->created_at->toIso8601String(),
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username ?? Str::before($user->email, '@'),
                'avatar' => $user->avatar ?? User::DEFAULT_AVATAR,
            ],
            'group' => $checkIn->relationLoaded('group') ? [
                'id' => $checkIn->group->id,
                'name' => $checkIn->group->name,
            ] : null,
        ];
    }
}
