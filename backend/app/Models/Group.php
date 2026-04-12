<?php

namespace App\Models;

use Illuminate\Support\Str;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;


class Group extends Model
{
    protected $fillable = ['name', 'owner_id', 'invite_code'];

    public function users()
    {
        return $this->belongsToMany(User::class);
    }

    function generateInviteCode() {
        do {
            $code = strtoupper(Str::random(6));
        } while (Group::where('invite_code', $code)->exists());

        return $code;
    }

}
