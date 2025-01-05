import { entityConfig, withEntities } from '@ngrx/signals/entities';
import { type } from '@ngrx/signals';

export class ToDo {
}

const xtTypeConfig = entityConfig ({
  entity: type<ToDo>()
})

export function withXtType () {
  withEntities(xtTypeConfig)
}
