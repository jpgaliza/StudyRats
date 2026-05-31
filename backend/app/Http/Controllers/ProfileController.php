<?php

namespace App\Http\Controllers;

use App\Models\CheckIn;
use App\Models\Group;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProfileController extends Controller
{
    public function dashboard(Request $request)
    {
        $user = $request->user();

        $weekStart = Carbon::now()->startOfWeek();
        $weekEnd = Carbon::now();

        $weeklyCheckIns = CheckIn::query()
            ->where('user_id', $user->id)
            ->whereBetween('created_at', [$weekStart, $weekEnd])
            ->count();

        $streakDays = $this->computeStudyStreak($user->id);

        $topics = DB::table('check_ins')
            ->selectRaw('topic, COUNT(*) as check_ins_count')
            ->where('user_id', $user->id)
            ->where('created_at', '>=', now()->subDays(60))
            ->groupBy('topic')
            ->orderByDesc('check_ins_count')
            ->limit(12)
            ->get()
            ->map(fn ($row) => [
                'topic' => $row->topic,
                'check_ins_count' => (int) $row->check_ins_count,
            ]);

        return response()->json([
            'streak_days' => $streakDays,
            'weekly_check_ins' => $weeklyCheckIns,
            'topic_breakdown' => $topics,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'avatar' => 'sometimes|nullable|string|max:2000',
            'avatar_file' => 'sometimes|image|max:5120',
        ]);

        if (isset($validated['name'])) {
            $request->user()->name = $validated['name'];
        }
        if (array_key_exists('avatar', $validated)) {
            $request->user()->avatar = $validated['avatar'];
        }
        if ($request->hasFile('avatar_file')) {
            $request->user()->avatar = '/storage/' . $request->file('avatar_file')->store('avatars', 'public');
        }

        $request->user()->save();

        return response()->json($request->user()->fresh());
    }

    public function publicProfile(Request $request, int $groupId, int $userId)
    {
        $group = Group::findOrFail($groupId);

        if (!$request->user()->groups()->whereKey($groupId)->exists()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if (!$group->users()->whereKey($userId)->exists()) {
            return response()->json(['message' => 'Membro nao encontrado neste grupo'], 404);
        }

        $user = User::select('id', 'name', 'username', 'avatar', 'email')->findOrFail($userId);
        $weekStart = Carbon::now()->startOfWeek();
        $monthStart = Carbon::now()->startOfMonth();

        $weeklyCheckIns = CheckIn::query()
            ->where('user_id', $userId)
            ->where('group_id', $groupId)
            ->where('created_at', '>=', $weekStart)
            ->count();

        $monthlyCheckIns = CheckIn::query()
            ->where('user_id', $userId)
            ->where('group_id', $groupId)
            ->where('created_at', '>=', $monthStart)
            ->count();

        $topTopic = DB::table('check_ins')
            ->selectRaw('topic, COUNT(*) as check_ins_count')
            ->where('user_id', $userId)
            ->where('group_id', $groupId)
            ->where('created_at', '>=', now()->subDays(60))
            ->groupBy('topic')
            ->orderByDesc('check_ins_count')
            ->first();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username ?? Str::before($user->email, '@'),
                'avatar' => $user->avatar ?? User::DEFAULT_AVATAR,
            ],
            'group' => ['id' => $group->id, 'name' => $group->name],
            'streak_days' => $this->computeStudyStreak($userId),
            'weekly_check_ins' => $weeklyCheckIns,
            'monthly_check_ins' => $monthlyCheckIns,
            'top_topic' => $topTopic ? [
                'topic' => $topTopic->topic,
                'check_ins_count' => (int) $topTopic->check_ins_count,
            ] : null,
            'ranking_position' => $this->groupMonthlyRank($groupId, $userId),
        ]);
    }

    private function groupMonthlyRank(int $groupId, int $userId): ?int
    {
        $rows = DB::table('group_user')
            ->leftJoin('check_ins', function ($join) use ($groupId) {
                $join->on('group_user.user_id', '=', 'check_ins.user_id')
                    ->where('check_ins.group_id', '=', $groupId)
                    ->where('check_ins.created_at', '>=', now()->startOfMonth());
            })
            ->where('group_user.group_id', $groupId)
            ->groupBy('group_user.user_id')
            ->selectRaw('group_user.user_id, COUNT(check_ins.id) as check_in_count')
            ->orderByDesc('check_in_count')
            ->orderBy('group_user.user_id')
            ->get();

        foreach ($rows as $index => $row) {
            if ((int) $row->user_id === $userId) {
                return $index + 1;
            }
        }

        return null;
    }

    private function computeStudyStreak(int $userId): int
    {
        $cursor = Carbon::now()->startOfDay();

        if (!$this->dayHasCheckIn($userId, $cursor)) {
            $cursor->subDay();
            if (!$this->dayHasCheckIn($userId, $cursor)) {
                return 0;
            }
        }

        $streak = 0;
        while ($this->dayHasCheckIn($userId, $cursor)) {
            $streak++;
            $cursor->subDay();
        }

        return $streak;
    }

    private function dayHasCheckIn(int $userId, Carbon $day): bool
    {
        return DB::table('check_ins')
            ->where('user_id', $userId)
            ->whereDate('created_at', $day->toDateString())
            ->exists();
    }
}
