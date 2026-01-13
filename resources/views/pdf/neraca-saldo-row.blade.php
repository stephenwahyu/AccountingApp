<tr style="{{ $level == 0 ? 'font-weight: bold; background-color: #f7fafc;' : '' }}">
    <td style="padding-left: {{ $level * 15 + 5 }}px;">
        {{ $account['account_code'] }} - {{ $account['account_name'] }}
    </td>
    <td class="text-right text-mono">
        {{ number_format($account['opening_debit'], 2, ',', '.') > 0 ? number_format($account['opening_debit'], 2, ',', '.') : '-' }}
    </td>
    <td class="text-right text-mono">
        {{ number_format($account['opening_credit'], 2, ',', '.') > 0 ? number_format($account['opening_credit'], 2, ',', '.') : '-' }}
    </td>
    <td class="text-right text-mono">
        {{ number_format($account['debit_movement'], 2, ',', '.') > 0 ? number_format($account['debit_movement'], 2, ',', '.') : '-' }}
    </td>
    <td class="text-right text-mono">
        {{ number_format($account['credit_movement'], 2, ',', '.') > 0 ? number_format($account['credit_movement'], 2, ',', '.') : '-' }}
    </td>
    <td class="text-right text-mono">
        {{ number_format($account['closing_debit'], 2, ',', '.') > 0 ? number_format($account['closing_debit'], 2, ',', '.') : '-' }}
    </td>
    <td class="text-right text-mono">
        {{ number_format($account['closing_credit'], 2, ',', '.') > 0 ? number_format($account['closing_credit'], 2, ',', '.') : '-' }}
    </td>
</tr>

@if (!empty($account['children']))
    @foreach ($account['children'] as $child)
        @include('pdf.neraca-saldo-row', ['account' => $child, 'level' => $level + 1])
    @endforeach
@endif