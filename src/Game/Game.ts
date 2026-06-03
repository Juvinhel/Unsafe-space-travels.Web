namespace Game
{
    export let id: string;
    export let sessionStart: Date;
    export let playTime: Time;

    export function start()
    {
        Game.id = GUID.Create();
        Game.sessionStart = new Date();
        Game.playTime = 0;

        Game.data = Data.clone(Game.defaultData);

        Game.Story.showAmbient("/tales/Game.md");
    }

    export function load(saveState: SaveState)
    {
        Game.id = saveState.id;
        Game.sessionStart = new Date();
        Game.playTime = saveState.playTime;

        Game.data = saveState.data;
        deepLoad(Game.data, Game.defaultData);

        if (Game.data.position) Game.World.goto(Game.data.position.map, Game.data.position);
    }

    function deepLoad(state: any, defaultState: any)
    {
        if (defaultState == null) return;

        for (const [key, value] of Object.entries(defaultState))
        {
            if (!(key in state))
                state[key] = Object.clone(value);

            if (typeof state[key] === "object")
                deepLoad(state[key], value);
        }
    }

    export function save(): SaveState
    {
        const elapsedMilliseconds = Number(new Date()) - Number(Game.sessionStart);
        const elapsedSeconds = Math.round(elapsedMilliseconds / 1000);

        return {
            version: App.version,

            id: Game.id,
            playTime: Game.playTime + elapsedSeconds,
            date: new Date(),
            name: "",

            data: Game.data,
        };
    }
}