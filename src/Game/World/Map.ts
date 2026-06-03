namespace Game.World
{
    export type Map = Size & {
        link: string;
        name: string;
        tilewidth: number;
        tileheight: number;

        ground: Ground[][];
        objects: Obj[];
    };

    export type Tileset = {
        tiles: Tile[];
    };

    export type Tile = {
        id: number;
        link: string;
        [name: string]: any;
    };

    export type Obj = Rect & {
        name?: string;
        type?: string;
    };

    export const GroundType = ["Default", "Passable", "Impassable"] as const;
    export type Ground = typeof GroundType[number];

    export type Point = {
        x: number;
        y: number;
    };

    export type Size = {
        width: number;
        height: number;
    };

    export type Rect = Point & Size;

    export function contains(rect: Rect, point: Point): boolean
    {
        return point.x >= rect.x && point.x < rect.x + rect.width
            && point.y >= rect.y && point.y < rect.y + rect.height;
    }

    export function intersects(rect1: Rect, rect2: Rect): boolean
    {
        return rect1.x < rect2.x + rect2.width
            && rect1.x + rect1.width > rect2.x
            && rect1.y < rect2.y + rect2.height
            && rect1.y + rect1.height > rect2.y;
    }

    export const DirectionType = ["Up", "Down", "Left", "Right"] as const;
    export type Direction = typeof DirectionType[number];
}