<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class City extends Model
{
    protected $fillable = [
        'id',
        'state_id',
        'name',
        'latitude',
        'longitude',
        'is_capital',
        'ddd',
        'timezone',
    ];

    public $incrementing = false;

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'is_capital' => 'boolean',
        'ddd' => 'integer',
    ];

    public function state(): BelongsTo
    {
        return $this->belongsTo(State::class);
    }

    public function suppliers(): HasMany
    {
        return $this->hasMany(Supplier::class);
    }

    public function quotes(): BelongsToMany
    {
        return $this->belongsToMany(Quote::class, 'quote_city');
    }

    /**
     * Get city display name with state abbreviation
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->name . ' - ' . ($this->state?->uf ?? '');
    }
}
