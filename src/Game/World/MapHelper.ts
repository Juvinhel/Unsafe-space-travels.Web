namespace Game.World
{
    export class MapHelper
    {
        constructor (map: Map)
        {
            this.map = map;
        }

        public map: Map;

        public isPassable(p: Point): boolean
        {
            if (p.x < 0) return false;
            if (p.y < 0) return false;
            if (p.x >= this.map.width) return false;
            if (p.y >= this.map.height) return false;
            if (this.map.ground[p.y][p.x] != "Passable") return false;
            return true;
        }

        public getTopObject(p: Point, includeHidden: boolean = false): Object
        {
            return this.map.objects.filter(x => isObject(x) && contains(x, p) && (!x.hidden || includeHidden)).first() as Object;
        }

        public getAmbients(p: Point): Ambient[]
        {
            return this.map.objects.filter(x => Game.World.isAmbient(x) && Game.World.contains(x, p)) as Ambient[];
        }

        public getEvents(p: Point): Event[]
        {
            return this.map.objects.filter(x => isEvent(x) && contains(x, p)) as Event[];
        }

        public getEncounters(p: Point): Encounter[]
        {
            return this.map.objects.filter(x => isEncounter(x) && contains(x, p)) as Encounter[];
        }
    };
}