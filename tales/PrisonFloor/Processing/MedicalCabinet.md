You open the large cabinet. There some primitive cleaning tools and a small box in it.

--- footer ---
{{? !this.ampoules }}
[Open the box](> #ampoules)({{$ this.ampoules = true; }})
{{?}}
--- footer ---
::: ampoules :::
{{ backpackManager.add("Items.Quest.UnknownAmpoules"); }}
==Received 3 unlabeled ampoules==