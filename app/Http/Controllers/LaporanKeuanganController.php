private function calculateEquityStatement(FiscalPeriod $period)
    {
        $incomeStatement = $this->calculateIncomeStatement($period);
        $netIncome = $incomeStatement['net_income']['total'];

        // Find the previous period to get the beginning balance
        $previousPeriod = FiscalPeriod::where('end_date', '<', $period->start_date)
            ->orderBy('end_date', 'desc')
            ->first();

        $beginningBalance = 0;
        if ($previousPeriod) {
            $balances = $this->getBalances($previousPeriod->end_date);
            $beginningBalance = $balances->where('account_type', 'Ekuitas')->sum('final_balance');
        } else {
            // If no previous period, use initial balance from seeder for accounts of type 'Ekuitas'
            $beginningBalance = DB::table('accounts as a')
                ->join('account_categories as ac', 'a.account_category_id', '=', 'ac.id')
                ->where('ac.account_type_id', 3) // Ekuitas
                ->sum('a.initial_balance');
        }

        $drawings = DB::table('journal_details as jd')
            ->join('journal_entries as je', 'jd.journal_entry_id', '=', 'je.id')
            ->where('je.status', 'Posted')
            ->whereBetween('je.entry_date', [$period->start_date, $period->end_date])
            ->where('jd.account_id', 73) // ID for 'Prive/Dividen'
            ->sum('jd.debit');

        $endingBalance = $beginningBalance + $netIncome - $drawings;

        return [
            'beginning_balance' => ['total' => $beginningBalance],
            'net_income' => ['total' => $netIncome],
            'drawings' => ['total' => $drawings],
            'ending_balance' => ['total' => $endingBalance],
        ];
    }