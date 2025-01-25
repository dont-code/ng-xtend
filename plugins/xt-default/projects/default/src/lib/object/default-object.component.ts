import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { XtCompositeComponent, XtContext, XtRenderSubComponent, XtResolverService } from 'xt-components';

@Component({
  selector: 'xt-default-object',
  imports: [XtRenderSubComponent],
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

}
