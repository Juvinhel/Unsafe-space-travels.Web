# Cell Door #

Now that the emergency unlock was triggered a number input lightens up.

<html>
    <style>
    input { text-align: center; }
    ::placeholder { text-align: center; }
    </style>
    <input id="cell-number-input" style="width: 4em;" type="text" inputMode="numeric" min="0" max="9999" pattern="[0-9]*" placeholder="0000"></input>
</html>
{{ 
    hooks.connected.add((sender, e) => {
        const input = sender.querySelector("#cell-number-input");
        const button = sender.querySelector(".open-button");
        input.addEventListener("keyup", function (e) {
            if (e.key == "Enter") button.click();
            if (e.key =="Escape") input.value = "";
        });
    });
}}
[.open-button Push the button]({{$ 
const numberInput = document.getElementById("cell-number-input");
if (numberInput.value == "4571")
{
    const door = world.findObject("/maps/prison-floor.tmx", "cell-door");
    door.hidden = true;
    door.blocking = false;
    world.refreshObjects();

    numberInput.style.background = "green";

    Game.Story.show("/tales/PrisonFloor/Cell/Escape.md");

    return false;
}
else 
{
    const door = world.findObject("/maps/prison-floor.tmx", "cell-door");
    door.hidden = false;
    door.blocking = true;
    world.refreshObjects();

    numberInput.style.background = "red";
    return false;
} 
}})