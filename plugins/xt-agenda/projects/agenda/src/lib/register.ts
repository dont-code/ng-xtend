import { XtResolverService } from 'xt-components';
import { RecurringTaskHandler } from './type-handlers/recurring-task-handler';
import { AgendaDateIntervalComponent } from './date-interval/agenda-date-interval.component';
import {
  AgendaRecurringTaskCompleteComponent
} from './recurring-task-complete/agenda-recurring-task-complete.component';

export function registerAgendaPlugin (resolverService:XtResolverService):string {
  const pluginName = "Plugin Agenda";
    console.info ('Registering '+pluginName);
    resolverService.registerPlugin ({
        name:pluginName,
        uriLogo:'pluginicon.png',
        components: [
            {
              componentName:'AgendaDateIntervalComponent',
              componentClass:AgendaDateIntervalComponent,
              typesHandled: ['date-interval']
            },
            {
              componentName:'AgendaRecurringTaskCompleteComponent',
              componentClass:AgendaRecurringTaskCompleteComponent,
              typesHandled: ['recurring-task-complete']
            }
        ],
      types: {
        'recurring-task-complete': 'boolean',
        'date-interval': {
          every: 'number',
          item: 'string'
        },
        'recurring-task': {
          name: 'string',
          date: 'date',
          occurs: 'date-interval',
          completed: 'recurring-task-complete'
        },
      }
      ,typeHandlers:[
        {
          typesHandled: ['recurring-task'],
          handlerClass: RecurringTaskHandler
        }
      ]

    });
    return pluginName;
}

export function registerPlugin (resolverService:XtResolverService):string {
  return registerAgendaPlugin(resolverService);
}
