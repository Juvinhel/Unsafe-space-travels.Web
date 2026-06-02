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

        App.img = new RessourceDictionary("img", ["svg", "png"]);
        await App.img.initialize();
        console.log("Images: " + Object.keys(App.img.files).length);

        App.maps = new RessourceDictionary("maps", ["tmx", "tsx"]);
        await App.maps.initialize();
        console.log("Maps: " + Object.keys(App.maps.files).length);

        App.story = new RessourceDictionary("story", ["md"]);
        await App.story.initialize();
        console.log("Stories: " + Object.keys(App.story.files).length);

        App.data = new RessourceDictionary("data", ["json", "js"]);
        await App.data.initialize();
        console.log("Data: " + Object.keys(App.data.files).length);

        progress.max = Object.keys(App.data.files).length + Object.keys(App.maps.files).length;
        for (const file in App.data.files)
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

        for (const file in App.maps.files)
        {
            const [fileName, extension] = file.trimChar("/").split("/").last().splitLast(".");
            const text = await (await fetch("maps/" + file)).text();
            switch (extension?.toLowerCase())
            {
                case "tmx":
                case "tsx": Game.World.parser.parse(file, text); break;
            }
            ++progress.value;
        }

        UI.Dialog.close(splash);
    }
}