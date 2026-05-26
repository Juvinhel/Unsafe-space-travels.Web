namespace Views
{
    export async function RefreshInfo()
    {
        const left = document.getElementById("left");
        if (left.firstChild)
            refreshInfo(left.firstElementChild as HTMLElement);
        else
            left.appendChild(await Info());
    }

    export let pc;

    export async function Info()
    {
        return <div style="display: none;" id="info" onrendered={ e => refreshInfo(e.currentTarget as HTMLElement) }>
            <div class="stat-bar"><div /></div>
            <h1>Status: <span id="body-status">healthy</span></h1>
            <h2>Mutations: <span id="mutations-count">0</span></h2>
            <h2>Augmentations: <span id="augmentations-count">0</span></h2>
            <div id="body-display" />
        </div>;
    }

    async function refreshInfo(info: HTMLElement)
    {
        if (!info || !Game.data) return;

        info.style.display = Game.data.bodyScanner ? "initial" : "none";

        const mutationsCount = info.querySelector("#mutations-count");
        mutationsCount.textContent = Game.data.player.body.mutations.length.toString();

        const augmentationsCount = info.querySelector("#augmentations-count");
        augmentationsCount.textContent = Game.data.player.body.augmentations.length.toString();

        if (!App.ImageSelector) return;
        const image = await App.ImageSelector.request("this should be a useful prompt");
        const bodyDisplay = info.querySelector("#body-display");
        bodyDisplay.clearChildren();
        bodyDisplay.appendChild(<img src={ image } />);
    }
} 