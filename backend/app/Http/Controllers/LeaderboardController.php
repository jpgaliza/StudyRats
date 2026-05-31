<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LeaderboardController extends Controller
{
    public function index(Request $request, int $groupId)
    {
        $validated = $request->validate([
            'period' => 'sometimes|string|in:daily,weekly,monthly',
        ]);

        $group = Group::findOrFail($groupId);

        if (!$request->user()->groups()->whereKey($groupId)->exists()) {
            return response()->json(['message' => 'Voce nao participa deste grupo'], 403);
        }

        $period = $validated['period'] ?? 'monthly';
        [$start, $end] = $this->periodRange($period);

        $scores = DB::table('check_ins')
            ->selectRaw('user_id, COUNT(*) as check_in_count')
            ->where('group_id', $group->id)
            ->whereBetween('created_at', [$start, $end])
            ->groupBy('user_id')
            ->orderByDesc('check_in_count')
            ->orderBy('user_id')
            ->get();

        $entries = [];

        foreach ($scores as $i => $row) {
            $rank = $this->rankForIndex($scores, $i);

            $user = DB::table('users')->where('id', $row->user_id)->first();

            if (!$user) {
                continue;
            }

            $entries[] = [
                'user_id' => (int) $row->user_id,
                'name' => $user->name,
                'username' => $user->username ?? Str::before($user->email, '@'),
                'avatar' => $user->avatar ?? User::DEFAULT_AVATAR,
                'rank' => $rank,
                'check_in_count' => (int) $row->check_in_count,
            ];
        }

        return response()->json([
            'group' => [
                'id' => $group->id,
                'name' => $group->name,
            ],
            'period' => $period,
            'starts_at' => $start->toIso8601String(),
            'ends_at' => $end->toIso8601String(),
            'members' => $entries,
            'top_members' => array_values(array_slice($entries, 0, 3)),
        ]);
    }

    /**
     * @param \Illuminate\Support\Collection<int, object>|array<int, object> $scores
     */
    private function rankForIndex($scores, int $index): int
    {
        if ($index === 0) {
            return 1;
        }

        /** @phpstan-ignore-next-line */
        $current = (int) $scores[$index]->check_in_count;
        /** @phpstan-ignore-next-line */
        $previous = (int) $scores[$index - 1]->check_in_count;

        if ($current === $previous) {
            return $this->rankForIndex($scores, $index - 1);
        }

        return $index + 1;
    }

    public function preview(Request $request, int $groupId)
    {
        $validated = $request->validate([
            'period' => 'sometimes|string|in:daily,weekly,monthly',
        ]);

        $group = Group::findOrFail($groupId);

        if (!$request->user()->groups()->whereKey($groupId)->exists()) {
            return response()->json(['message' => 'Voce nao participa deste grupo'], 403);
        }

        $period = $validated['period'] ?? 'monthly';
        [$start, $end] = $this->periodRange($period);

        $rows = DB::table('check_ins')
            ->select('user_id')
            ->selectRaw('COUNT(*) as check_in_count')
            ->where('group_id', $group->id)
            ->whereBetween('created_at', [$start, $end])
            ->groupBy('user_id')
            ->orderByDesc('check_in_count')
            ->orderBy('user_id')
            ->limit(3)
            ->get();

        $preview = [];

        foreach ($rows as $row) {
            $user = DB::table('users')->where('id', $row->user_id)->first();
            if (!$user) {
                continue;
            }

            $preview[] = [
                'user_id' => (string) $row->user_id,
                'name' => $user->name,
                'avatar' => $user->avatar ?? User::DEFAULT_AVATAR,
                'check_in_count' => (int) $row->check_in_count,
            ];
        }

        return response()->json([
            'group_id' => $group->id,
            'period' => $period,
            'top_members' => $preview,
        ]);
    }

    /**
     * @return array{0: Carbon, 1: Carbon}
     */
    private function periodRange(string $period): array
    {
        return match ($period) {
            'daily' => [Carbon::now()->startOfDay(), Carbon::now()->endOfDay()],
            'weekly' => [Carbon::now()->startOfWeek(), Carbon::now()],
            default => [Carbon::now()->startOfMonth(), Carbon::now()],
        };
    }
}
