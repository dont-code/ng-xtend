import { XtResolverService } from 'xt-components';
import { AgendaDateIntervalComponent } from './date-interval/agenda-date-interval.component';
import { TaskCompleteHandler } from './type-handlers/task-complete-handler';
import { AgendaTaskCompleteComponent } from './task-complete/agenda-task-complete.component';

export function registerAgendaPlugin (resolverService:XtResolverService):string {
  const pluginName = "Plugin Agenda";
    console.info ('Registering '+pluginName);
    resolverService.registerPlugin ({
        name: pluginName,
        uriLogo: 'pluginicon.png',
        components: [
          {
            componentName: 'AgendaDateIntervalComponent',
            componentClass: AgendaDateIntervalComponent,
            typesHandled: ['date-interval']
          },
          {
            componentName: 'AgendaTaskCompleteComponent',
            componentClass: AgendaTaskCompleteComponent,
            typesHandled: ['task-complete']
          }
        ],
        types: {
          'task': {
            date: 'date',
            repetition: 'recurring-task',
            completed: 'task-complete'
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
        types: ['task-complete'],
        actions: {
          'next-task': {
            description:'Create next task occurrence',
            visible: false,
            handlerClass: TaskCompleteHandler
          },
          'remove-next-task': {
            description:'Remove any next task occurrence',
            visible: false,
            handlerClass: TaskCompleteHandler
          }

        }
      }]
    });
    return pluginName;
}

export function registerPlugin (resolverService:XtResolverService):string {
  return registerAgendaPlugin(resolverService);
}
