import { XtComponentInfo } from './plugin/xt-plugin-info';

export class XtResolvedComponent {
    componentName: string;
    componentClass: any;
    outputs:boolean;

    constructor (componantName:string, componentClass:any, outputs:boolean=false) {
        this.componentName = componantName;
        this.componentClass = componentClass;
        this.outputs = outputs;
    }

    public static from (info:XtComponentInfo<any>): XtResolvedComponent {
      const ret = new XtResolvedComponent(info.componentName, info.componentClass);
      if  ( (info.outputs!=null) && (info.outputs.length>0)){
        ret.outputs=true;
      }
      return ret;
    }
}
