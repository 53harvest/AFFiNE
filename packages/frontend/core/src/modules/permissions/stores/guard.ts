export class GuardStore {
  constructor() {}

  watchWorkspacePermissionsCache() {}

  async getWorkspacePermissions(): Promise<Record<string, boolean>> {
    return {
      'workspace.user.read': true,
    };
  }
}
