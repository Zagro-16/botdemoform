<?php
namespace App\Services;
use Endroid\QrCode\Builder\Builder;
class QrService {
    public function generate(string $payload, string $path): string {
        $result = Builder::create()->data($payload)->size(300)->margin(10)->build();
        $result->saveToFile($path);
        return $path;
    }
}
