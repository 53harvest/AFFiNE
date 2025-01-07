import {
  type ToolbarAction,
  ToolbarContext,
} from '@blocksuite/affine-shared/services';
import {
  PropTypes,
  requiredProperties,
  ShadowlessElement,
} from '@blocksuite/block-std';
import { SignalWatcher } from '@blocksuite/global/utils';
import { PaletteIcon } from '@blocksuite/icons/lit';
import type { ReadonlySignal, Signal } from '@preact/signals-core';
import { property } from 'lit/decorators.js';
import { html } from 'lit-html';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { repeat } from 'lit-html/directives/repeat.js';

@requiredProperties({
  actions: PropTypes.array,
  context: PropTypes.instanceOf(ToolbarContext),
  style$: PropTypes.object,
})
export class CardStyleDropdown extends SignalWatcher(ShadowlessElement) {
  @property({ attribute: false })
  accessor actions!: ToolbarAction[];

  @property({ attribute: false })
  accessor context!: ToolbarContext;

  @property({ attribute: false })
  accessor style$!: Signal<string> | ReadonlySignal<string>;

  override render() {
    const {
      actions,
      context,
      style$: { value: style },
    } = this;

    return html`
      <editor-menu-button
        .contentPadding="${'8px'}"
        .button=${html`
          <editor-icon-button
            aria-label="Card style"
            .tooltip="${'Card style'}"
          >
            ${PaletteIcon()}
          </editor-icon-button>
        `}
      >
        <div>
          ${repeat(
            actions,
            action => action.id,
            ({ id, label, icon, disabled, run }) => html`
              <editor-icon-button
                aria-label="${label}"
                data-testid="${id}"
                .tooltip="${label}"
                .activeMode="${'border'}"
                .iconContainerWidth="${'76px'}"
                .iconContainerHeight="${'76px'}"
                ?active="${id === style}"
                ?disabled="${ifDefined(disabled)}"
                @click=${() => run?.(context)}
              >
                ${icon}
              </editor-icon-button>
            `
          )}
        </div>
      </editor-menu-button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'affine-card-style-dropdown': CardStyleDropdown;
  }
}
