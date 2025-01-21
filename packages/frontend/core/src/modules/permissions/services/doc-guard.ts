import { LiveData, Service } from '@toeverything/infra';

import type { DocGuardStore } from '../stores/doc-guard';

export class DocGuardService extends Service {
  constructor(private readonly docGuardStore: DocGuardStore) {
    super();
  }

  can$(docId: string, permission: string): LiveData<boolean> {
    return new LiveData(false);
  }
}
