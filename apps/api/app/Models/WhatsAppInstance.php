<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhatsAppInstance extends Model
{
    use HasFactory;

    protected $table = 'whatsapp_instances';
    protected $fillable = [
        'company_id',
        'name',
        'status',
        'phone_number',
        'qr_code_base64',
        'connected_at',
    ];

    protected function casts(): array
    {
        return [
            'connected_at' => 'datetime',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
