const { withNativeFederation, shareAll, share } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({

  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
    ...share({
      "@primeng/themes/aura": {
        singleton: true,
        strictVersion: true,
        requiredVersion: "auto",
        includeSecondaries: false,
        build: 'separate'
      }
    })
  },

  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
    // Add further packages you don't need at runtime
    'chart.js/auto',
    'primeng/chart'
  ]

  // Please read our FAQ about sharing libs:
  // https://shorturl.at/jmzH0

});
