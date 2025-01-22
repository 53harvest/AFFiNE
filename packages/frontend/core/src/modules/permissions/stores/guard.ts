import {
  getWorkspaceRulePermissionsQuery,
  type WorkspacePermissions,
} from '@affine/graphql';
import { Store } from '@toeverything/infra';

import type { GraphQLService } from '../../cloud';
import type { WorkspaceService } from '../../workspace';

export type WorkspacePermissionActions = keyof Omit<
  WorkspacePermissions,
  '__typename'
>;

export class GuardStore extends Store {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly graphqlService: GraphQLService
  ) {
    super();
  }

  watchWorkspacePermissionsCache() {}

  async getWorkspacePermissions(): Promise<
    Record<WorkspacePermissionActions, boolean>
  > {
    const data = await this.graphqlService.gql({
      query: getWorkspaceRulePermissionsQuery,
      variables: {
        id: this.workspaceService.workspace.id,
      },
    });
    return data.workspaceRolePermissions.permissions;
  }
}
