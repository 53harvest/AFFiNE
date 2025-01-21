import { Store } from '@toeverything/infra';

export class DocGuardStore extends Store {
  constructor() {
    super();
  }

  async checkPermission(_docId: string, _permission: string): Promise<boolean> {
    return true;
  }
}
