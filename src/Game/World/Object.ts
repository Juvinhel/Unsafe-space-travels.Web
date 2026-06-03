namespace Game.World
{
    export type Object = Obj & {
        type: "Object";
        img?: string;
        blocking?: boolean;
        hidden?: boolean;
        tale?: string;
    };

    export function isObject(o: Obj): o is Object
    {
        return o.type == "Object";
    }
}