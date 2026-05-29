namespace Game
{
    export const storyManager = new class StoryManager
    {
        constructor ()
        {
            this.templateEngine.getTemplate = this.get.bind(this);
            this.templateEngine.getContext = (link: string) =>
            {
                link = link.splitFirst("#")[0].trimChar("/");
                if (link.endsWith(".md")) link = link.substrEnd(".md".length);

                return Game.data.story[link] ?? (Game.data.story[link] = {});
            };
            this.templateEngine.getDefaultArgs = (link: string) => ({ link, data, World, questManager, backpackManager: Game.Inventory.backpackManager, });
        }

        /* private */ templateCompiler = new Durian.Template.Compiler({ contain: "guid" });
        /* private */ templateEngine = new Durian.Template.Engine();
        /* private */ markdownRenderer = new Durian.Markdown.Renderer();

        public async get(url: string): Promise<Durian.Template.Template>
        {
            url = url.trimLeft("/");
            let [link, hash] = url.splitFirst("#");

            link = link.trimChar("/");
            hash = hash?.trimChar("/");
            const response = await fetch("story/" + (link.endsWith(".md") ? link : link + ".md"));
            const text = await response.text();
            const chapters = Durian.Template.parseChapters(text);

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

            const template = this.templateCompiler.build(code, url);
            return template;
        }

        public async render(link: string, args?: Durian.Template.Arguments, params?: Durian.Template.Parameters): Promise<Element>
        {
            const template = await this.get(link);

            const hooks = new Durian.Markdown.Hooks();
            const result = await this.templateEngine.execute(template, { hooks, ...args }, params);
            const article = this.markdownRenderer.render(result.text, result.context, hooks);

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

                const url = href ? Durian.Template.joinUrls(template.link, href) : null;
                const func: AsyncFunction = onclick ? new AsyncFunction("event", "data", "world", "questManager", "backpackManager", onclick) : null;
                a.onclick = async (e: Event) =>
                {
                    if (func) if ((await func.call(result.context, e, data, World, questManager, Game.Inventory.backpackManager)) == false) return;
                    if (url)
                    {
                        if (inline) await this.showInline(e.currentTarget as HTMLAnchorElement, url);
                        else await this.show(url);
                    }
                };
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

        public async showInline(predecessor: Element, link: string, args?: Durian.Template.Arguments, params?: Durian.Template.Parameters): Promise<void>
        {
            const article = await this.render(link, args, params);

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

        public async show(link: string, args?: Durian.Template.Arguments, params?: Durian.Template.Parameters): Promise<void>
        {
            const article = await this.render(link, args, params);

            const storyTitle = document.getElementById("story-title");
            const title = article.querySelector("title")?.innerText;
            storyTitle.textContent = title ?? "";

            const center = document.getElementById("center");
            center.clearChildren();
            center.append(article);
            Game.data.storyLink = link;
        }

        public async clear(): Promise<void>
        {
            await Views.RefreshNav();
            await Views.RefreshInfo();

            const storyTitle = document.getElementById("story-title");
            storyTitle.textContent = "";

            const center = document.getElementById("center");
            center.clearChildren();
            Game.data.storyLink = null;
        }
    }();
}