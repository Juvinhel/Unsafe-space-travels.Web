namespace Views.Story
{
    let containerDialog: UI.Elements.ContainerDialog;
    export function ShowStoryDialog(element: Element, title: string = null, allowClose: boolean | null = null)
    {
        Game.World.movementAllowed(false);
        if (containerDialog)
        {
            containerDialog.title = title ?? "";
            if (allowClose != null) containerDialog.allowClose = allowClose;
            containerDialog.clearChildren();
            containerDialog.append(element);
        }
        else
        {
            containerDialog = new UI.Elements.ContainerDialog();
            containerDialog.title = title ?? null;
            if (allowClose != null) containerDialog.allowClose = allowClose;
            containerDialog.mode = "fill";
            containerDialog.append(element);
            containerDialog.addEventListener("close", closing);
            containerDialog.show();
        }
    }

    function closing(e: Event)
    {
        containerDialog = null;
        Game.World.movementAllowed(true);
    }

    export function CloseStoryDialog()
    {
        containerDialog?.close();
    }
}