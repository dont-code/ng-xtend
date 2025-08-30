const { withNativeFederation, shareAll, share } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({

  name: 'sample-tester',

  exposes: {
    './SampleHelloComponent': './projects/sample/src/lib/hello/sample-hello.component.ts',
    './SampleCurrencyComponent': './projects/sample/src/lib/currency/sample-currency.component.ts',
    './SampleMoneyComponent': './projects/sample/src/lib/money/sample-money.component.ts',
    './Register': './projects/sample/src/lib/register.ts'
  },

  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
    ...share({
      "@primeuix/themes/aura": {
        singleton: true,
        strictVersion: true,
        requiredVersion: "auto",
        includeSecondaries: false,
        build: 'separate'
      },
    }),},

  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
    // Add further packages you don't need at runtime
    'chart.js/auto',
    'primeng/chart',
    'primeicons'
  ]

  // Please read our FAQ about sharing libs:
  // https://shorturl.at/jmzH0

});
