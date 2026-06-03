namespace Views.Story
{
    let containerDialog: UI.Elements.ContainerDialog;
    export function ShowStoryDialog(title: string, element: Element)
    {
        if (containerDialog)
        {
            containerDialog.title = title;
            containerDialog.clearChildren();
            containerDialog.append(element);
        }
        else
        {
            containerDialog = new UI.Elements.ContainerDialog();
            containerDialog.title = title;
            containerDialog.mode = "fill";
            containerDialog.allowClose = false;
            containerDialog.append(element);
            containerDialog.show();
        }
    }

    export function CloseStoryDialog()
    {
        containerDialog?.close();
        containerDialog = null;
    }
}