<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Z-API Configuration
    |--------------------------------------------------------------------------
    */

    'base_url' => env('ZAPI_BASE_URL', 'https://api.z-api.io'),

    'timeout' => env('ZAPI_TIMEOUT', 30),

    'retries' => env('ZAPI_RETRIES', 3),

    'retry_delay' => env('ZAPI_RETRY_DELAY', 1000), // milliseconds

    'user_agent' => env('ZAPI_USER_AGENT', 'OrcaZap/1.0'),

    /*
    |--------------------------------------------------------------------------
    | Default Instance (optional fallback)
    |--------------------------------------------------------------------------
    */

    'default_instance_id' => env('ZAPI_DEFAULT_INSTANCE_ID'),
    'default_instance_token' => env('ZAPI_DEFAULT_INSTANCE_TOKEN'),
    'default_client_token' => env('ZAPI_DEFAULT_CLIENT_TOKEN'),

    /*
    |--------------------------------------------------------------------------
    | Webhook Configuration
    |--------------------------------------------------------------------------
    */

    'webhook_secret' => env('ZAPI_WEBHOOK_SECRET'),

    /*
    |--------------------------------------------------------------------------
    | Message Defaults
    |--------------------------------------------------------------------------
    */

    'default_delay_message' => env('ZAPI_DEFAULT_DELAY_MESSAGE', 3), // 1-15 seconds
    'default_delay_typing' => env('ZAPI_DEFAULT_DELAY_TYPING', 2), // 0-15 seconds

];
