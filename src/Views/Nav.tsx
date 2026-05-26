namespace Views
{
    export async function RefreshNav()
    {
        //TODO: check for changed stats
        await UI.Navigator.navigate("top", Views.Nav);
    }

    export async function Nav()
    {
        return (<nav-bar id="nav">
            { Game.data?.smartphone ? <button slot="left" title="quests" onclick={ () => ShowMenu("quests") }><img src="img/icons/smartphone.svg" /></button> : null }
            <button slot="left" title="skills" onclick={ () => ShowMenu("skills") }><img src="img/icons/skills.svg" /></button>
            <button slot="left" title="inventory" onclick={ () => ShowMenu("inventory") }><img src="img/icons/backpack.svg" /></button>
            { /* Game.data?.backpack ? <button slot="left" title="inventory" onclick={ () => ShowMenu("inventory") }><img src="img/icons/backpack.svg" /></button> : null */ }
            <h1 slot="fill" id="story-title" />
            <button slot="right" title="save/load" onclick={ () => ShowSaveLoad() }><img src="img/icons/save.svg" /></button>
        </nav-bar>);
    }
} 