const { withNativeFederation, fromPackageJson } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({

  name: 'intl-plugin',

  exposes: {
    './IntlCurrencyComponent': './projects/intl/src/lib/currency/intl-currency.component.ts',
    './IntlCountryComponent': './projects/intl/src/lib/country/intl-country.component.ts',
    './Register': './projects/intl/src/lib/register.ts'
  },

  shared: fromPackageJson({ singleton: true, strictVersion: true, requiredVersion: 'auto' })
    .patch(['@angular/animations', '@angular/common', '@angular/core', '@angular/forms', '@angular/platform-browser', '@angular/router'], { includeSecondaries: { keepAll: true } }),
  features: {
    ignoreUnusedDeps: true,
    denseExternals: true
  },
  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
    // Add further packages you don't need at runtime
    /^@openng\/optimus-ui-/,
    'chart.js/auto',
    '@openng/optimus-ui/chart',
    'primeicons'
  ]

  // Please read our FAQ about sharing libs:
  // https://shorturl.at/jmzH0

});
