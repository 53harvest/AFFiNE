import { notify } from '@affine/component';
import {
  AcceptInvitePage,
  JoinFailedPage,
} from '@affine/component/member-components';
import { ErrorNames, UserFriendlyError } from '@affine/graphql';
import { useLiveData, useService } from '@toeverything/infra';
import { useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import {
  RouteLogic,
  useNavigateHelper,
} from '../../../components/hooks/use-navigate-helper';
import {
  AcceptInviteService,
  AuthService,
  InviteInfoService,
} from '../../../modules/cloud';

/**
 * /invite/:inviteId page
 *
 * only for web
 */
const AcceptInvite = () => {
  const { jumpToPage } = useNavigateHelper();
  const acceptInviteService = useService(AcceptInviteService);
  const inviteInfoService = useService(InviteInfoService);
  const inviteInfo = useLiveData(inviteInfoService.inviteInfo$);
  const error = useLiveData(acceptInviteService.error$);
  const success = useLiveData(acceptInviteService.success$);
  const navigateHelper = useNavigateHelper();

  const openWorkspace = useCallback(() => {
    if (!inviteInfo?.workspace.id) {
      return;
    }
    jumpToPage(inviteInfo.workspace.id, 'all', RouteLogic.REPLACE);
  }, [inviteInfo, jumpToPage]);

  useEffect(() => {
    acceptInviteService.revalidate();
  }, [acceptInviteService]);

  useEffect(() => {
    if (error) {
      const err = UserFriendlyError.fromAnyError(error);
      console.error(err);
      if (err.name === ErrorNames.ALREADY_IN_SPACE) {
        return navigateHelper.jumpToIndex();
      }
      notify.error({
        title: err.name,
        message: err.message,
      });
    }

    if (success === false) {
      return navigateHelper.jumpToExpired();
    }
  }, [error, navigateHelper, success]);

  if (success === undefined) {
    return null;
  }

  if (error) {
    return <JoinFailedPage inviteInfo={inviteInfo} />;
  }

  return (
    <AcceptInvitePage inviteInfo={inviteInfo} onOpenWorkspace={openWorkspace} />
  );
};

export const Component = () => {
  const authService = useService(AuthService);
  const isRevalidating = useLiveData(authService.session.isRevalidating$);
  const loginStatus = useLiveData(authService.session.status$);
  const params = useParams<{ inviteId: string }>();

  useEffect(() => {
    authService.session.revalidate();
  }, [authService]);

  const { jumpToSignIn } = useNavigateHelper();

  useEffect(() => {
    if (loginStatus === 'unauthenticated' && !isRevalidating) {
      // We can not pass function to navigate state, so we need to save it in atom
      jumpToSignIn(`/invite/${params.inviteId}`, RouteLogic.REPLACE);
    }
  }, [isRevalidating, jumpToSignIn, loginStatus, params.inviteId]);

  if (loginStatus === 'authenticated') {
    return <Middle />;
  }

  return null;
};

export const Middle = () => {
  const inviteInfoService = useService(InviteInfoService);
  const params = useParams<{ inviteId: string }>();
  const navigateHelper = useNavigateHelper();
  const inviteInfo = useLiveData(inviteInfoService.inviteInfo$);
  const inviteId = useLiveData(inviteInfoService.inviteId$);
  const error = useLiveData(inviteInfoService.error$);

  useEffect(() => {
    if (!params.inviteId) {
      navigateHelper.jumpToExpired();
      return;
    }
    if (inviteId !== params.inviteId) {
      inviteInfoService.setInviteId(params.inviteId);
    }
  }, [inviteId, inviteInfoService, navigateHelper, params.inviteId]);

  useEffect(() => {
    inviteInfoService.revalidate();
  }, [inviteInfoService]);

  useEffect(() => {
    if (error) {
      const err = UserFriendlyError.fromAnyError(error);
      console.error(err);
      notify.error({
        title: err.name,
        message: err.message,
      });
      navigateHelper.jumpToExpired();
    }
  }, [error, navigateHelper]);

  if (!inviteInfo) {
    return null;
  }

  return <AcceptInvite />;
};
