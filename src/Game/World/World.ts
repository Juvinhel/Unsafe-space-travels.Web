namespace Game.World
{
    let internal_movementAllowed: boolean = true;
    export function movementAllowed(value?: boolean): boolean
    {
        if (value != null)
        {
            internal_movementAllowed = value;

            Views.worldView.refreshMovePad();
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

        Views.worldView.goto(map, playerPosition);
    }

    export function refreshObjects()
    {
        Views.worldView.refreshObjects();
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