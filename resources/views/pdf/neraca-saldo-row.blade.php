{{-- resources/views/pdf/neraca-saldo-row.blade.php --}}
@php
    $isParent = $level == 0;
@endphp
<tr class="{{ $isParent ? 'tr-subsection' : 'tr-item' }}">
    <td style="padding-left: {{ $level * 12 + ($isParent ? 5 : 18) }}px; {{ $isParent ? 'font-weight: bold;' : '' }}">
        {{ $account['account_code'] }} - {{ $account['account_name'] }}
    </td>
    <td class="col-value {{ $isParent ? 'font-bold' : '' }}">
        {{ floatval($account['opening_debit']) > 0 ? number_format($account['opening_debit'], 2, ',', '.') : '-' }}
    </td>
    <td class="col-value {{ $isParent ? 'font-bold' : '' }}">
        {{ floatval($account['opening_credit']) > 0 ? number_format($account['opening_credit'], 2, ',', '.') : '-' }}
    </td>
    <td class="col-value {{ $isParent ? 'font-bold' : '' }}">
        {{ floatval($account['debit_movement']) > 0 ? number_format($account['debit_movement'], 2, ',', '.') : '-' }}
    </td>
    <td class="col-value {{ $isParent ? 'font-bold' : '' }}">
        {{ floatval($account['credit_movement']) > 0 ? number_format($account['credit_movement'], 2, ',', '.') : '-' }}
    </td>
    <td class="col-value {{ $isParent ? 'font-bold' : '' }}">
        {{ floatval($account['closing_debit']) > 0 ? number_format($account['closing_debit'], 2, ',', '.') : '-' }}
    </td>
    <td class="col-value {{ $isParent ? 'font-bold' : '' }}">
        {{ floatval($account['closing_credit']) > 0 ? number_format($account['closing_credit'], 2, ',', '.') : '-' }}
    </td>
</tr>

@if (!empty($account['children']))
    @foreach ($account['children'] as $child)
        @include('pdf.neraca-saldo-row', ['account' => $child, 'level' => $level + 1])
    @endforeach
@endif
