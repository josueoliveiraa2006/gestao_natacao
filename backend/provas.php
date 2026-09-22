<?php

header('Content-Type: application/json; charset=utf-8');

$provas = [
    [
        'id' => 1,
        'nome' => '100 metros Costas',
        'datahora' => '2026-09-25 14:00',
        'local' => 'Piscina Olímpica',
        'arbitro' => 'Carlos Albuquerque',
        'categoria' => 'Adulto'
    ],
    [
        'id' => 2,
        'nome' => '50 metros Livre',
        'datahora' => '2026-09-26 10:00',
        'local' => 'Centro Aquático',
        'arbitro' => 'Mariana Souza',
        'categoria' => 'Juvenil'
    ]
];

echo json_encode($provas);