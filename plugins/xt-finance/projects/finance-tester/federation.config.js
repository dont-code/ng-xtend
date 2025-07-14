const { withNativeFederation, shareAll, share } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({

  name: 'finance-tester',

  exposes: {
    './WebImageComponent': './projects/finance/src/lib/web-image/web-image.component.ts',
    './WebLinkComponent': './projects/finance/src/lib/web-link/web-link.component.ts',
    './WebRatingComponent': './projects/finance/src/lib/web-rating/web-rating.component.ts',
    './Register': './projects/web/src/finance/register.ts'
  },

  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
    ...share({
      "@primeng/themes/aura": {
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
    'primeng/chart'
  ]

  // Please read our FAQ about sharing libs:
  // https://shorturl.at/jmzH0

});
