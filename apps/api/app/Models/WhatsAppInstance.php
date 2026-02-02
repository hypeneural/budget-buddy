<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WhatsAppInstance extends Model
{
    use HasFactory;

    protected $table = 'whatsapp_instances';

    protected $fillable = [
        'company_id',
        'name',
        'instance_id',
        'instance_token',
        'client_token',
        'status',
        'smartphone_connected',
        'phone_number',
        'qr_code_base64',
        'connected_at',
        'last_status_error',
        'last_status_at',
        'last_qr_at',
    ];

    protected $hidden = [
        'instance_token',
        'client_token',
    ];

    protected function casts(): array
    {
        return [
            'connected_at' => 'datetime',
            'last_status_at' => 'datetime',
            'last_qr_at' => 'datetime',
            'smartphone_connected' => 'boolean',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(WhatsAppMessage::class);
    }

    /**
     * Check if instance has Z-API credentials configured
     */
    public function hasCredentials(): bool
    {
        return !empty($this->instance_id) &&
            !empty($this->instance_token) &&
            !empty($this->client_token);
    }

    /**
     * Scope for connected instances
     */
    public function scopeConnected($query)
    {
        return $query->where('status', 'connected');
    }
}
