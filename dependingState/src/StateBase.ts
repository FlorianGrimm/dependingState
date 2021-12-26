import { UIProps } from "./types";
import { UIViewStateVersion } from "./UIViewStateVersion";

// function getStateVersion<T extends StateBase<any> = any>(that: StateBase<T>): number {
//     return that.stateVersion;
// }

function getStateVersion(that: StateBase<any>): number {
    return that.stateVersion;
}

export class StateBase<TUIProps extends StateBase<TUIProps>> {
    stateVersion: number;
 
    uiViewStateVersion: UIViewStateVersion<TUIProps>;

    constructor() {
        this.stateVersion = 1;
        this.uiViewStateVersion = new UIViewStateVersion<TUIProps>(()=>({
            instance:this as any,
            stateVersion:this.stateVersion
        }),()=>{});
    }

    trigger(){
        this.uiViewStateVersion.trigger();
    }
    
    getViewProps(): UIProps<TUIProps> {
        return this.uiViewStateVersion.getViewProps();
    }
}