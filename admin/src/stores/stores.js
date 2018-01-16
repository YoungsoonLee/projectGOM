import { store } from "rfx-core";
//import { RouterStore } from 'mobx-react-router';

import AppState from "./AppState";
//import BillingState from "./BillingState";
import NewsState from './NewsState';

export default store.setup({
	appState: AppState,
	//billingState: BillingState,
	newsState: NewsState
	//routerStore: RouterStore
});
