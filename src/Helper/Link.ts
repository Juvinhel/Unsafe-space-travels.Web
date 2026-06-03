function resolveLink(link: string, parent?: string): string
{
    if (!parent) return resolveUp(link);
    if (parent.includes("#")) parent = parent.splitFirst("#")[0];

    if (link.startsWith("/")) return resolveUp(link);

    if (!parent.endsWith("/"))
    {
        if (parent.includes("/"))
            parent = parent.splitLast("/")[0] + "/";
        else
            parent = "";
    }

    let ret = parent + link;
    return resolveUp(ret);
}

function resolveUp(link: string): string
{
    while (link.includes("//")) link = link.replace("//", "/");
    const rooted = link.startsWith("/");
    const directory = link.endsWith("/");
    const parts = link.trimChar("/").split("/");

    let ret = "";
    for (let i = 0; i < parts.length; ++i)
        if (parts[i] == "..")
        {
            if (i == 0) throw new Error("Malformed link: '" + link + "'!");

            parts.removeAt(i);
            parts.removeAt(i - 1);
            i -= 2;
        }
    ret = parts.join("/");

    if (rooted) ret = "/" + ret;
    if (directory) ret = ret + "/";

    return ret.toString();
}