<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    /*
     * Origens exatas (Expo / Vite comuns). Complemente com patterns abaixo
     * para qualquer porta em localhost (Expo Web muda 8081, 8084, 8085, etc.).
     */
    'allowed_origins' => [
        'http://localhost:5173',
        'http://localhost:8081',
        'http://localhost:8082',
        'http://localhost:8083',
        'http://localhost:8084',
        'http://localhost:8085',
        'http://localhost:8086',
        'http://localhost:19006',
        'http://127.0.0.1:8081',
        'http://127.0.0.1:8082',
        'http://127.0.0.1:8083',
        'http://127.0.0.1:8084',
        'http://127.0.0.1:8085',
        'http://127.0.0.1:8086',
        'http://127.0.0.1:19006',
        'http://192.168.0.19:8081',
    ],

    /*
     * Qualquer porta em localhost / 127.0.0.1 / LAN (Expo web, dev server).
     */
    'allowed_origins_patterns' => [
        '#^https?://localhost(:\d+)?$#',
        '#^https?://127\.0\.0\.1(:\d+)?$#',
        '#^https?://192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$#',
        '#^https?://10\.0\.2\.2(:\d+)?$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
