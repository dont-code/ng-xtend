const { withNativeFederation, shareAll,share } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({

  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
    ...share({
      "@primeuix/themes/aura": {
        singleton: true,
        strictVersion: true,
        requiredVersion: "auto",
        includeSecondaries: false,
        build: 'separate',
        packageInfo: {
          entryPoint: 'node_modules/@primeuix/themes/dist/aura/index.mjs'
        }
      }
    })
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
    'chart.js/auto',
    'primeng/chart',
    'primeicons'
  ]

  // Please read our FAQ about sharing libs:
  // https://shorturl.at/jmzH0

});
