namespace Game.World
{
    @Serializer.known()
    export class Map implements Size
    {
        public link: string;
        public name: string;
        public tileWidth: number;
        public tileHeight: number;
        public width: number;
        public height: number;

        public ground: FixedMatrix<Ground>;
        public layers: Layer[];
        public get objects(): Obj[]
        {
            return this.layers.filter(x => "objects" in x).mapMany(x => x.objects as Obj[]);
        }

        public isPassable(p: Point): boolean
        {
            if (p.x < 0) return false;
            if (p.y < 0) return false;
            if (p.x >= this.width) return false;
            if (p.y >= this.height) return false;
            if (this.ground.get(p.x, p.y) != "Passable") return false;
            return true;
        }

        public getTopObject(p: Point, includeHidden: boolean = false): Object
        {
            return this.objects.filter(x => x instanceof Object && contains(x, p) && (!x.hidden || includeHidden)).first() as Object;
        }

        public getAmbients(p: Point): Ambient[]
        {
            return this.objects.filter(x => x instanceof Ambient && Game.World.contains(x, p)) as Ambient[];
        }
        public getTeleporter(p: Point): Teleporter
        {
            return this.objects.filter(x => x instanceof Teleporter && contains(x, p)).first() as Teleporter;
        }

        public getEvents(p: Point): Event[]
        {
            return this.objects.filter(x => x instanceof Event && contains(x, p)) as Event[];
        }

        public getEncounters(p: Point): Encounter[]
        {
            return this.objects.filter(x => x instanceof Encounter && contains(x, p)) as Encounter[];
        }
    };

    export type Tileset = {
        tiles: Tile[];
    };

    export type Tile = {
        id: number;
        link: string;
        [name: string]: any;
    };

    export type Layer = { name?: string; };

    export type PlayerLayer = Layer & { name: "Player"; };

    export type GroundLayer = Layer & { name: "Ground"; };

    export type CellLayer = Layer & {
        cells: FixedMatrix<Cell>;
    };
    export type ObjectLayer = Layer & {
        objects: Obj[];
    };

    export type Cell = {
        link: string;
        [name: string]: any;
    };

    export type Obj = Rect & {
        name?: string;
        type?: string;
        img?: string;
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