namespace Game
{
    export interface Expertise
    {
        skills: Battle.Skill[];
        quickslots: FixedLengthArray<string, 9>;
    }
}