export type { Member } from './entities/members';
export { GuardService } from './services/guard';
export { WorkspaceMembersService } from './services/members';
export { WorkspacePermissionService } from './services/permission';
export {
  type DocPermissionActions,
  type WorkspacePermissionActions,
} from './stores/guard';

import { type Framework } from '@toeverything/infra';

import { WorkspaceServerService } from '../cloud';
import {
  WorkspaceLocalState,
  WorkspaceScope,
  WorkspaceService,
  WorkspacesService,
} from '../workspace';
import { WorkspaceMembers } from './entities/members';
import { WorkspacePermission } from './entities/permission';
import { GuardService } from './services/guard';
import { WorkspaceMembersService } from './services/members';
import { WorkspacePermissionService } from './services/permission';
import { GuardStore } from './stores/guard';
import { WorkspaceMembersStore } from './stores/members';
import { WorkspacePermissionStore } from './stores/permission';

export function configurePermissionsModule(framework: Framework) {
  framework
    .scope(WorkspaceScope)
    .service(WorkspacePermissionService, [
      WorkspaceService,
      WorkspacesService,
      WorkspacePermissionStore,
    ])
    .store(WorkspacePermissionStore, [
      WorkspaceServerService,
      WorkspaceLocalState,
    ])
    .entity(WorkspacePermission, [WorkspaceService, WorkspacePermissionStore])
    .service(WorkspaceMembersService, [WorkspaceMembersStore, WorkspaceService])
    .store(WorkspaceMembersStore, [WorkspaceServerService])
    .entity(WorkspaceMembers, [WorkspaceMembersStore, WorkspaceService])
    .service(GuardService, [
      GuardStore,
      WorkspaceService,
      WorkspacePermissionService,
    ])
    .store(GuardStore, [WorkspaceService, WorkspaceServerService]);
}
