import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { XtCompositeComponent, XtContext, XtRenderSubComponent, XtResolverService } from 'xt-components';
import { Panel } from 'primeng/panel';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'xt-default-object',
  imports: [XtRenderSubComponent, Panel, TableModule],
  templateUrl: './default-object.component.html',
  styleUrl: './default-object.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DefaultObjectComponent extends XtCompositeComponent {

  resolver = inject(XtResolverService);

  subNames() :string[]
  {
    const value = this.context().value();
    const ret= this.resolver.listSubNamesOf(this.context(), value);
    return ret;
  }

  override subContext (subName:string): XtContext<any> {
    return super.subContext(subName);
  }

  displayInline= computed (() => {
    const display = this.context().displayMode;

    return display=='INLINE_VIEW' || display=='LIST_VIEW';
  });

  canCalculateDisplayString = computed(() => {
    return this.resolver.findTypeHandlerOf(this.context())?.handler?.isDisplayTemplateSet() ?? false;
  });

  displayString = computed(() => {
    return this.resolver.findTypeHandlerOf(this.context())?.handler?.stringToDisplay(this.context().value());
  });
}
