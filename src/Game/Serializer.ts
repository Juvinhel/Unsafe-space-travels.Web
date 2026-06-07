namespace Game.Serializer
{
    type ConstructorFunction = new (...args: any[]) => any;
    const knownTypes: { [type: string]: any; } = {};

    export function known(namespace: string = null, name: string = null)
    {
        if (!namespace)
        {
            const err = new Error("Cannot find source file.");
            //@ts-ignore
            Error.captureStackTrace(err);
            const stackLines = err.stack.split("\n");
            const lastLine = stackLines.last();
            const match = lastLine.match(/(?<url>(?<protocol>https?):\/\/(?<host>[^\/]*)(?<path>[^:]*)):/);
            const url = match.groups["url"];
            if (!url.startsWith(document.location.toString())) throw err;

            const relativeUrl = url.substring(document.location.toString().length).trimLeft("/");
            let [directory, fileName] = relativeUrl.splitLast("/");
            if (!fileName) directory = null;

            namespace = directory?.replaceAll("/", ".");
            if (namespace?.startsWith("data.")) namespace = namespace.substring("data.".length);
        }

        return function (constructor: ConstructorFunction)
        {
            const type = (namespace ? namespace + "." : "") + (name ?? constructor.name);
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

    export function isKnown(type: string | Object): boolean
    {
        if (typeof type === "string") return knownTypes[type] != null;
        else return Object.values(knownTypes).some(x => x == type);
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
            const entries = Object.entries(obj);
            if ("@type" in obj)
            {
                const constructor = getConstructor(obj["@type"] as string);
                if ("revive" in constructor)
                {
                    console.log("revive", constructor);
                    return (constructor as any)["revive"](obj);
                }
                obj = new constructor();
            }

            for (const [key, value] of entries)
                if (key != "@type") obj[key] = restoreObjects(value);
            return obj;
        }
        else
            return obj;
    };

    export function clone<T>(data: T): T
    {
        return deserialize(serialize(data, "JSON"), "JSON") as T;
    }
}