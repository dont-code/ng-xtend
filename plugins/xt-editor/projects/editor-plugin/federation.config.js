const { withNativeFederation, fromPackageJson } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({

  name: 'editor-plugin',

  exposes: {
    './EditorComponent': './projects/editor/src/lib/editor/editor.component.ts',
    './Register': './projects/editor/src/lib/register.ts'
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
    /^@openng\/optimus-ui-/,
    'chart.js/auto',
    '@openng/optimus-ui/chart',
    'primeicons'
  ]

  // Please read our FAQ about sharing libs:
  // https://shorturl.at/jmzH0

});
