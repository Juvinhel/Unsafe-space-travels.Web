namespace Views
{
    export async function ShowSplash()
    {
        await UI.Dialog.show(splash(), { title: "Splash", allowClose: true, mode: "full" });
    }

    function splash()
    {
        return <div class="splash" oninserted={ (e: CustomEvent) => load(e.currentTarget as HTMLDivElement) }>
            <h1>Loading Files</h1>
            <progress class="progress" />
        </div>;
    }

    async function load(splash: HTMLDivElement)
    {
        const progress = splash.querySelector("progress");

        // init library types
        Game.Serializer.known()(FixedMatrix);
        FixedMatrix["revive"] = (json: any) =>
        {
            const ret = new FixedMatrix(json.width, json.height);
            let i = 0;
            for (let y = 0; y < ret.height; ++y)
                for (let x = 0; x < ret.width; ++x)
                    ret.set(x, y, json.values[i++]);
            return ret;
        };

        const img = new RessourceDictionary("img", ["svg", "png"]);
        await img.initialize();

        const maps = new RessourceDictionary("maps", ["tmx"]);
        await maps.initialize();

        const tales = new RessourceDictionary("tales", ["md"]);
        await tales.initialize();

        const data = new RessourceDictionary("data", ["json", "js"]);
        await data.initialize();

        progress.max = data.length + tales.length + maps.length;
        for (const file in data.files)
        {
            const [fileName, extension] = file.trimChar("/").split("/").last().splitLast(".");
            switch (extension?.toLowerCase())
            {
                case "js":
                    //@ts-ignore
                    const imports = await import("/data/" + file);
                    for (const [key, value] of Object.entries(imports))
                        if (typeof (value) === "object") loadObject(value);
                        else if (typeof (value) === "function" && /^\s*class\s+/.test(value.toString()))
                            loadType(value);
                    break;
                case "json":
                    const text = await (await fetch("data/" + file)).text();
                    const object = Game.Serializer.deserialize(text, "JSON");
                    if (Array.isArray(object)) for (const obj of object) loadObject(obj);
                    else loadObject(object);
                    break;
            }
            ++progress.value;
        }

        for (const file in tales.files)
        {
            const text = await (await fetch("tales/" + file)).text();
            const link = resolveLink(file, "/tales/");
            Game.Story.knownTales[link] = { link, text };
            ++progress.value;
        }

        for (const file in maps.files)
        {
            const map = await Game.World.parser.loadMap(resolveLink(file, "/maps/"));
            Game.World.knownMaps[map.link] = map;
            ++progress.value;
        }

        UI.Dialog.close(splash);
    }

    function loadType(object: Function)
    {
        const type = Game.Serializer.tryGetType(object);
        if (!type) console.log("Unknown declared type!", type);
        if (object.prototype instanceof Game.Battle.Skill)
            Game.Battle.knownSkills[type] = object as any;
    }

    function loadObject(object: any)
    {
        if (object instanceof Game.Character) Game.knownCharacters[object.name] = object;
        else console.log("Unknown declared object!", object);
    }
}