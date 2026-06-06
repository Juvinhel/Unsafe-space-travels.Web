namespace Game.World
{
    @Serializer.known()
    export class Ambient implements Obj
    {
        tale: string;
        x: number;
        y: number;
        width: number;
        height: number;
    }

    @Serializer.known()
    export class Object implements Obj
    {
        img: string;
        x: number;
        y: number;
        width: number;
        height: number;
        tale?: string;
        blocking?: boolean;
        hidden?: boolean;
    }

    @Serializer.known()
    export class Event extends Object
    {
        declare tale: string;
        probability?: number;
    }

    @Serializer.known()
    export class Encounter extends Object
    {
        probability?: number;
    }

    @Serializer.known()
    export class Interactive extends Object
    {
        declare tale: string;
        action?: "Examine" | "Talk";
    };
}