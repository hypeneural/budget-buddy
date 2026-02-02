<?php

namespace App\Policies;

use App\Models\Quote;
use App\Models\User;

class QuotePolicy
{
    public function view(User $user, Quote $quote): bool
    {
        return $user->company_id === $quote->company_id;
    }

    public function update(User $user, Quote $quote): bool
    {
        return $user->company_id === $quote->company_id;
    }

    public function delete(User $user, Quote $quote): bool
    {
        return $user->company_id === $quote->company_id;
    }
}
