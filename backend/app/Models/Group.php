<?php

namespace App\Models;

use App\Models\CheckIn;
use Illuminate\Support\Str;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;


class Group extends Model
{
    protected $fillable = ['name', 'description', 'starts_at', 'ends_at', 'owner_id', 'invite_code'];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class);
    }

    public function bannedUsers()
    {
        return $this->belongsToMany(User::class, 'group_bans')
            ->withPivot('banned_by')
            ->withTimestamps();
    }

    function generateInviteCode() {
        do {
            $code = strtoupper(Str::random(6));
        } while (Group::where('invite_code', $code)->exists());

        return $code;
    }
    
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function members()
    {
        return $this->belongsToMany(User::class);
    }

    public function checkIns()
    {
        return $this->hasMany(CheckIn::class);
    }
}
