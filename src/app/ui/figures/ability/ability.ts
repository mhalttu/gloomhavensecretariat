import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from "@angular/core";
import { Subscription } from "rxjs";
import { InteractiveAction } from "src/app/game/businesslogic/ActionsManager";
import { GameManager, gameManager } from "src/app/game/businesslogic/GameManager";
import { SettingsManager, settingsManager } from "src/app/game/businesslogic/SettingsManager";
import { Character } from "src/app/game/model/Character";
import { Monster } from "src/app/game/model/Monster";
import { Ability } from "src/app/game/model/data/Ability";
import { ActionValueType } from "src/app/game/model/data/Action";
import { applyPlaceholder } from "../../helper/label";


@Component({
  selector: 'ghs-ability',
  templateUrl: './ability.html',
  styleUrls: ['./ability.scss']
})
export class AbilityComponent implements OnInit, OnDestroy, OnChanges {

  @Input() ability: Ability | undefined;
  @Input() abilities!: Ability[];
  @Input() monster: Monster | undefined;
  @Input() character: Character | undefined;
  @Input() flipped: boolean = false;
  @Input() reveal: boolean = false;
  @Input() relative: boolean = false;
  @Input() interactiveAbilities: boolean = false;
  @Input() statsCalculation: boolean = true;

  gameManager: GameManager = gameManager;
  settingsManager: SettingsManager = settingsManager;
  ActionValueType = ActionValueType;

  abilityIndex: number = -1;
  abilityLabel: string = "";

  interactiveActions: InteractiveAction[] = [];
  interactiveActionsChange = new EventEmitter<InteractiveAction[]>();
  interactiveBottomActions: InteractiveAction[] = [];
  interactiveBottomActionsChange = new EventEmitter<InteractiveAction[]>();

  fontsize: string = "";

  constructor(public elementRef: ElementRef) { }

  ngOnInit() {
    this.update();
    this.uiChangeSubscription = gameManager.uiChange.subscribe({
      next: () => {
        this.update();
      }
    });
  }

  uiChangeSubscription: Subscription | undefined;

  ngOnDestroy(): void {
    if (this.uiChangeSubscription) {
      this.uiChangeSubscription.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.update();
  }

  update() {
    this.fontsize = (this.elementRef.nativeElement.offsetWidth * 0.04) + 'px'
    this.abilityIndex = -1;
    this.abilityLabel = "";
    if (this.ability) {
      this.abilityIndex = this.getAbilityIndex(this.ability);
      this.abilityLabel = this.getAbilityLabel(this.ability);
    }
  }

  getAbilityIndex(ability: Ability): number {
    if (this.abilities && this.abilities.length > 0) {
      return this.abilities.indexOf(ability);
    } else if (this.monster) {
      return gameManager.abilities(this.monster).indexOf(ability);
    }
    return -1;
  }

  getAbilityLabel(ability: Ability): string {
    let label = ability.name || "";

    if (label) {
      label = 'data.ability.' + label;
    } else if (this.monster && this.monster.deck && this.monster.deck != this.monster.name) {
      label = 'data.deck.' + this.monster.deck;
      if (label.split('.')[label.split('.').length - 1] === applyPlaceholder(settingsManager.getLabel(label)) && this.monster.deck) {
        label = 'data.monster.' + this.monster.deck;
      }
    } else if (this.monster) {
      label = 'data.monster.' + this.monster.name;
    }

    return applyPlaceholder(settingsManager.getLabel(label));
  }

  onChange(revealed: boolean) {
    if (this.ability) {
      this.ability.revealed = revealed;
    }
  }

  onInteractiveActionsChange(change: InteractiveAction[]) {
    if (this.interactiveAbilities) {
      this.interactiveActionsChange.emit(change);
      this.interactiveActions = change;
    }
  }

  onInteractiveBottomActionsChange(change: InteractiveAction[]) {
    if (this.interactiveAbilities) {
      this.interactiveBottomActionsChange.emit(change);
      this.interactiveBottomActions = change;
    }
  }

}