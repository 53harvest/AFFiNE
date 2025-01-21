import { Store } from '@toeverything/infra';

export type WorkspacePermissions = string;

export class GuardStore extends Store {
  constructor() {
    super();
  }

  watchWorkspacePermissionsCache() {}

  async getWorkspacePermissions(): Promise<Record<string, boolean>> {
    return {
      'workspace.user.read': true,
    };
  }

  async getWorkspacePermission(permission: string): Promise<boolean> {
    return true;
  }
}
