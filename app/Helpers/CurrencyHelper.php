<?php

namespace App\Helpers;

class CurrencyHelper
{
    /**
     * Format angka ke Rupiah: 1.234.567
     * Nilai negatif ditampilkan dengan kurung: (1.234.567)
     */
    public static function format($value): string
    {
        if ($value === null || $value === '') {
            return '-';
        }

        $v = floatval($value);
        $fmt = number_format(abs($v), 0, ',', '.');

        return $v < 0 ? '('.$fmt.')' : $fmt;
    }
}
