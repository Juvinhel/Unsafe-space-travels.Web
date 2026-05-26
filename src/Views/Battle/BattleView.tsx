namespace Views.Battle
{
    export class BattleView extends UI.Elements.CustomElement
    {
        constructor (player: Game.Battle.Combatant, enemy: Game.Battle.Combatant)
        {
            super();

            this.player = player;
            this.enemy = enemy;

            this.shadowRoot.appendChild(this.build());

            this.root = this.shadowRoot.getElementById("battle-view-root") as HTMLDivElement;
            this.actionList = this.shadowRoot.getElementById("battle-view-actions-list") as HTMLDivElement;
            this.turnCounter = this.shadowRoot.getElementById("battle-view-turn-counter") as HTMLSpanElement;
            this.flow = this.shadowRoot.getElementById("battle-view-flow") as HTMLDivElement;
            this.flowList = this.shadowRoot.getElementById("battle-view-flow-list") as HTMLDivElement;
            this.showPlayerSkillsButton = this.shadowRoot.getElementById("battle-view-show-player-skills") as HTMLIconButton;
            this.showPlayerItemsButton = this.shadowRoot.getElementById("battle-view-show-player-items") as HTMLIconButton;

            this.playerStats = this.shadowRoot.getElementById("battle-view-player") as HTMLDivElement;
            this.playerActionPointsCounter = this.playerStats.querySelector(".action-points-counter") as Controls.CounterBar;
            this.playerHealthBar = this.playerStats.querySelector(".health-bar") as Controls.StatBar;
            this.playerArousalBar = this.playerStats.querySelector(".arousal-bar") as Controls.StatBar;
            this.playerEnergyBar = this.playerStats.querySelector(".energy-bar") as Controls.StatBar;

            this.enemyStats = this.shadowRoot.getElementById("battle-view-enemy") as HTMLDivElement;
            this.enemyActionPointsCounter = this.enemyStats.querySelector(".action-points-counter") as Controls.CounterBar;
            this.enemyHealthBar = this.enemyStats.querySelector(".health-bar") as Controls.StatBar;
            this.enemyArousalBar = this.enemyStats.querySelector(".arousal-bar") as Controls.StatBar;
            this.enemyEnergyBar = this.enemyStats.querySelector(".energy-bar") as Controls.StatBar;
        }

        private root: HTMLDivElement;
        private actionList: HTMLDivElement;
        private turnCounter: HTMLSpanElement;
        private flow: HTMLDivElement;
        private flowList: HTMLDivElement;
        private showPlayerSkillsButton: HTMLIconButton;
        private showPlayerItemsButton: HTMLIconButton;

        private playerStats: HTMLDivElement;
        private playerActionPointsCounter: Controls.CounterBar;
        private playerHealthBar: Controls.StatBar;
        private playerArousalBar: Controls.StatBar;
        private playerEnergyBar: Controls.StatBar;

        private enemyStats: HTMLDivElement;
        private enemyActionPointsCounter: Controls.CounterBar;
        private enemyHealthBar: Controls.StatBar;
        private enemyArousalBar: Controls.StatBar;
        private enemyEnergyBar: Controls.StatBar;

        public player: Game.Battle.Combatant;
        public enemy: Game.Battle.Combatant;
        public turn: number = 0;
        public result: Game.Battle.Result = null;

        private storedPlayer: Game.Battle.Combatant;
        private storedEnemy: Game.Battle.Combatant;

        private build()
        {
            return (<div id="battle-view-root">
                <h1 id="battle-view-title">BATTLE <span id="battle-view-turn-counter"></span></h1>
                <div id="battle-view-player">
                    <h2 id="battle-view-player-name">{ this.player.name }</h2>

                    <counter-bar class="action-points-counter" tooltip="Action Points" src="img/icons/battle/action.svg" />

                    <label>
                        <span class="health-label" tooltip="Health"><img src="/img/icons/battle/health.svg" /></span>
                        <span class="shield-label" tooltip="Shield"><img src="/img/icons/battle/shield.svg" /></span>
                    </label>
                    <stat-bar class="health-bar" />

                    <label>
                        <span class="arousal-label" tooltip="Arousal"><img src="/img/icons/battle/arousal.svg" /></span>
                        <span class="sensitivity-label" tooltip="Sensitivity"><img src="/img/icons/battle/sensitivity.svg" /></span>
                    </label>
                    <stat-bar class="arousal-bar" />

                    <label class="energy-bar-label" tooltip="Energy"><img src="/img/icons/battle/energy.svg" /></label>
                    <stat-bar class="energy-bar" />
                </div>
                <div id="battle-view-enemy">
                    <h2 id="battle-view-player-name">{ this.enemy.name }</h2>

                    <counter-bar class="action-points-counter" tooltip="Action Points" src="img/icons/battle/action.svg" />

                    <label>
                        <span class="health-label" tooltip="Health"><img src="/img/icons/battle/health.svg" /></span>
                        <span class="shield-label" tooltip="Shield"><img src="/img/icons/battle/shield.svg" /></span>
                    </label>
                    <stat-bar class="health-bar" />

                    <label>
                        <span class="arousal-label" tooltip="Arousal"><img src="/img/icons/battle/arousal.svg" /></span>
                        <span class="sensitivity-label" tooltip="Sensitivity"><img src="/img/icons/battle/sensitivity.svg" /></span>
                    </label>
                    <stat-bar class="arousal-bar" />

                    <label class="energy-label" tooltip="Energy"><img src="/img/icons/battle/energy.svg" /></label>
                    <stat-bar class="energy-bar" />
                </div>
                <div id="battle-view-flow">
                    <h3 id="battle-view-flow-player-heading">Player</h3>
                    <h3 id="battle-view-flow-enemy-heading">Enemy</h3>
                    <div id="battle-view-flow-list" />
                </div>
                <div id="battle-view-actions">
                    <div id="battle-view-actions-base">
                        <icon-button id="battle-view-show-player-skills" text="Skills" icon="img/icons/skills.svg" onclick={ () => this.showPlayerSkills() } />
                        <icon-button id="battle-view-show-player-items" text="Items" icon="img/icons/backpack.svg" onclick={ () => this.showPlayerItems() } />
                        <icon-button text="Reset" icon="img/icons/reset.svg" onclick={ () => this.resetPlayerTurn() } />
                        <icon-button text="Execute" icon="img/icons/execute.svg" onclick={ () => this.endTurn() } />
                    </div>
                    <div id="battle-view-actions-list" />
                </div>
            </div>);
        }

        connectedCallback()
        {
            this.beginTurn();
        }

        private calcBattleState(combatant: Game.Battle.Combatant): Game.Battle.State
        {
            const ret = { turn: this.turn } as Game.Battle.State;
            if (combatant == this.player)
            {
                ret.self = this.player;
                ret.opponent = this.enemy;
                ret.selfActions = [...this.flowList.querySelectorAll(".player-action")].map(a => a["action"] as Game.Battle.Action);
                ret.opponentActions = [...this.flowList.querySelectorAll(".enemy-action")].map(a => a["action"] as Game.Battle.Action);
            }
            else 
            {
                ret.self = this.enemy;
                ret.opponent = this.player;
                ret.selfActions = [...this.flowList.querySelectorAll(".enemy-action")].map(a => a["action"] as Game.Battle.Action);
                ret.opponentActions = [...this.flowList.querySelectorAll(".player-action")].map(a => a["action"] as Game.Battle.Action);
            }

            return ret;
        }

        private showPlayerSkills()
        {
            this.showPlayerSkillsButton.classList.toggle("checked", true);
            this.showPlayerItemsButton.classList.toggle("checked", false);
            this.actionList.clearChildren();

            for (let skill of this.player.skills)
            {
                const button = document.createElement("action-button") as Controls.ActionButton;
                button.text = skill.name;
                button.icon = skill.icon;
                button.actionCost = skill.actionCost;
                button.energyCost = skill.energyCost;
                button["skill"] = skill;
                if (this.isSkillAvailable(this.player, skill))
                    button.addEventListener("click", () => this.useSkill(skill));
                else
                    button.classList.add("disabled");
                this.actionList.appendChild(button);
            }
        }

        private isSkillAvailable(combatant: Game.Battle.Combatant, skill: Game.Battle.Skill): boolean
        {
            if (skill.actionCost != Number.POSITIVE_INFINITY && skill.actionCost > combatant.stats.actionCount) return false;
            if (skill.energyCost != Number.POSITIVE_INFINITY && skill.energyCost > combatant.stats.energy) return false;
            if (skill.cooldownCost > 0 && skill.cooldown > 0) return false;
            if (skill.available && !skill.available(this.calcBattleState(combatant))) return false;
            return true;
        }

        private showPlayerItems()
        {
            this.showPlayerSkillsButton.classList.toggle("checked", false);
            this.showPlayerItemsButton.classList.toggle("checked", true);
            this.actionList.clearChildren();

            for (let item of this.player.items)
            {
                const button = document.createElement("action-button") as Controls.ActionButton;
                button.text = item.name;
                button.icon = item.icon;
                button.actionCost = item.actionCost;
                button.quantityCost = item.quantity;
                button["item"] = item;
                if (this.isItemAvailable(this.player, item))
                    button.addEventListener("click", () => this.useItem(item));
                else
                    button.classList.add("disabled");
                this.actionList.appendChild(button);
            }
        }

        private isItemAvailable(combatant: Game.Battle.Combatant, item: Game.Inventory.Consumable): boolean
        {
            if (item.actionCost != Number.POSITIVE_INFINITY && item.actionCost > combatant.stats.actionCount) return false;
            if (item.quantity <= 0) return false;
            if (item.available && !item.available(this.calcBattleState(combatant))) return false;
            return true;
        }

        private refreshPlayerStats()
        {
            this.playerActionPointsCounter.max = this.player.stats.maxActionCount;;
            this.playerActionPointsCounter.value = this.player.stats.actionCount;

            this.playerHealthBar.max = this.player.stats.maxHealth;
            this.playerHealthBar.value = this.player.stats.health;
            this.playerHealthBar.backgroundMax = this.player.stats.maxShield;
            this.playerHealthBar.backgroundValue = this.player.stats.shield;

            this.playerArousalBar.max = this.player.stats.maxArousal;
            this.playerArousalBar.value = this.player.stats.arousal;
            this.playerArousalBar.backgroundMax = this.player.stats.maxSensitivity;
            this.playerArousalBar.backgroundValue = this.player.stats.sensitivity;

            this.playerEnergyBar.max = this.player.stats.maxEnergy;
            this.playerEnergyBar.value = this.player.stats.energy;
        }

        private refreshEnemyStats()
        {
            this.enemyActionPointsCounter.max = this.enemy.stats.maxActionCount;
            this.enemyActionPointsCounter.value = this.enemy.stats.actionCount;

            this.enemyHealthBar.max = this.enemy.stats.maxHealth;
            this.enemyHealthBar.value = this.enemy.stats.health;
            this.enemyHealthBar.backgroundMax = this.enemy.stats.maxShield;
            this.enemyHealthBar.backgroundValue = this.enemy.stats.shield;

            this.enemyArousalBar.max = this.enemy.stats.maxArousal;
            this.enemyArousalBar.value = this.enemy.stats.arousal;
            this.enemyArousalBar.backgroundMax = this.enemy.stats.maxSensitivity;
            this.enemyArousalBar.backgroundValue = this.enemy.stats.sensitivity;

            this.enemyEnergyBar.max = this.enemy.stats.maxEnergy;
            this.enemyEnergyBar.value = this.enemy.stats.energy;
        }

        private useSkill(skill: Game.Battle.Skill)
        {
            if (!this.isSkillAvailable(this.player, skill)) return;

            if (skill.actionCost)
                this.player.stats.actionCount -= skill.actionCost == Number.POSITIVE_INFINITY ? this.player.stats.actionCount : skill.actionCost;
            if (skill.actionCost)
                this.player.stats.energy -= skill.energyCost == Number.POSITIVE_INFINITY ? this.player.stats.energy : skill.energyCost;
            if (skill.cooldownCost)
                skill.cooldown += skill.cooldownCost;

            const activationText = <action-line class="player-action" action={ skill } name={ skill.name } icon={ skill.icon } actionCost={ skill.actionCost }>{ skill.activationText(this.calcBattleState(this.player)) }</action-line>;
            this.flowList.appendChild(activationText);

            this.refreshPlayerStats();
            this.showPlayerSkills();
        }

        private useItem(item: Game.Inventory.Consumable)
        {
            if (!this.isItemAvailable(this.player, item)) return;

            if (item.actionCost)
                this.player.stats.actionCount -= item.actionCost == Number.POSITIVE_INFINITY ? this.player.stats.actionCount : item.actionCost;
            if (item.actionCost)
                this.player.stats.energy -= item.energyCost == Number.POSITIVE_INFINITY ? this.player.stats.energy : item.energyCost;
            if (item.cooldownCost)
                item.cooldown += item.cooldownCost;
            item.quantity -= 1;

            const activationText = <action-line class="player-action" action={ item } name={ item.name } icon={ item.icon } actionCost={ item.actionCost }>{ item.activationText(this.calcBattleState(this.player)) }</action-line>;
            this.flowList.appendChild(activationText);

            this.refreshPlayerStats();
            this.showPlayerItems();
        }

        private resetFlow(side: "player" | "enemy" | "both" = "both")
        {
            switch (side)
            {
                case "player":
                    {
                        let child;
                        while (child = this.flowList.querySelector(".player-action")) child.remove();
                        break;
                    }
                case "enemy":
                    {
                        let child;
                        while (child = this.flowList.querySelector(".enemy-action")) child.remove();
                        break;
                    }
                case "both":
                    this.flowList.clearChildren();
                    break;
            }
        }

        private beginTurn()
        {
            this.turn++;
            this.turnCounter.textContent = "Turn " + this.turn.toFixed();

            this.storedPlayer = Object.clone(this.player, true);
            this.storedEnemy = Object.clone(this.enemy, true);

            this.resetFlow();
            this.refreshPlayerStats();
            this.showPlayerSkills();
            this.setEnemyTurn();
        }

        private setEnemyTurn()
        {
            let availableSkills: Game.Battle.Skill[];
            while ((availableSkills = this.enemy.skills.filter(skill => this.isSkillAvailable(this.enemy, skill))).length > 0)
            {
                const skill = Rand.Pick(availableSkills);
                this.enemy.stats.actionCount -= skill.actionCost == Number.POSITIVE_INFINITY ? this.enemy.stats.actionCount : skill.actionCost;
                this.enemy.stats.energy -= skill.energyCost == Number.POSITIVE_INFINITY ? this.enemy.stats.energy : skill.energyCost;

                const activationText = <action-line class="enemy-action" action={ skill } name={ skill.name } icon={ skill.icon } actionCost={ skill.actionCost }>{ skill.activationText(this.calcBattleState(this.enemy)) }</action-line>;
                this.flowList.appendChild(activationText);
            }
            this.refreshEnemyStats();
        }

        private resetPlayerTurn()
        {
            this.player = Object.clone(this.storedPlayer, true);

            this.resetFlow("player");
            this.refreshPlayerStats();
            this.showPlayerSkills();
        }

        private async endTurn()
        {
            this.style.pointerEvents = "none";

            const actionLines = this.getActionsInOrder();
            for (const actionLine of actionLines)
            {
                actionLine.scrollIntoView({ behavior: "instant", block: "center" });
                const combatant = actionLine.classList.contains("player-action") ? this.player : this.enemy;

                const action = actionLine.action;
                const state = this.calcBattleState(combatant);
                action.execute(state);

                actionLine.style.opacity = "0";
                if (this.checkResult()) return;
                this.refreshPlayerStats();
                this.refreshEnemyStats();

                await delay(250);
            }

            await delay(250);

            this.player.stats.actionCount = this.player.stats.maxActionCount;
            this.enemy.stats.actionCount = this.enemy.stats.maxActionCount;
            for (const action of [...this.player.skills, ...this.player.items, ...this.enemy.skills, ...this.enemy.items])
                if (action.cooldown > 0)
                    action.cooldown -= 1;

            this.beginTurn();

            this.style.pointerEvents = "";
        }

        private getActionsInOrder(): ActionLine[]
        {
            const playerActions = [...this.flowList.querySelectorAll(".player-action") as NodeListOf<ActionLine>];
            const enemyActions = [...this.flowList.querySelectorAll(".enemy-action") as NodeListOf<ActionLine>];

            const actionLines: ActionLine[] = [];
            while (playerActions.length > 0 || enemyActions.length > 0)
            {
                actionLines.push(playerActions.shift());
                actionLines.push(enemyActions.shift());
            }

            return actionLines.filter(l => l);
        }

        private checkResult(): boolean
        {
            if (this.enemy.escaped) this.result = "win-escape";
            if (this.enemy.stats.health <= 0) this.result = "win-damage";
            if (this.enemy.stats.arousal >= this.enemy.stats.maxArousal) this.result = "win-arousal";
            if (this.player.escaped) this.result = "loose-escape";
            if (this.player.stats.health <= 0) this.result = "loose-damage";
            if (this.player.stats.arousal >= this.player.stats.maxArousal) this.result = "loose-arousal";
            if (this.result) { this.showEndScreen(); return true; }
            return false;
        }

        private showEndScreen()
        {
            this.root.appendChild(ResultScreen(this));
        }
    }
}
customElements.define("battle-view", Views.Battle.BattleView);