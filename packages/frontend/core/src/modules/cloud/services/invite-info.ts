import type { GetInviteInfoQuery } from '@affine/graphql';
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
import { EMPTY, map, mergeMap, switchMap } from 'rxjs';

import { isBackendError, isNetworkError } from '../error';
import type { InviteInfoStore } from '../stores/invite-info';

export type InviteInfo = GetInviteInfoQuery['getInviteInfo'];

export class InviteInfoService extends Service {
  constructor(private readonly store: InviteInfoStore) {
    super();
  }
  inviteId$ = new LiveData<string | undefined>(undefined);
  inviteInfo$ = new LiveData<InviteInfo | undefined>(undefined);
  loading$ = new LiveData(false);
  error$ = new LiveData<any>(null);

  readonly revalidate = effect(
    map(() => this.inviteId$.value),
    switchMap(inviteId => {
      if (!inviteId) {
        return EMPTY;
      }
      return fromPromise(async signal => {
        return this.store.getInviteInfo(inviteId, signal);
      }).pipe(
        mergeMap(data => {
          this.inviteInfo$.next(data);
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
          this.error$.setValue(null);
          this.inviteInfo$.setValue(undefined);
          this.loading$.setValue(true);
        }),
        onComplete(() => {
          this.loading$.setValue(false);
        })
      );
    })
  );

  setInviteId(inviteId: string) {
    this.inviteId$.setValue(inviteId);
  }

  override dispose(): void {
    this.revalidate.unsubscribe();
  }
}
