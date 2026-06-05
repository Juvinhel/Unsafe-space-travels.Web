namespace Game.Body
{
    export type Body =
        {
            feminity: number;
            eyes?: Eyes;
        };

    export interface Eyes
    {
        color: string,
    }

    @Serializer.known()
    export class ProstheticEyes implements Eyes
    {
        constructor (color: string)
        {
            this.color = color;
        }

        public laserIndex: number = 200;
        public color: string;
    }
}