import { TemplatePortal } from '@angular/cdk/portal';
import { Component, ContentChild, OnInit, TemplateRef, ViewChild, ViewContainerRef, InjectionToken, Inject, SimpleChanges, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { Subject } from 'rxjs';
import { M_PAGE_CONTENT } from './m-page-content';

/**
 * Used to provide a page group to a page without causing a circular dependency.
 * @docs-private
 */
export const M_PAGE_GROUP = new InjectionToken<any>('M_PAGE_GROUP');

@Component({
  selector: 'm-page',
  templateUrl: './m-page.component.html',
  styleUrls: ['./m-page.component.scss'],
  inputs: ['disabled'],
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.None,
  exportAs: 'mPage',
})
export class MPageComponent implements OnInit {
  /**
   * Template provided in the page content that will be used if present, used to enable lazy-loading
   */
  @ContentChild(M_PAGE_CONTENT, { read: TemplateRef, static: true })
  _explicitContent: TemplateRef<any>;

  /** Template inside the MPage view that contains an `<ng-content>`. */
  @ViewChild(TemplateRef, { static: true }) _implicitContent: TemplateRef<any>;

  /** Portal that will be the hosted content of the page */
  private _contentPortal: TemplatePortal | null = null;

  get content(): TemplatePortal | null {
    return this._contentPortal;
  }

  /** Emits whenever the internal state of the page changes. */
  readonly _stateChanges = new Subject<void>();

  /**
   * The relatively indexed position where 0 represents the center, negative is left, and positive
   * represents the right.
   */
  position: number | null = null;

  /**
   * The initial relatively index origin of the page if it was created and selected after there
   * was already a selected tab. Provides context of what position the page should originate from.
   */
  origin: number | null = null;

  /**
   * Whether the page is currently active.
   */
  isActive = false;

  constructor(
    private _viewContainerRef: ViewContainerRef,
    @Inject(M_PAGE_GROUP) public _closestPageGroup: any) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('textLabel') || changes.hasOwnProperty('disabled')) {
      this._stateChanges.next();
    }
  }

  ngOnDestroy(): void {
    this._stateChanges.complete();
  }

  ngOnInit(): void {
    this._contentPortal = new TemplatePortal(
      this._explicitContent || this._implicitContent, this._viewContainerRef);
  }

  // static ngAcceptInputType_disabled: BooleanInput;
}
