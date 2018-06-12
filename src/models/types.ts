import { EffectsCommandMap, Model, SubscriptionAPI } from "dva";
import { Action } from "redux";

interface IDvaAction extends Action {
  payload: any;
}

export { IDvaAction, EffectsCommandMap, Model, SubscriptionAPI };
