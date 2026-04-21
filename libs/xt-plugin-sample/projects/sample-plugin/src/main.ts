import { ImportMap, initFederation } from '@angular-architects/native-federation';

initFederation()
  .catch((err:any) => console.error(err))
  .then((_:any) => import('./bootstrap'))
  .catch((err:any) => console.error(err));
