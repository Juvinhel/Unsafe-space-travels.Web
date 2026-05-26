{{> Processing.md }}
You open the large cabinet. There some primitive cleaning tools and a small box in it.

--- footer ---
{{ console.log("this", this) }}
{{? !this.ampoules }}
[Open the box](> #ampoules)({{$ this.ampoules = true; }})
{{?}}
--- footer ---
::: ampoules :::
{{ backpackManager.add("UnknownAmpoules"); }}
==Received 3 unlabeled ampoules==