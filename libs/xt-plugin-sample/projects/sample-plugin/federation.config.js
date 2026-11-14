const { withNativeFederation, fromPackageJson } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({

  name: 'sample-plugin',

  exposes: {
    './SampleHelloComponent': './projects/sample/src/lib/hello/sample-hello.component.ts',
    './SampleCurrencyComponent': './projects/sample/src/lib/currency/sample-currency.component.ts',
    './SampleMoneyComponent': './projects/sample/src/lib/money/sample-money.component.ts',
    './Register': './projects/sample/src/lib/register.ts'
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
