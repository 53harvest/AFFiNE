import {
  type AttachmentBlockModel,
  AttachmentBlockSchema,
  defaultAttachmentProps,
} from '@blocksuite/affine-model';
import {
  EMBED_CARD_HEIGHT,
  EMBED_CARD_WIDTH,
} from '@blocksuite/affine-shared/consts';
import {
  ActionPlacement,
  type ToolbarAction,
  type ToolbarActionGroup,
  type ToolbarModuleConfig,
} from '@blocksuite/affine-shared/services';
import { BlockSelection } from '@blocksuite/block-std';
import { Bound } from '@blocksuite/global/utils';
import {
  CaptionIcon,
  CopyIcon,
  DeleteIcon,
  DownloadIcon,
  DuplicateIcon,
  EditIcon,
  ResetIcon,
} from '@blocksuite/icons/lit';
import { computed } from '@preact/signals-core';
import { html, type TemplateResult } from 'lit';

import { AttachmentBlockComponent } from '../attachment-block';
import { RenameModal } from '../components/rename-model';
import { AttachmentEmbedProvider } from '../embed';
import { cloneAttachmentProperties } from '../utils';

export const builtinToolbarConfig = {
  actions: [
    {
      id: 'rename',
      content(cx) {
        const model = cx.getCurrentBlockComponentBy(
          BlockSelection,
          AttachmentBlockComponent
        )?.model;
        if (!model) return null;

        const panel: TemplateResult = RenameModal({
          model,
          editorHost: cx.host,
          abortController: new AbortController(),
        });

        return html`
          <editor-menu-button
            .contentPadding="${'8px'}"
            .button=${html`
              <editor-icon-button aria-label="Rename" .tooltip="${'Rename'}">
                ${EditIcon()}
              </editor-icon-button>
            `}
          >
            <div>${panel}</div>
          </editor-menu-button>
        `;
      },
    },
    {
      id: 'conversions',
      actions: [
        {
          id: 'card-view',
          label: 'Card view',
          run(cx) {
            const model = cx.getCurrentBlockModelBy(
              BlockSelection,
              AttachmentBlockSchema
            );
            if (!model) return;

            const style = defaultAttachmentProps.style!;
            const width = EMBED_CARD_WIDTH[style];
            const height = EMBED_CARD_HEIGHT[style];
            const bound = Bound.deserialize(model.xywh);
            bound.w = width;
            bound.h = height;

            cx.store.updateBlock(model, {
              style,
              embed: false,
              xywh: bound.serialize(),
            });
          },
        },
        {
          id: 'embed-view',
          label: 'Embed view',
          run(cx) {
            const model = cx.getCurrentBlockModelBy(
              BlockSelection,
              AttachmentBlockSchema
            );
            if (!model) return;

            cx.std
              .get(AttachmentEmbedProvider)
              .convertTo(model as AttachmentBlockModel);
          },
        },
      ],
      content(cx) {
        const model = cx.getCurrentBlockModelBy(
          BlockSelection,
          AttachmentBlockSchema
        );
        if (!model) return null;

        const actions = this.actions.map(action => ({ ...action }));

        return html`<affine-view-dropdown
          .actions=${actions}
          .context=${cx}
          .viewType$=${computed(() => {
            const [cardAction, embedAction] = actions;
            const embed = model.embed$.value ?? false;

            cardAction.disabled = !embed;
            embedAction.disabled =
              embed &&
              cx.std
                .get(AttachmentEmbedProvider)
                .embedded(model as AttachmentBlockModel);

            return embed ? embedAction.label : cardAction.label;
          })}
        ></affine-view-dropdown>`;
      },
    } satisfies ToolbarActionGroup<ToolbarAction>,
    {
      id: 'download',
      tooltip: 'Download',
      icon: DownloadIcon(),
      run(cx) {
        const component = cx.getCurrentBlockComponentBy(
          BlockSelection,
          AttachmentBlockComponent
        );
        component?.download();
      },
    },
    {
      id: 'caption',
      tooltip: 'Caption',
      icon: CaptionIcon(),
      run(cx) {
        const component = cx.getCurrentBlockComponentBy(
          BlockSelection,
          AttachmentBlockComponent
        );
        component?.captionEditor?.show();
      },
    },
    {
      id: 'clipboard',
      placement: ActionPlacement.More,
      actions: [
        {
          id: 'copy',
          label: 'Copy',
          icon: CopyIcon(),
          run(cx) {
            // TODO(@fundon): unify `clone` method
            const component = cx.getCurrentBlockComponentBy(
              BlockSelection,
              AttachmentBlockComponent
            );
            component?.copy();
          },
        },
        {
          id: 'duplicate',
          label: 'Duplicate',
          icon: DuplicateIcon(),
          run(cx) {
            const model = cx.getCurrentBlockComponentBy(
              BlockSelection,
              AttachmentBlockComponent
            )?.model;
            if (!model) return;

            // TODO(@fundon): unify `duplicate` method
            cx.store.addSiblingBlocks(model, [
              {
                flavour: model.flavour,
                ...cloneAttachmentProperties(model),
              },
            ]);
          },
        },
      ],
    },
    {
      id: 'refresh',
      placement: ActionPlacement.More,
      actions: [
        {
          id: 'reload',
          label: 'Reload',
          icon: ResetIcon(),
          run(cx) {
            const component = cx.getCurrentBlockComponentBy(
              BlockSelection,
              AttachmentBlockComponent
            );
            component?.refreshData();
          },
        },
      ],
    },
    {
      id: 'delete',
      placement: ActionPlacement.More,
      actions: [
        {
          id: 'delete',
          label: 'Delete',
          icon: DeleteIcon(),
          variant: 'destructive',
          run(cx) {
            const model = cx.getCurrentBlockModelBy(
              BlockSelection,
              AttachmentBlockSchema
            );
            if (!model) return;

            cx.store.deleteBlock(model);
          },
        },
      ],
    },
  ],
} as const satisfies ToolbarModuleConfig;
