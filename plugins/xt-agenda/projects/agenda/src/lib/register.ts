import { XtResolverService } from 'xt-components';
import { AgendaDateIntervalComponent } from './date-interval/agenda-date-interval.component';
import {
  AgendaRecurringTaskCompleteComponent
} from './recurring-task-complete/agenda-recurring-task-complete.component';
import { RecurringTaskHandler } from './type-handlers/recurring-task-handler';

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
        'task': {
          date:'date',
          repetition:'recurring-task',
          completed:'task-complete',
        },
        'task-complete': 'boolean',
        'date-interval': {
          every: 'number',
          item: 'string'
        },
        'recurring-task': {
          name: 'string',
          picture: 'image',
          occurs: 'date-interval'
        }
      },
      actionHandlers: [{
        types: ['recurring-task-complete'],
        actions: {
          'next-task': {
            description:'Create next task',
            visible: false,
            handlerClass: RecurringTaskHandler
          }
        }
      }]
    });
    return pluginName;
}

export function registerPlugin (resolverService:XtResolverService):string {
  return registerAgendaPlugin(resolverService);
}
