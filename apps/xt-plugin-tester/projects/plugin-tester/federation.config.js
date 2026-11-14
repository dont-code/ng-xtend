const { withNativeFederation, fromPackageJson } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'xt-plugin-tester',
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
    'chart.js/auto',
    /^@openng\/optimus-ui-/,
    '@openng/optimus-ui/chart',
    'primeicons'
  ]
});
