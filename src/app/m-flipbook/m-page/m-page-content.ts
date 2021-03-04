import { Directive, InjectionToken, TemplateRef } from '@angular/core';

/**
 * Injection token that can be used to reference instances of `MatPageContent`. It serves as
 * alternative token to the actual `MatPageContent` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const M_PAGE_CONTENT = new InjectionToken<MPageContent>('MPageContent');

/** Decorates the `ng-template` tags and reads out the template from it. */
@Directive({
  selector: '[mPageContent]',
  providers: [{ provide: M_PAGE_CONTENT, useExisting: MPageContent }],
})
export class MPageContent {
  constructor(
    /** Content for the tab. */ public template: TemplateRef<any>) { }
}