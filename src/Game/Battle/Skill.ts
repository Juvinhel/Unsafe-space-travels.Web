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
        const skillName = typeof skill === "string" ? skill : Serializer.getType(skill);
        return Game.data.player.expertise.quickslots.includes(skillName);
    }

    export function equipSkill(skill: string | Game.Battle.Skill): boolean
    {
        const skillName = typeof skill === "string" ? skill : Serializer.getType(skill);
        if (isSkillEquipped(skillName)) return false;

        for (let i = 0; i < Game.data.player.expertise.quickslots.length; ++i)
            if (!Game.data.player.expertise.quickslots[i])
            {
                Game.data.player.expertise.quickslots[i] = skillName;
                return true;
            }
        return false;
    }

    export function unequipSkill(skill: string | Game.Battle.Skill): boolean
    {
        const skillName = typeof skill === "string" ? skill : Serializer.getType(skill);
        for (let i = 0; i < Game.data.player.expertise.quickslots.length; ++i)
            if (Game.data.player.expertise.quickslots[i] == skillName)
            {
                Game.data.player.expertise.quickslots[i] = null;
                return true;
            }
        return false;
    }
}