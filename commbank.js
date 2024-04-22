// on all elements .amount.align_right, add an element inline with them with the sum of all previous .amount.align_right elements

let run = true;

// Table Row Schema
{
  /* <tr class="">
  <td class="date">26 Mar 2024</td>
  <td class="websearch">&nbsp;</td>
  <td class="arrow"><span class="description"><span class="merchant"><a href="javascript:void(0)" class="transaction_details icon-expand icon-square-plus" data-is-purchase="true"><i role="presentation" tabindex="-1"><span class="ScreenReader">Open transaction details</span></i>UBER *EATS Sydney AUS</a></span></span><b aria-hidden="true" role="presentation" class="barrow" tabindex="-1"><bdo></bdo></b></td>
  <td class="debit align_right"><span class="convertCurrency currencyChars7to10"><span class="currencyUI currencyUIDebit"><i class="debit">-</i>$<big>16</big>.08</span></span></td>
  <td class="credit currency">&nbsp;</td>
  <td class="amount align_right"><span class="convertCurrency currencyChars7to10"><span class="currencyUI currencyUIDebit"><i class="debit">-</i>$<big>16</big>.08</span></span></td><span style="margin-left: 10px; color: #999;">-1600.94</span>
  <td class="total currency" style="display: none;">&nbsp;</td>
</tr> */
}

let prevLength = 0;

setInterval(() => {
  if (run) {
    try {
      let total = 0;

      const els = document.querySelectorAll('.amount.align_right');

      if (els?.length === prevLength) {
        return;
      }

      prevLength = els.length;

      const reversedEls = Array.from(els).reverse();

      // remove all els with class commbank-mods-js-subtotal-to-date

      const subtotalToDateEls = document.querySelectorAll('.commbank-mods-js-subtotal-to-date');

      subtotalToDateEls.forEach((el) => {
        el.remove();
      });

      reversedEls.forEach((el) => {
        total += parseFloat(el.innerText.replace('$', '').replace(',', ''));
        el.insertAdjacentHTML(
          'afterend',
          `<span class="commbank-mods-js-subtotal-to-date" style="margin-left: 10px; color: #999;">${total.toFixed(2)}</span>`
        );
      });

      // insert a div above this element .divRecentSearching with all
      // .transaction_details elements text contents and debit/credit's added up from the .amount.align_right elements

      const divRecentSearching = document.querySelector('.divRecentSearching');

      if (divRecentSearching) {
        const transactionDetails = document.querySelectorAll('.transaction_details');

        const prevDiv = document.getElementById('commbank-mods-js');
        if (prevDiv) {
          prevDiv.remove();
        }

        const div = document.createElement('div');

        div.setAttribute('id', 'commbank-mods-js');

        div.innerHTML = `
          <h2>Transaction Details</h2>
          <div class="spending-details-mods">
          </div>
        `;

        divRecentSearching.insertAdjacentElement('beforebegin', div);

        // reduce all table row schema rows and group by transaction_details text content but remove the strings "PENDING -" and "Open transaction details" from the innerText

        const grouped = Array.from(transactionDetails).reduce((acc, el) => {
          const key = el.innerText.replace('PENDING -', '').replace('Open transaction details', '').trim();
          const amount = parseFloat(el.closest('tr').querySelector('.amount.align_right').innerText.replace('$', '').replace(',', ''));

          if (acc[key]) {
            acc[key] += amount;
          } else {
            acc[key] = amount;
          }

          return acc;
        }, {});

        const spendingDetailsMods = document.querySelector('.spending-details-mods');

        // sort grouped by dollar amount

        const sorted = Object.keys(grouped).sort((a, b) => grouped[a] - grouped[b]);

        // delete all els with class spending-details-mods-row

        const spendingDetailsModsRows = document.querySelectorAll('.spending-details-mods-row');

        spendingDetailsModsRows.forEach((el) => {
          el.remove();
        });

        sorted.forEach((key) => {
          const div = document.createElement('div');

          div.setAttribute('class', 'spending-details-mods-row');

          div.style.cssText = `
            display: flex;
            width: 100%;
            flex-direction: row;
            justify-content: space-between;
            padding: 5px;
            border-bottom: 1px solid #ccc;
          `;

          div.innerHTML = `
            <div>${key}</div>
            <div>${grouped[key].toFixed(2)}</div>
          `;

          spendingDetailsMods.appendChild(div);
        });

        // save sorted to localStorage using JSON.stringify and
        // .mainAccountSummary h2 as the key

        const mainAccountSummary = document.querySelector('.mainAccountSummary h2');
        const key = mainAccountSummary.innerText;

        console.log('[Mods][commbank] Saving to localStorage using key', key);
        localStorage.setItem(key, JSON.stringify(sorted));
      }
    } catch (e) {
      console.error(e);
    }

    // run = false;
  }
}, 1000);
