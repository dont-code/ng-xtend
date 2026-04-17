const { withNativeFederation, shareAll, share } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({

  name: 'intl-plugin',

  exposes: {
    './IntlCurrencyComponent': './projects/intl/src/lib/currency/intl-currency.component.ts',
    './IntlCountryComponent': './projects/intl/src/lib/country/intl-country.component.ts',
    './Register': './projects/intl/src/lib/register.ts'
  },

  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
},
  features: {
    ignoreUnusedDeps:true
  },
  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
    // Add further packages you don't need at runtime
    /^@primeuix\//,
    'chart.js/auto',
    'primeng/chart',
    'primeicons'
  ]

  // Please read our FAQ about sharing libs:
  // https://shorturl.at/jmzH0

});
