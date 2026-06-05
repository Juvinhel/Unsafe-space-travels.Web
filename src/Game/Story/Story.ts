namespace Game.Story
{
    export const knownTales: { [type: string]: Tale; } = {};

    function init()
    {
        templateEngine.getTemplate = compile;
        templateEngine.getContext = (link: string) =>
        {
            link = link.splitFirst("#")[0].trimChar("/");
            if (link.endsWith(".md")) link = link.substrEnd(".md".length);

            return Game.data.story[link] ?? (Game.data.story[link] = {});
        };
        templateEngine.getDefaultArgs = (link: string) => ({ link, data, World, questManager, backpackManager: Game.Inventory.backpackManager, });
    }

    const templateCompiler = new Durian.Template.Compiler({ contain: "guid" });
    const templateEngine = new Durian.Template.Engine();
    const markdownRenderer = new Durian.Markdown.Renderer();

    async function get(url: string): Promise<Tale>
    {
        let [link, hash] = url.splitFirst("#");

        hash = hash?.trimChar("/");
        const tale = knownTales[link];
        return { link: url, text: tale.text };
    }

    async function compile(tale: Tale | string): Promise<Durian.Template.Template>
    {
        if (typeof tale === "string") tale = await get(tale);
        const chapters = Durian.Template.parseChapters(tale.text);

        let [link, hash] = tale.link.splitFirst("#");
        let code = null;
        hash ??= "main";
        hash = hash.toLowerCase();
        for (const [key, value] of Object.entries(chapters))
            if (hash == key.toLowerCase())
            {
                code = value;
                break;
            }
        if (code == null) throw new Error("Cannot find chapter: '" + hash + "'!");

        const template = templateCompiler.build(code, link);
        return template;
    }

    export async function render(tale: Tale | string, args?: Durian.Template.Arguments, params?: Durian.Template.Parameters): Promise<Element>
    {
        const template = await compile(tale);

        const hooks = new Durian.Markdown.Hooks();
        const result = await templateEngine.execute(template, { hooks, ...args }, params);
        const article = markdownRenderer.render(result.text, result.context, hooks);

        await Views.RefreshNav();
        await Views.RefreshInfo();

        article.classList.add("story");
        for (const a of article.getElementsByTagName("a"))
        {
            const inline = a.classList.contains("inline");
            const onclick = template.contained[a.getAttribute("onclick")];
            a.removeAttribute("onclick");
            const href = a.getAttribute("href")?.trim();
            a.removeAttribute("href");

            if (href?.toLowerCase() == "close")
            {   //TODO: better only in show?
                a.onclick = () => Views.Story.CloseStoryDialog();
            }
            else
            {
                const url = href ? resolveLink(href, template.link) : null;
                const func: AsyncFunction = onclick ? new AsyncFunction("event", "data", "world", "questManager", "backpackManager", onclick) : null;
                a.onclick = async (e: Event) =>
                {
                    if (func) if ((await func.call(result.context, e, data, World, questManager, Game.Inventory.backpackManager)) == false) return;
                    if (url)
                    {
                        if (inline) await showInline(e.currentTarget as HTMLAnchorElement, url);
                        else await show(url);
                    }
                };
            }
        }

        for (const element of article.querySelectorAll("*"))
        {
            for (const attribute in element.attributes)
            {
                if (!attribute.startsWith("on")) continue;

                const value = element.getAttribute(attribute);
                const code = template.contained[value];
                if (code)
                {
                    element.removeAttribute(attribute);
                    const func: AsyncFunction = new AsyncFunction("event", code);
                    element[attribute] = (e: Event) => func.call(result.context, e, Game.data);
                }
            }
        }

        return article;
    }

    export async function showInline(predecessor: Element, tale: Tale | string, args?: Durian.Template.Arguments, params?: Durian.Template.Parameters): Promise<void>
    {
        const article = await render(tale, args, params);

        const header = article.querySelector(":scope > .header");
        const content = article.querySelector(":scope > .content");
        const footer = article.querySelector(":scope > .footer");

        const parent = predecessor.closest("article");
        const parentHeader = parent.querySelector(":scope > .header");
        const parentFooter = parent.querySelector(":scope > .footer");

        parentHeader.append(...(header?.childNodes ?? []));
        parentFooter.prepend(...(footer?.childNodes ?? []));
        predecessor.after(...(content.childNodes ?? []));
        predecessor.remove();
    }

    export async function show(tale: Tale | string, title: string = null, allowClose: boolean | null = false): Promise<void>
    {
        if (typeof tale === "string") tale = await get(tale);
        const article = await render(tale);

        title = article.querySelector("title")?.innerText ?? title ?? "";
        Views.Story.ShowStoryDialog(article, title, allowClose);
    }

    export async function showAmbient(...tales: (Tale | string)[])
    {
        for (let i = 0; i < tales.length; ++i)
            if (typeof tales[i] === "string")
                tales[i] = await get(tales[i] as string);

        const articles: Element[] = [];
        for (const tale of tales)
        {
            const article = await render(tale);
            articles.push(article);
        }

        const center = document.getElementById("center");
        center.clearChildren();
        center.append(...articles);
    }

    init();
}