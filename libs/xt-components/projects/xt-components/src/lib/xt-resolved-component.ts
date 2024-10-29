export class XtResolvedComponent {
    componentName: string;
    componentClass: any;

    constructor (componantName:string, componentClass:any) {
        this.componentName = componantName;
        this.componentClass = componentClass;
    }
}