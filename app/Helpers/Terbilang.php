<?php

namespace App\Helpers;

class Terbilang
{
    public static function make($angka)
    {
        $angka = abs($angka);
        $baca = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
        $terbilang = "";

        if ($angka < 12) {
            $terbilang = " " . $baca[$angka];
        } elseif ($angka < 20) {
            $terbilang = self::make($angka - 10) . " Belas";
        } elseif ($angka < 100) {
            $terbilang = self::make($angka / 10) . " Puluh" . self::make($angka % 10);
        } elseif ($angka < 200) {
            $terbilang = " Seratus" . self::make($angka - 100);
        } elseif ($angka < 1000) {
            $terbilang = self::make($angka / 100) . " Ratus" . self::make($angka % 100);
        } elseif ($angka < 2000) {
            $terbilang = " Seribu" . self::make($angka - 1000);
        } elseif ($angka < 1000000) {
            $terbilang = self::make($angka / 1000) . " Ribu" . self::make($angka % 1000);
        } elseif ($angka < 1000000000) {
            $terbilang = self::make($angka / 1000000) . " Juta" . self::make($angka % 1000000);
        } elseif ($angka < 1000000000000) {
            $terbilang = self::make($angka / 1000000000) . " Miliar" . self::make($angka % 1000000000);
        }

        return $terbilang;
    }
}
