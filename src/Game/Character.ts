///<reference  path="Serializer.ts" /> 
namespace Game
{
    export const knownCharacters: { [name: string]: Character; } = {};

    @Serializer.known()
    export class Character
    {
        name: string;
        body: Body.Body;
    };
}