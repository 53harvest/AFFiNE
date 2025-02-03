import {
  backoffRetry,
  catchErrorInto,
  effect,
  fromPromise,
  LiveData,
  onComplete,
  onStart,
  Service,
} from '@toeverything/infra';
import { EMPTY, map, switchMap } from 'rxjs';

import { isBackendError, isNetworkError } from '../error';
import type { AcceptInviteStore } from '../stores/accept-invite';
import type { InviteInfoService } from './invite-info';

export class AcceptInviteService extends Service {
  constructor(
    private readonly store: AcceptInviteStore,
    private readonly inviteInfoService: InviteInfoService
  ) {
    super();
  }
  success$ = new LiveData<boolean | undefined>(undefined);
  loading$ = new LiveData(false);
  error$ = new LiveData<any>(null);

  readonly revalidate = effect(
    map(() => {
      return {
        inviteId: this.inviteInfoService.inviteId$.value,
        workspaceId: this.inviteInfoService.inviteInfo$.value?.workspace.id,
      };
    }),
    switchMap(({ inviteId, workspaceId }) => {
      if (!inviteId || !workspaceId) {
        return EMPTY;
      }
      return fromPromise(async signal => {
        return this.store.acceptInvite(workspaceId, inviteId, true, signal);
      }).pipe(
        switchMap(res => {
          this.success$.setValue(res);
          return EMPTY;
        }),
        backoffRetry({
          when: isNetworkError,
          count: Infinity,
        }),
        backoffRetry({
          when: isBackendError,
          count: 3,
        }),
        catchErrorInto(this.error$),
        onStart(() => {
          this.loading$.setValue(true);
          this.success$.setValue(undefined);
        }),
        onComplete(() => {
          this.loading$.setValue(false);
        })
      );
    })
  );

  override dispose(): void {
    this.revalidate.unsubscribe();
  }
}
