import {
  effect,
  exhaustMapWithTrailing,
  fromPromise,
  type LiveData,
} from '@toeverything/infra';
import { groupBy, mergeMap } from 'rxjs';

import type { GuardStore } from '../stores/guard';

type Action = 'workspace.users.read';

export class GuardService {
  constructor(private readonly guardStore: GuardStore) {}

  can$(action: Action): LiveData<boolean> {}

  revalidatePermission = effect(
    groupBy((action: Action) => action),
    mergeMap(action$ =>
      action$.pipe(
        exhaustMapWithTrailing(action =>
          fromPromise(() => this.guardStore.getWorkspacePermissions()).pipe()
        )
      )
    )
  );
}
