namespace Game.World
{
    let internal_movementAllowed: boolean = true;
    export function movementAllowed(value?: boolean): boolean
    {
        if (value != null)
        {
            internal_movementAllowed = value;

            const right = document.getElementById("right");
            const movePad = right.querySelector("move-pad") as Views.World.MovePad;
            const mapView = right.querySelector("map-view") as Views.World.MapView;

            if (movePad && mapView)
                refreshMovePad(movePad, mapView);
        }

        return internal_movementAllowed;
    }

    export async function clear()
    {
        const right = document.getElementById("right");
        right.clearChildren();

        //
        Game.data.position = null;
    }

    function refineLink(link: string): string
    {
        if (link.endsWith(".map.json"))
            link = link.substrEnd(".map.json".length);
        link = link.trimLeft("/");
        return link;
    }

    async function get(link: string): Promise<Map>
    {
        link = refineLink(link);

        let url = link;
        if (!url.endsWith(".map.json"))
            url += ".map.json";

        const response = await fetch(url);
        const ret = await response.json() as Map;
        ret.link = link;

        if (link in Game.data.maps)
            ret.objects = Game.data.maps[link].objects;
        else
            Game.data.maps[link] = { objects: ret.objects };
        //TODO: update old object data

        return ret;
    }

    export async function goto(link: string, playerPosition: Point)
    {
        const map = await get(link);

        const right = document.getElementById("right");
        right.clearChildren();

        const title = document.createElement("h2");
        title.textContent = map.name;
        title.classList.add("title");

        const mapView = new Views.World.MapView(map, { x: playerPosition.x, y: playerPosition.y });

        const movePad = new Views.World.MovePad();
        movePad.addEventListener(Views.World.MoveEventName, (e: CustomEvent<Direction>) => mapView.player.move(e.detail));

        mapView.addEventListener(Views.World.RefreshMovementEventName, (e: CustomEvent<Point>) => refreshMovePad(movePad, mapView));

        right.appendChild(title);
        right.appendChild(mapView);
        right.appendChild(movePad);
        refreshMovePad(movePad, mapView);

        //
        Game.data.position = { map: link, x: playerPosition.x, y: playerPosition.y };
    }

    function refreshMovePad(movePad: Views.World.MovePad, mapView: Views.World.MapView)
    {
        movePad.canUp = mapView.player.canUp;
        movePad.canDown = mapView.player.canDown;
        movePad.canLeft = mapView.player.canLeft;
        movePad.canRight = mapView.player.canRight;
    }

    export function refreshObjects()
    {
        const right = document.getElementById("right");
        const mapView = right.querySelector("map-view") as Views.World.MapView;
        if (mapView) mapView.refreshObjects();
    }

    export function findObject(link: string, name: string): Obj
    {
        link = refineLink(link);
        if (link in Game.data.maps)
        {
            const map = Game.data.maps[link];
            for (const obj of map.objects)
                if (obj.name == name)
                    return obj;
        }
        return null;
    }
}