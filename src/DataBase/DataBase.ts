namespace DataBase
{
    export type ConstructorFunction = new (...args: any[]) => any;
    export const knownTypes: { [type: string]: any; } = {};

    export function known(type: string)
    {
        return function (constructor: ConstructorFunction)
        {
            constructor.prototype["@type"] = type;
            knownTypes[type] = constructor.prototype;
        };
    }

    export function create(type: string, ...params: any[]): any
    {
        if (!type) return undefined;
        const constructor = getConstructor(type);
        return new constructor(...params);
    }

    export function getConstructor(type: string): ConstructorFunction
    {
        const prototype = knownTypes[type];
        if (!prototype) throw new DataBaseError("Cannot find type: '" + type + "'!", type);
        return prototype.constructor;
    }

    export function getPrototype(type: string): Object
    {
        const prototype = knownTypes[type];
        if (!prototype) throw new DataBaseError("Cannot find type: '" + type + "'!", type);
        return prototype;
    }

    export function getType(obj: any): string
    {
        const type = tryGetType(obj);
        if (!type) throw new DataBaseError("Cannot find type: '" + obj.constructor.name + "'!", obj);
        return type;
    }

    export function tryGetType(obj: any): string
    {
        if (obj == null) return undefined;
        let prototype = typeof obj === "function" ? obj.prototype : Object.getPrototypeOf(obj);
        if (!prototype) return undefined;
        const type = prototype["@type"];
        if (!type) return undefined;
        return type;
    }

    export class DataBaseError extends Error
    {
        constructor (message: string, argument: any)
        {
            super(message);
            this.argument = argument;
        }

        public argument: any;
    }
}