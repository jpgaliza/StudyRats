<?php

namespace Tests\Unit;

use App\Models\Group;
use PHPUnit\Framework\TestCase;

class GroupInviteCodeTest extends TestCase
{
    public function test_group_allows_expected_mass_assignable_fields(): void
    {
        $group = new Group();

        $this->assertSame(['name', 'owner_id', 'invite_code'], $group->getFillable());
    }
}
