import {
  effect,
  exhaustMapWithTrailing,
  fromPromise,
  LiveData,
  Service,
} from '@toeverything/infra';
import { groupBy, mergeMap } from 'rxjs';

import type { GuardStore } from '../stores/guard';

export class GuardService extends Service {
  constructor(private readonly guardStore: GuardStore) {
    super();
  }

  can$(action: string): LiveData<boolean> {
    return new LiveData(false);
  }

  // revalidatePermission = effect(
  //   groupBy((action: string) => action),
  //   mergeMap(action$ =>
  //     action$.pipe(
  //       exhaustMapWithTrailing(action =>
  //         fromPromise(() => this.guardStore.getWorkspacePermissions()).pipe()
  //       )
  //     )
  //   )
  // );
}
