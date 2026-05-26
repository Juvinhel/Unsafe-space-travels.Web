namespace Views
{
    export function ShowSaveLoad(allowSaving?: boolean)
    {
        UI.Dialog.show(SaveLoad, { title: "Save/Load", allowClose: true, mode: "fill" }, allowSaving);
    }

    export function SaveLoad(allowSaving?: boolean)
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
                <div class="header savegame">
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
                    { [...generateLines(allowSaving)] }
                    { generateNewLine(allowSaving) }
                </div>
            </div>);
    }

    function* generateLines(allowSaving: boolean)
    {
        let i = 0;
        for (const [name, savegame] of Game.SaveManager.savegames)
            yield generateLine(i++, name, savegame, allowSaving);
    }

    function generateLine(index: number, name: string, savegame: Game.Savegame, allowSaving: boolean)
    {
        const highlight = savegame.id == Game.id && savegame.playTime == Game.playTime;
        return (
            <div class={ ["savegame", highlight ? "highlight" : null] } name={ name }>
                <span class="slot">{ index + 1 }</span>
                <button class="save" onclick={ (e: Event) => doSave(e) } disabled={ !allowSaving }>Save</button>
                <button class="load" onclick={ (e: Event) => doLoad(e) }>Load</button>
                <span class="name">{ name }</span>
                <span class="savedate">{ dateTimeToReadableString(savegame.date) }</span>
                <span class="playtime">{ timeToReadableString(savegame.playTime, true) }</span>
                <button class="delete" onclick={ (e: Event) => doDelete(e) }>Delete</button>
                <button class="export" onclick={ (e: Event) => doExport(e) }>Export</button>
                <button class="import" onclick={ (e: Event) => doImport(e) }>Import</button>
            </div>);
    }

    function generateNewLine(allowSaving: boolean)
    {
        const savegame = Game.save();

        return (
            <div class={ ["savegame", "slot-new"] }>
                <span class="slot">new</span>
                <button class="save" disabled={ !allowSaving } title={ "Save Slot new" } onclick={ (e: Event) => doSave(e) }>Save</button>
                <button class="load" disabled>Load</button>
                <input class="name" type="text" value="New" />
                <span class="savedate">{ dateTimeToReadableString(savegame.date) }</span>
                <span class="playtime">{ timeToReadableString(savegame.playTime, true) }</span>
                <button class="delete" disabled>Delete</button>
                <button class="export" onclick={ (e: Event) => doExport(e) } disabled={ !allowSaving } >Export</button>
                <button class="import" onclick={ (e: Event) => doImport(e) }>Import</button>
            </div>);
    }

    function refresh()
    {
        const saveLoad = document.getElementById("save-load");
        const lines = saveLoad.querySelector(".lines") as HTMLDivElement;
        const allowSaving = !saveLoad.classList.contains("load-only");

        for (const oldLine of [...lines.querySelectorAll(".savegame:not(.slot-new)")])
            oldLine.remove();

        for (const line of generateLines(allowSaving))
            lines.insertBefore(line, lines.lastChild);
    }

    function getName(e: Event)
    {
        const savegameElement = (e.currentTarget as Element).closest(".savegame");
        const nameElement = savegameElement.querySelector(".name");
        if (nameElement instanceof HTMLSpanElement)
            return nameElement.textContent;
        if (nameElement instanceof HTMLInputElement)
            return nameElement.value;
        throw new Error("NameElement not found!");
    }

    function doSave(e: Event)
    {
        const name = getName(e);

        if (Game.SaveManager.exists(name) && !confirm("Overwrite?")) return;

        const savegame = Game.save();
        Game.SaveManager.save(savegame, name);
        refresh();
    }

    function doLoad(e: Event)
    {
        const name = getName(e);

        if (this.CurrentSavegame && !confirm("Load?")) return;

        const savegame = Game.SaveManager.load(name);
        Game.load(savegame);

        UI.Dialog.close(document.getElementById("save-load"));
    }

    function doDelete(e: Event)
    {
        const name = getName(e);

        if (!confirm("Delete?")) return;

        Game.SaveManager.delete(name);
        refresh();
    }

    function doImport(e: Event)
    {
        const name = getName(e);

        if (Game.SaveManager.exists(name) && !confirm("Overwrite?")) return;

        uploadObject().then((savegame: Game.Savegame) =>
        {
            Game.SaveManager.save(savegame, name);
            refresh();
        });
    }

    function doExport(e: Event)
    {
        const name = getName(e);
        const savegame = Game.SaveManager.load(name) ?? Game.save();
        downloadObject(savegame, name);
    }

    function downloadObject(object: any, name: string)
    {
        const dataStr = "data:text/yaml;charset=utf-8," + encodeURIComponent(YAML.stringify(object));
        const downloadAnchorNode = document.createElement("a");
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", name + ".yaml");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    function uploadObject(): Promise<Game.Savegame>
    {
        const uploadForm = document.createElement("form");
        uploadForm.style.display = "none";
        const uploadInput = document.createElement("input");
        uploadInput.type = "file";
        uploadInput.id = "savegame-upload";
        uploadForm.appendChild(uploadInput);

        const promise = new Promise<Game.Savegame>((resolve, reject) =>
        {
            uploadInput.onchange = () =>
            {
                const file = uploadInput.files[0];
                file.text().then((text) =>
                {
                    const object = Game.SaveManager.deserialize(text);
                    resolve(object);
                });
            };
        });

        uploadInput.click();

        return promise;
    }
}