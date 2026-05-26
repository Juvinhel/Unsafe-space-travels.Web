namespace Game.Battle
{
    export interface Skill extends Action
    {
        constructor: Function;

        category: SkillCategory;
    }

    export const SkillCategory = ["attack", "heal", "buff", "debuff", "utility"] as const;
    export type SkillCategory = typeof SkillCategory[number];

    export function isSkillEquipped(skill: string | Game.Battle.Skill): boolean
    {
        const skillName = typeof skill === "string" ? skill : DataBase.findQualifiedName(skill);
        return Game.data.player.stats.equippedSkills.includes(skillName);
    }

    export function equipSkill(skill: string | Game.Battle.Skill): boolean
    {
        const skillName = typeof skill === "string" ? skill : DataBase.findQualifiedName(skill);
        if (isSkillEquipped(skillName)) return false;

        for (let i = 0; i < Game.data.player.stats.equippedSkills.length; ++i)
            if (!Game.data.player.stats.equippedSkills[i])
            {
                Game.data.player.stats.equippedSkills[i] = skillName;
                return true;
            }
        return false;
    }

    export function unequipSkill(skill: string | Game.Battle.Skill): boolean
    {
        const skillName = typeof skill === "string" ? skill : DataBase.findQualifiedName(skill);
        for (let i = 0; i < Game.data.player.stats.equippedSkills.length; ++i)
            if (Game.data.player.stats.equippedSkills[i] == skillName)
            {
                Game.data.player.stats.equippedSkills[i] = null;
                return true;
            }
        return false;
    }
}