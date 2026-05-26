<html>
<style>
#character-creation 
{
    display: grid;
    grid-template-columns: min-content min-content;
    grid-auto-rows: min-content;
    gap: 0.25rem 1rem;
    align-items: center;
}

#character-creation > *
{
    grid-column: 2;
}

#character-creation > label
{
    grid-column: 1;
}

#character-creation > div
{
    display: flex;
    gap: 0.5rem;
}

#character-creation > input[type=submit]
{
    grid-column: 1 / span 2;
}

#character-creation input
{
    padding: 0.5em;
}

[for=male], [for=female]
{
    border-radius: 50%;
    width: 1em;
    height: 1em;
    display: flex;
    align-content: center;
    align-items: center;
    justify-content: center;
    justify-items: center;
}
</style>
<script>
    function submit()
    {
        const characterCreationElement = document.getElementById("character-creation");
        const name = characterCreationElement.querySelector("#name").value;
        const isMale = characterCreationElement.querySelector("#male").checked;
        const isFemale = characterCreationElement.querySelector("#female").checked;
       
        Game.State.player.name = name;
        Game.State.player.gender = isMale ? "male" : "female";
        
        Story.SetStory(document.getElementById("main"), "Start");
    }
</script>
<div id="character-creation">
    <label for="name">Name:</label>
    <input type="text" id="name">

    <label>Gender:</label>
    <div>
        <input type="radio" id="male" class="toggle" name="gender" value="male" checked>
        <label for="male">♂</label>
        <input type="radio" id="female" class="toggle" name="gender" value="female">
        <label for="female">♀</label>
    </div>

    <input type="submit" onclick="submit()" value="OK">
</div>
</html>