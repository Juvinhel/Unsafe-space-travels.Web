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

    export function isInteractive(o: Obj): o is Interactive
    {
        return o.type == "Interactive";
    }

    export type Interactive = Obj &
    {
        type: "Interactive";
        tale: string;
        img: string;
        hidden: boolean;
        blocking: boolean;
    };
}