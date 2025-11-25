<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::unprepared(
            '-- View: Buku Besar (General Ledger)
            DROP VIEW IF EXISTS `v_general_ledger`;
            CREATE VIEW `v_general_ledger` AS
            SELECT
                jd.id AS detail_id,
                je.entry_date,
                je.entry_number,
                je.penerima AS journal_description,
                a.id AS account_id,
                a.account_code,
                a.account_name,
                jd.description AS detail_description,
                jd.debit,
                jd.credit,
                je.journal_type,
                je.status
            FROM journal_details AS jd
            INNER JOIN journal_entries AS je ON jd.journal_entry_id = je.id
            INNER JOIN accounts AS a ON jd.account_id = a.id
            WHERE je.status = \'Posted\'
            ORDER BY a.account_code, je.entry_date, je.id;'
        );

        DB::unprepared(
            '-- View: Neraca Saldo (Trial Balance)
            DROP VIEW IF EXISTS `v_trial_balance`;
            CREATE VIEW `v_trial_balance` AS
            SELECT
                a.id AS account_id,
                a.account_code,
                a.account_name,
                at.name AS account_type,
                at.normal_balance,
                a.initial_balance AS beginning_balance,
                COALESCE(SUM(jd.debit), 0) AS total_debit,
                COALESCE(SUM(jd.credit), 0) AS total_credit,
                CASE at.normal_balance
                    WHEN \'Debit\' THEN (a.initial_balance + COALESCE(SUM(jd.debit), 0) - COALESCE(SUM(jd.credit), 0))
                    ELSE (a.initial_balance + COALESCE(SUM(jd.credit), 0) - COALESCE(SUM(jd.debit), 0))
                END AS final_balance
            FROM accounts AS a
            INNER JOIN account_categories AS ac ON a.account_category_id = ac.id
            INNER JOIN account_types AS at ON ac.account_type_id = at.id
            LEFT JOIN (
                SELECT jd.account_id, jd.debit, jd.credit
                FROM journal_details AS jd
                INNER JOIN journal_entries AS je ON jd.journal_entry_id = je.id
                WHERE je.status = \'Posted\'
            ) AS jd ON a.id = jd.account_id
            WHERE a.is_active = 1
            GROUP BY a.id, a.account_code, a.account_name, at.name, at.normal_balance, a.initial_balance
            ORDER BY a.account_code;'
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared('DROP VIEW IF EXISTS `v_general_ledger`;');
        DB::unprepared('DROP VIEW IF EXISTS `v_trial_balance`;');
    }
};