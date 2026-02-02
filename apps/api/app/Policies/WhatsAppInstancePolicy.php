<?php

namespace App\Policies;

use App\Models\User;
use App\Models\WhatsAppInstance;

class WhatsAppInstancePolicy
{
    public function view(User $user, WhatsAppInstance $whatsappInstance): bool
    {
        return $user->company_id === $whatsappInstance->company_id;
    }

    public function update(User $user, WhatsAppInstance $whatsappInstance): bool
    {
        return $user->company_id === $whatsappInstance->company_id;
    }

    public function delete(User $user, WhatsAppInstance $whatsappInstance): bool
    {
        return $user->company_id === $whatsappInstance->company_id;
    }
}
