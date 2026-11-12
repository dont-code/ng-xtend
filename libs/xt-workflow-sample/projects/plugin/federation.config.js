const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({

  name: 'workflow-sample-plugin',

  exposes: {
    './SampleWorkflowComponent': './projects/lib/src/lib/sample-workflow.component.ts',
    './Register': './projects/lib/src/lib/register.ts'
  },

  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },
  features: {
    ignoreUnusedDeps: true
  },
  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
    // Add further packages you don't need at runtime
    /^@primeuix\//,
    'chart.js/auto',
    'primeng/chart',
    'primeicons'
  ]

  // Please read our FAQ about sharing libs:
  // https://shorturl.at/jmzH0

});
