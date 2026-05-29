namespace Game.Data
{
    export type ConstructorFunction = new (...args: any[]) => any;
    export const knownTypes: { [type: string]: any; } = {};
    export const knownObjects: { [name: string]: any; } = {};

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
        if (!prototype) throw new DataError("Cannot find type: '" + type + "'!", type);
        return prototype.constructor;
    }

    export function getPrototype(type: string): Object
    {
        const prototype = knownTypes[type];
        if (!prototype) throw new DataError("Cannot find type: '" + type + "'!", type);
        return prototype;
    }

    export function getType(obj: any): string
    {
        const type = tryGetType(obj);
        if (!type) throw new DataError("Cannot find type: '" + obj.constructor.name + "'!", obj);
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

    export function serialize(obj: any, format: "YAML" | "JSON" = "YAML"): string
    {
        return (format == "YAML" ? YAML : JSON).stringify(obj, function (key, value)
        {
            if (typeof value === "object" && value != null)
            {
                const type = tryGetType(value);
                if (type) return { "@type": type, ...value };
            }
            return value;
        });
    }

    export function deserialize(data: string, format: "YAML" | "JSON" = "YAML"): any
    {
        const temp = (format == "YAML" ? YAML : JSON).parse(data);
        return restoreObjects(temp);
    }

    function restoreObjects(obj: any): any
    {
        if (null === obj)
        { }
        else if (obj instanceof String)
        {
            obj = obj.toString();
        }
        else if (Array.isArray(obj))
        {
            for (let i = 0; i < obj.length; ++i)
                obj[i] = restoreObjects(obj[i]);
            return obj;
        }
        else if (typeof (obj) === "object")
        {
            let entries = Object.entries(obj);
            if ("@type" in obj)
            {
                const constructor = getConstructor(obj["@type"] as string);
                obj = new constructor();
            }

            for (const [key, value] of entries)
                if (key != "@type") obj[key] = restoreObjects(value);
            return obj;
        }
        else
            return obj;
    }

    export function clone<T>(data: T): T
    {
        return deserialize(serialize(data)) as T;
    }

    export class DataError extends Error
    {
        constructor (message: string, argument: any)
        {
            super(message);
            this.argument = argument;
        }

        public argument: any;
    }
}