<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class State extends Model
{
    protected $fillable = [
        'id',
        'uf',
        'name',
        'latitude',
        'longitude',
        'region',
    ];

    public $incrementing = false;

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    public function cities(): HasMany
    {
        return $this->hasMany(City::class);
    }
}
