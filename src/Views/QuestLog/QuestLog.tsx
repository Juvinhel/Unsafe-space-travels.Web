namespace Views.Quests
{
    export function QuestLog()
    {
        return (<div id="quest-log">
            <tree-view class="tree">
                { buildQuestTree(Game.data.quests) }
            </tree-view>
            <vertical-divider />
            <div class="description" />
        </div>);
    }

    function buildQuestTree(quests: Game.Quest[])
    {
        if (!quests || !quests.length) return null;
        return quests.map(q => <tree-node>
            <h3 class={ [q.completed ? "completed" : null] } slot="title" onclick={ e => onClick(e, q) }>{ q.title }</h3>
            { buildQuestTree(q.subQuests) }
        </tree-node>);
    }

    async function onClick(e: Event, quest: Game.Quest)
    {
        const title = e.currentTarget as HTMLHeadingElement;
        const treeNode = title.closest("tree-node") as HTMLTreeNode;

        selectQuest(treeNode, quest);

        e.preventDefault();
        e.stopPropagation();
    }

    async function selectQuest(li: HTMLTreeNode, quest: Game.Quest)
    {
        const oldSelected = li.classList.contains("selected");
        const questLog = li.closest("#quest-log");
        const description = questLog.querySelector(".description");

        description.clearChildren();

        for (const l of questLog.querySelectorAll("tree-node"))
            l.classList.remove("selected");

        if (li.classList.toggle("selected", !oldSelected))
        {
            li.expanded = true;
            description.append(await Game.Story.render(quest.link, { quest }));
        }
    }
}