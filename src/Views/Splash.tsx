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
            const text = await (await fetch("data/" + file)).text();
            switch (extension?.toLowerCase())
            {
                case "js": eval(text); break;
                case "json":
                    Game.Data.knownObjects[fileName] = Game.Data.deserialize(text, "JSON");
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
}