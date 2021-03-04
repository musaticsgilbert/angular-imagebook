import { InjectionToken } from '@angular/core';

/** Object that can be used to configure the default options for the flipbook module. */
export interface MFlipbookConfig {
  /** Duration for the page animation. Must be a valid CSS value (e.g. 600ms). */
  animationDuration?: string;
}

/** Injection token that can be used to provide the default options the tabs module. */
export const M_FLIPBOOK_CONFIG = new InjectionToken<MFlipbookConfig>('M_FLIPBOOK_CONFIG');