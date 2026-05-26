namespace DataBase
{
    export function find(qualifiedName: string): any
    {
        if (!qualifiedName) return undefined;
        const objectClass = Object.getByPath(DataBase, qualifiedName);
        if (!objectClass) throw new DataBaseError("Not found!", qualifiedName);
        return new objectClass();
    }

    export function findQualifiedName(object: any): string
    {
        if (!object) return undefined;
        const constructor = object.constructor;
        if (!constructor) throw new DataBaseError("Not found!", object);
        const ret = constructor["qualifiedName"];
        if (!ret) throw new DataBaseError("Not found!", object);
        return ret;
    }

    export function init()
    {
        const basePrototype = Object.getPrototypeOf({});
        for (const [name, value] of Object.entries(DataBase))
        {
            const qualifiedName = name;
            if (Object.getPrototypeOf(value) == basePrototype) // namespace
                setQualifiedNames(qualifiedName, value);
        }
    }

    function setQualifiedNames(parentName: string, namespace: any)
    {
        const basePrototype = Object.getPrototypeOf({});
        for (const [name, value] of Object.entries(namespace))
        {
            const qualifiedName = (parentName ? parentName + "." : "") + name;
            if (Object.getPrototypeOf(value) == basePrototype) // namespace
                setQualifiedNames(qualifiedName, value);
            else if (typeof value == "function" && value.toString().startsWith("class"))
                value["qualifiedName"] = qualifiedName;
        }
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