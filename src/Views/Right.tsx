namespace Views
{
    export async function loadRight()
    {
        const right = document.querySelector("#right") as HTMLElement;

        right.append(worldView = new Views.World.WorldView());
    }

    export let worldView: Views.World.WorldView;
} 