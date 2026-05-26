namespace Game.World
{
    export type Object = Obj & {
        type: "Object";
        source?: string;
        blocking?: boolean;
        hidden?: boolean;
        story?: string;
    };

    export function isObject(o: Obj): o is Object
    {
        return o.type == "Object";
    }
}