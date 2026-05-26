namespace Views.Skills
{
    export function Skills()
    {
        return <div id="skills" onconnected={ () => refreshEquippedSkills() }>
            <tab-header class="category" selectedIndex={ 0 } onselectedindexchanged={ (e: UI.Elements.SelectedIndexChangedEvent) => categoryChanged(e) } >
                <h3><img src={ "img/icons/battle/skill-categories/all.svg" } />all</h3>
                { Game.Battle.SkillCategory.map(ic => <h3><img src={ "img/icons/battle/skill-categories/" + ic + ".svg" } />{ ic }</h3>) }
            </tab-header>
            <div>
                <div class="details" />
                <vertical-divider />
                <div class="list">
                    <h3 class="known-skills-title">Known Skills</h3>
                    <div class="known-skills-list" />
                    <div class="equipped-skills">
                        <h3 class="equipped-skills-title">Equipped Skills</h3>
                        <div class="equipped-skills-list">
                            { Array.repeat(9).map(n => <div id={ "skill-slot-" + n } class="skill-slot"><span>skill-slot-{ n + 1 }</span></div>) }
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }

    function categoryChanged(e: UI.Elements.SelectedIndexChangedEvent)
    {
        const skills = document.querySelector("#skills");
        const list = skills.querySelector(".known-skills-list");
        const category = e.newIndex == 0 ? null : Game.Battle.SkillCategory[e.newIndex - 1];

        list.clearChildren();
        list.append(...(Game.data.player.stats.knownSkills
            .mapAndFilter(name =>
            {
                const skill = DataBase.find(name);
                if (category && skill.category != category) return;
                return <action-button skillName={ DataBase.findQualifiedName(skill) } skill={ skill } text={ skill.name } icon={ skill.icon } actionCost={ skill.actionCost ?? 0 } energyCost={ skill.energyCost ?? 0 } onclick={ () => showDetails(skill) } />;
            })));

        refreshEquippedSkills();
        refreshSelectedSkills();
    }

    let currentSkill: Game.Battle.Skill;
    function showDetails(skill: Game.Battle.Skill)
    {
        currentSkill = skill;
        refreshDetails();
    }

    function refreshSelectedSkills()
    {
        const skills = document.querySelector("#skills");
        if (!skills) return;
        const currentSkillName = DataBase.findQualifiedName(currentSkill);
        for (const actionButton of skills.querySelectorAll("action-button"))
            actionButton.classList.toggle("checked", actionButton.getAttribute("skillName") == currentSkillName);
    }

    function refreshDetails()
    {
        const skills = document.querySelector("#skills");
        if (!skills) return;
        refreshSelectedSkills();

        const details = skills.querySelector(".details");
        details.clearChildren();
        if (!currentSkill) return;

        const isSkillEquipped = Game.Battle.isSkillEquipped(currentSkill);
        details.append(
            <>
                <h2>{ currentSkill.name }</h2>
                <img src={ currentSkill.icon } />
                <div>
                    <label>Category:</label><span>{ currentSkill.category }</span>
                    <p>{ currentSkill.description }</p>
                    <label class="action-cost-text"><img src="img/icons/battle/action.svg" />Action Cost:</label><span class="action-cost-text">{ Integer.toString(currentSkill.actionCost ?? 0) }</span>
                    <label class="energy-cost-text"><img src="img/icons/battle/energy.svg" />Energy Cost:</label><span class="energy-cost-text">{ Integer.toString(currentSkill.energyCost ?? 0) }</span>
                    <label class="cooldown-cost-text"><img src="img/icons/battle/cooldown.svg" />Cooldown:</label><span class="cooldown-cost-text">{ Integer.toString(currentSkill.cooldownCost ?? 0) }</span>
                    <label class="pre-cooldown-text"><img src="img/icons/battle/cooldown.svg" />Pre-cooldown:</label><span class="pre-cooldown-text">{ Integer.toString(currentSkill.cooldown ?? 0) }</span>
                </div>
                { isSkillEquipped ?
                    <button class="unequip" onclick={ () => unequipSkill(currentSkill) }>Unequip</button> :
                    <button class="equip" onclick={ () => equipSkill(currentSkill) }>Equip</button> }
            </>
        );
    }

    function equipSkill(skill: Game.Battle.Skill)
    {
        Game.Battle.equipSkill(skill);
        refreshEquippedSkills();
        refreshDetails();
    }

    function unequipSkill(skill: Game.Battle.Skill)
    {
        Game.Battle.unequipSkill(skill);
        refreshEquippedSkills();
        refreshDetails();
    }

    function refreshEquippedSkills()
    {
        const skills = document.querySelector("#skills");
        const list = skills.querySelector(".equipped-skills-list");

        for (let i = 0; i < Game.data.player.stats.equippedSkills.length; ++i)
        {
            const slot = list.querySelector("#skill-slot-" + i);
            while (slot.children.length > 1) slot.lastChild.remove();

            const skillName = Game.data.player.stats.equippedSkills[i];
            if (!skillName) continue;
            const skill = DataBase.find(skillName);
            slot.appendChild(<action-button skillName={ DataBase.findQualifiedName(skill) } skill={ skill } text={ skill.name } icon={ skill.icon } actionCost={ skill.actionCost ?? 0 } energyCost={ skill.energyCost ?? 0 } onclick={ () => showDetails(skill) } />);
        }
    }
}