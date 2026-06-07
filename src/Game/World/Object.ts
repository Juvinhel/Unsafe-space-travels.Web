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
    export class Teleporter implements Obj
    {
        map?: string;
        destination: Point;

        x: number;
        y: number;
        width: number;
        height: number;
    }

    @Serializer.known()
    export class Event implements Obj
    {
        tale: string;
        probability?: number;

        x: number;
        y: number;
        width: number;
        height: number;
    }

    @Serializer.known()
    export class Encounter implements Obj
    {
        probability?: number;

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

        blocking?: boolean;
        hidden?: boolean;
    }

    @Serializer.known()
    export class Interactive extends Object
    {
        tale: string;
        action?: "Examine" | "Talk";
    };
}