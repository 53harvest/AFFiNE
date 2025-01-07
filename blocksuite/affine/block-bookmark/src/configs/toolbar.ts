import {
  EmbedCardDarkHorizontalIcon,
  EmbedCardDarkListIcon,
  EmbedCardLightHorizontalIcon,
  EmbedCardLightListIcon,
} from '@blocksuite/affine-components/icons';
import { BookmarkBlockSchema } from '@blocksuite/affine-model';
import {
  ActionPlacement,
  type ToolbarAction,
  type ToolbarActionGroup,
  type ToolbarModuleConfig,
} from '@blocksuite/affine-shared/services';
import { getHostName } from '@blocksuite/affine-shared/utils';
import { BlockSelection } from '@blocksuite/block-std';
import {
  CaptionIcon,
  CopyIcon,
  DeleteIcon,
  DuplicateIcon,
  ResetIcon,
} from '@blocksuite/icons/lit';
import { Text } from '@blocksuite/store';
import { signal } from '@preact/signals-core';
import { html } from 'lit';
import * as Y from 'yjs';

import { BookmarkBlockComponent } from '../bookmark-block';

const cardStyleMap = {
  light: {
    horizontal: EmbedCardLightHorizontalIcon,
    list: EmbedCardLightListIcon,
  },
  dark: {
    horizontal: EmbedCardDarkHorizontalIcon,
    list: EmbedCardDarkListIcon,
  },
};

export const builtinToolbarConfig = {
  actions: [
    {
      id: 'preview',
      content(cx) {
        const model = cx.getCurrentBlockModelBy(
          BlockSelection,
          BookmarkBlockSchema
        );
        if (!model) return null;

        const { url } = model;

        return html`
          <a
            class="affine-link-preview"
            rel="noopener noreferrer"
            target="_blank"
            href=${url}
          >
            <span>${getHostName(url)}</span>
          </a>
        `;
      },
    },
    {
      id: 'conversions',
      actions: [
        {
          id: 'inline-view',
          label: 'Inline view',
          run(cx) {
            const model = cx.getCurrentBlockModelBy(
              BlockSelection,
              BookmarkBlockSchema
            );
            if (!model) return;

            const { title, caption, url, parent } = model;
            const index = parent?.children.indexOf(model);

            const yText = new Y.Text();
            const insert = title || caption || url;
            yText.insert(0, insert);
            yText.format(0, insert.length, { link: url });

            const text = new Text(yText);

            // TODO(@fundon): should select new block
            cx.store.addBlock('affine:paragraph', { text }, parent, index);

            cx.store.deleteBlock(model);
          },
        },
        {
          id: 'card-view',
          label: 'Card view',
          disabled: true,
        },
      ],
      content(cx) {
        const model = cx.getCurrentBlockModelBy(
          BlockSelection,
          BookmarkBlockSchema
        );
        if (!model) return null;

        const actions = this.actions.map(action => ({ ...action }));

        return html`<affine-view-dropdown
          .actions=${actions}
          .context=${cx}
          .viewType$=${signal(actions[1].label)}
        ></affine-view-dropdown>`;
      },
    } satisfies ToolbarActionGroup<ToolbarAction>,
    {
      id: 'style',
      actions: [
        {
          id: 'horizontal',
          label: 'Large horizontal style',
        },
        {
          id: 'list',
          label: 'Small horizontal style',
        },
      ],
      content(cx) {
        const model = cx.getCurrentBlockModelBy(
          BlockSelection,
          BookmarkBlockSchema
        );
        if (!model) return null;

        const [first, second] = this.actions.map(action => ({
          ...action,
          run: ({ store }) => {
            store.updateBlock(model, { style: action.id });

            // TODO(@fundon): add tracking event
          },
        })) satisfies ToolbarAction[];
        const { horizontal, list } = cardStyleMap[cx.theme];
        first.icon = horizontal;
        second.icon = list;

        return html`<affine-card-style-dropdown
          .actions=${[first, second]}
          .context=${cx}
          .style$=${model.style$}
        ></affine-card-style-dropdown>`;
      },
    } satisfies ToolbarActionGroup<ToolbarAction>,
    {
      id: 'caption',
      tooltip: 'Caption',
      icon: CaptionIcon(),
      run(cx) {
        const component = cx.getCurrentBlockComponentBy(
          BlockSelection,
          BookmarkBlockComponent
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
          run(_cx) {},
        },
        {
          id: 'duplicate',
          label: 'Duplicate',
          icon: DuplicateIcon(),
          run(_cx) {},
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
              BookmarkBlockComponent
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
          run(_cx) {},
        },
      ],
    },
  ],
} as const satisfies ToolbarModuleConfig;
