import { XtTypeHandler } from './xt-type-handler';

export type XtTypeDefinition<TD>={
  typeName:string,
  definition: TD,
  handler:XtTypeHandler<TD>
}