namespace Views
{
    export function ShowSaveLoad(allowSaving?: boolean)
    {
        UI.Dialog.show(SaveLoad, { title: "Save/Load", allowClose: true, mode: "fill" }, allowSaving);
    }

    export async function SaveLoad(allowSaving?: boolean)
    {
        if (allowSaving == null) allowSaving = true;

        return (
            <div id="save-load" class={ [allowSaving ? null : "load-only", receiveGlobalInputClass] }
                onrendered={ (e: Event) =>
                {
                    globalInput.registerEvent(e.currentTarget as Element,
                        (e: GlobalInputEvent) =>
                        {
                            console.log(e);
                            if (e.input == "Back") UI.Dialog.close(e.currentTarget as Element);
                            e.preventDefault();
                        });
                } }>
                <div class="header saveState">
                    <span>#</span>
                    <span>Save</span>
                    <span>Load</span>
                    <span>Name</span>
                    <span>Savedate</span>
                    <span>Playtime</span>
                    <span>Delete</span>
                    <span>Import</span>
                    <span>Export</span>
                </div>
                <div class="lines">
                    { await Array.fromAsync(generateLines(allowSaving)) }
                </div>
            </div>);
    }

    async function* generateLines(allowSaving: boolean)
    {
        yield generateNewLine(allowSaving);
        for (const [slot, saveState] of (await Game.SaveManager.saveStates).orderBy(x => x[1].date).reverse())
            yield generateLine(slot, saveState, allowSaving);
    }

    function generateLine(slot: number, saveState: Game.SaveState, allowSaving: boolean)
    {
        const highlight = saveState.id == Game.id && saveState.playTime == Game.playTime;
        return (
            <div class={ ["saveState", highlight ? "highlight" : null] } name={ name }>
                <span class="slot">{ slot }</span>
                <button class="save" onclick={ doSave } disabled={ !allowSaving }>Save</button>
                <button class="load" onclick={ doLoad }>Load</button>
                <span class="name">{ saveState.name }</span>
                <span class="savedate">{ dateTimeToReadableString(saveState.date) }</span>
                <span class="playtime">{ timeToReadableString(saveState.playTime, true) }</span>
                <button class="delete" onclick={ doDelete }>Delete</button>
                <button class="export" onclick={ doExport }>Export</button>
                <button class="import" onclick={ doImport }>Import</button>
            </div>);
    }

    function generateNewLine(allowSaving: boolean)
    {
        const saveState = Game.save();

        return (
            <div class={ ["saveState", "slot-new"] }>
                <span class="slot">new</span>
                <button class="save" disabled={ !allowSaving } title={ "Save Slot new" } onclick={ (e: Event) => doSave(e) }>Save</button>
                <button class="load" disabled>Load</button>
                <input class="name" type="text" value="New" />
                <span class="savedate">{ dateTimeToReadableString(saveState.date) }</span>
                <span class="playtime">{ timeToReadableString(saveState.playTime, true) }</span>
                <button class="delete" disabled>Delete</button>
                <button class="export" onclick={ doExport } disabled={ !allowSaving } >Export</button>
                <button class="import" onclick={ doImport }>Import</button>
            </div>);
    }

    async function refresh()
    {
        const saveLoad = document.getElementById("save-load");
        const lines = saveLoad.querySelector(".lines") as HTMLDivElement;
        const allowSaving = !saveLoad.classList.contains("load-only");
        lines.clearChildren();

        for (const line of await Array.fromAsync(generateLines(allowSaving)))
            lines.appendChild(line);
    }

    function getName(e: Event)
    {
        const saveStateElement = (e.currentTarget as Element).closest(".saveState");
        const nameElement = saveStateElement.querySelector(".name");
        if (nameElement instanceof HTMLSpanElement)
            return nameElement.textContent;
        if (nameElement instanceof HTMLInputElement)
            return nameElement.value;
        throw new Error("NameElement not found!");
    }

    async function doSave(e: Event)
    {
        const saveStateElement = (e.currentTarget as Element).closest(".saveState");
        let slot = parseInt(saveStateElement.querySelector(".slot").textContent);
        const name = getName(e);
        const slots = await Game.SaveManager.slots;
        if (isNaN(slot)) slot = slots.length == 0 ? 1 : slots.max(x => x) + 1;

        if (slots.includes(slot) && !confirm("Overwrite?")) return;

        const saveState = Game.save();
        saveState.name = name;
        await Game.SaveManager.save(slot, saveState);
        await refresh();
    }

    async function doLoad(e: Event)
    {
        const saveStateElement = (e.currentTarget as Element).closest(".saveState");
        const slot = parseInt(saveStateElement.querySelector(".slot").textContent);

        if (this.CurrentsaveState && !confirm("Load?")) return;

        const saveState = await Game.SaveManager.load(slot);
        Game.load(saveState);

        UI.Dialog.close(document.getElementById("save-load"));
    }

    async function doDelete(e: Event)
    {
        const saveStateElement = (e.currentTarget as Element).closest(".saveState");
        const slot = parseInt(saveStateElement.querySelector(".slot").textContent);

        if (!confirm("Delete?")) return;

        await Game.SaveManager.delete(slot);
        await refresh();
    }

    async function doImport(e: Event)
    {
        const saveStateElement = (e.currentTarget as Element).closest(".saveState");
        const slot = parseInt(saveStateElement.querySelector(".slot").textContent);

        const slots = await Game.SaveManager.slots;
        if (slots.includes(slot) && !confirm("Overwrite?")) return;

        const saveState: Game.SaveState = await uploadObject();
        await Game.SaveManager.save(slot, saveState);
        await refresh();
    }

    async function doExport(e: Event)
    {
        const saveStateElement = (e.currentTarget as Element).closest(".saveState");
        const slot = parseInt(saveStateElement.querySelector(".slot").textContent);

        const saveState = (await Game.SaveManager.load(slot)) ?? Game.save();
        downloadObject(saveState, slot.toFixed());
    }

    function downloadObject(saveState: Game.SaveState, name: string)
    {
        const dataStr = "data:text/yaml;charset=utf-8," + encodeURIComponent(Game.serialize(saveState));
        const downloadAnchorNode = document.createElement("a");
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", name + ".yaml");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    function uploadObject(): Promise<Game.SaveState>
    {
        const uploadForm = document.createElement("form");
        uploadForm.style.display = "none";
        const uploadInput = document.createElement("input");
        uploadInput.type = "file";
        uploadInput.id = "saveState-upload";
        uploadForm.appendChild(uploadInput);

        const promise = new Promise<Game.SaveState>((resolve, reject) =>
        {
            uploadInput.onchange = () =>
            {
                const file = uploadInput.files[0];
                file.text().then((text) =>
                {
                    const object = Game.deserialize(text);
                    resolve(object);
                });
            };
        });

        uploadInput.click();

        return promise;
    }
}