const { withNativeFederation, shareAll, share } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({

  name: 'web-tester',

  exposes: {
    './WebImageComponent': './projects/web/src/lib/web-image/web-image.component.ts',
    './WebLinkComponent': './projects/web/src/lib/web-link/web-link.component.ts',
    './WebRatingComponent': './projects/web/src/lib/web-rating/web-rating.component.ts',
    './Register': './projects/web/src/lib/register.ts'
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
