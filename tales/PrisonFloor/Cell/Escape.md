You did it. The door is open. Now you should decide on your escape strategy.
There is a table right in the corner of the cell block with different things on it.
Looks like these are items the guards took from the prisoners.

{{ questManager.find("Escape the Cell").completed = true }}

{{? !questManager.find("Find Communication Console") }}
[Get communication working and call the authorities](> #communication)
{{?}}
{{? !questManager.find("Find Escape Ship") }}
[Find a ship or escape pod](> #ship)
{{?}}

[Close](Close)

::: communication :::
Hopefully the alien technology is somehow understandable and can send a standardized signal to the nearest human colony.
{{ questManager.add({ link: "/tales/Quests/Communication.md", title: "Communication", subQuests: [
    { link: "/tales/Quests/LearnAlienLanguage.md", title: "Learn alien language" },
    { link: "/tales/Quests/FindCommunicationConsole.md", title: "Find communication console" }
] }) }}

::: ship :::
You never flew a spaceship much less a alien one. Plus you don't know the direction to fly.
{{ questManager.add({ link: "/tales/Quests/FindEscapeShip.md", title: "Find Escape Ship"}) }}
