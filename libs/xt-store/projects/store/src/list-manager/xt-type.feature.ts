import { entityConfig, withEntities } from '@ngrx/signals/entities';
import { type } from '@ngrx/signals';

/**
 * Placeholder class representing a to-do item entity type.
 */
export class ToDo {
}

const xtTypeConfig = entityConfig ({
  entity: type<ToDo>()
})

/**
 * SignalStore feature that adds entity management for ToDo items.
 * @returns A signal store feature for ToDo entities
 */
export function withXtType () {
  withEntities(xtTypeConfig)
}
