import { XtComponentInfo } from './plugin/xt-plugin-info';

/**
 * Represents a resolved component with its name, class reference, and output capability.
 * Created by the resolver to indicate which XtComponent should be used for a given context.
 */
export class XtResolvedComponent {
    /** The registered name of the resolved component. */
    componentName: string;
    /** The Angular component class reference. */
    componentClass: any;
    /** Whether the component emits any outputs. */
    outputs:boolean;

    /**
     * Creates a new XtResolvedComponent instance.
     * @param componentName - The registered component name
     * @param componentClass - The Angular component class
     * @param outputs - Whether the component has outputs (default false)
     */
    constructor (componentName:string, componentClass:any, outputs:boolean=false) {
        this.componentName = componentName;
        this.componentClass = componentClass;
        this.outputs = outputs;
    }

    /**
     * Creates an XtResolvedComponent from an XtComponentInfo.
     * @param info - The component info from the plugin registry
     * @returns A new XtResolvedComponent instance
     */
    public static from (info:XtComponentInfo<any>): XtResolvedComponent {
      const ret = new XtResolvedComponent(info.componentName, info.componentClass);
      if  ( (info.outputs!=null) && (info.outputs.length>0)){
        ret.outputs=true;
      }
      return ret;
    }
}
