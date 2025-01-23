import {
  backoffRetry,
  fromPromise,
  LiveData,
  onComplete,
  onStart,
  Service,
} from '@toeverything/infra';
import { debounceTime, map, switchMap, tap } from 'rxjs';

import { isBackendError, isNetworkError } from '../../cloud';
import type { WorkspaceService } from '../../workspace';
import type { MemberSearchStore } from '../stores/member-search';

export class MemberSearchService extends Service {
  constructor(
    private readonly store: MemberSearchStore,
    private readonly workspaceService: WorkspaceService
  ) {
    super();
  }

  readonly searchText$ = new LiveData<string | null>(null);
  readonly isSearching$ = new LiveData(false);
  error$ = new LiveData<any>(null);

  readonly result$ = LiveData.from(
    this.searchText$.pipe(
      tap(() => {
        this.isSearching$.next(true);
      }),
      debounceTime(500),
      // distinctUntilChanged(),
      switchMap(searchText => {
        if (!searchText) {
          return [];
        } else {
          return fromPromise(async signal => {
            const res = await this.store.getMembersByEmailOrName(
              this.workspaceService.workspace.id,
              searchText,
              undefined,
              undefined,
              signal
            );
            console.log('API Response:', res);

            return res.members;
          }).pipe(
            backoffRetry({
              when: isNetworkError,
              count: Infinity,
            }),
            backoffRetry({
              when: isBackendError,
            }),
            map(res => res),
            onStart(() => {
              this.isSearching$.next(true);
            }),
            onComplete(() => {
              this.isSearching$.next(false);
            })
          );
        }
      })
    ),
    null
  );

  search(searchText?: string) {
    if (searchText !== undefined) {
      this.searchText$.next(searchText);
    }
  }

  clear() {
    this.searchText$.next(null);
  }
}
