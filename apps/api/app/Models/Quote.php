<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Quote extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'user_id',
        'title',
        'message',
        'general_notes',
        'status',
        'closed_at',
        'winner_supplier_id',
    ];

    protected function casts(): array
    {
        return [
            'closed_at' => 'datetime',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function winnerSupplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'winner_supplier_id');
    }

    public function suppliers(): BelongsToMany
    {
        return $this->belongsToMany(Supplier::class, 'quote_supplier')
            ->withPivot(['status', 'value', 'notes', 'responded_at'])
            ->withTimestamps();
    }

    public function cities(): BelongsToMany
    {
        return $this->belongsToMany(City::class, 'quote_city');
    }
}
