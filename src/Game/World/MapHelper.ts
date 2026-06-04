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

        public hasBlockingObject(p: Point)
        {
            return this.map.objects.filter(o => "blocking" in o).some(o => contains(o, p) && o.blocking);
        }
    };
}