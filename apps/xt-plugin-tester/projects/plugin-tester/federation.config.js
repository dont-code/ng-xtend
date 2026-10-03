const { withNativeFederation, shareAll, share } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'xt-plugin-tester',
  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' })
  },
  features: {
    ignoreUnusedDeps:true
  },
  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
    'chart.js/auto',
    /^@primeuix\//,
    'primeng/chart',
    'primeicons'
  ]
});
