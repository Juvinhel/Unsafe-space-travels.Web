namespace Game.World
{
    export function isAmbient(o: Obj): o is Ambient
    {
        return o.type == "Ambient";
    }

    export type Ambient = Obj &
    {
        type: "Ambient";
        tale: string;
    };

    export function isObejct(o: Obj): o is Object
    {
        return "img" in o;
    }

    export type Object = Obj & {
        type: string;
        img: string;
        tale?: string;
        blocking?: boolean;
        hidden?: boolean;
    };

    export function isInteractive(o: Obj): o is Interactive
    {
        return o.type == "Interactive";
    }

    export type Interactive = Object &
    {
        type: "Interactive";
        tale: string;
    };

    export function isPerson(o: Obj): o is Person
    {
        return o.type == "Person";
    }

    export type Person = Object &
    {
        type: "Person";
        tale: string;
    };
}