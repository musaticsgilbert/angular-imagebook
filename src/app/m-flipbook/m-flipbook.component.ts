import { Component, ContentChildren, Directive, OnInit, QueryList, ElementRef, ViewChild, Input, EventEmitter, Output, ChangeDetectorRef, Optional, Inject, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { MPageComponent, M_PAGE_GROUP } from './m-page/m-page.component';
import { Helper } from './Helper';
import { MFlipbookConfig, M_FLIPBOOK_CONFIG } from './m-flipbook.config';

/** Used to generate unique ID's for each page component */
let nextId = 0;

/** A simple change event emitted on focus or selection changes. */
export class MPageChangeEvent {
  /** Index of the currently-selected page. */
  index: number;
  /** Reference to the currently-selected page. */
  page: MPageComponent;
}

@Directive()
export abstract class _MFlipBookBase {
  /** Snapshot of the height of the page body wrapper before another page is activated. */
  private _pageBodyWrapperHeight: number = 0;

  abstract _allPages: QueryList<MPageComponent>;
  abstract _pageBodyWrapper: ElementRef;

  _pages: QueryList<MPageComponent> = new QueryList<MPageComponent>();

  /** The page index that should be selected after the content has been checked. */
  private _indexToSelect: number | null = 0;

  /** Subscription to pages being added/removed. */
  private _pagesSubscription = Subscription.EMPTY;

  /** Whether the book should grow to the size of the active page. */
  @Input()
  get dynamicHeight(): boolean { return this._dynamicHeight; }
  set dynamicHeight(value: boolean) { this._dynamicHeight = coerceBooleanProperty(value); }
  private _dynamicHeight: boolean;


  @Input()
  get selectedIndex(): number | null { return this._selectedIndex; }
  set selectedIndex(value: number | null) {
    this._indexToSelect = Helper.coerceNumberProperty(value, null);
  }
  private _selectedIndex: number | null = null;

  /** Duration for the page animation. Will be normalized to milliseconds if no units are set. */
  @Input()
  get animationDuration(): string { return this._animationDuration; }
  set animationDuration(value: string) {
    this._animationDuration = /^\d+$/.test(value) ? value + 'ms' : value;
  }
  private _animationDuration: string;

  /** Output to enable support for two-way binding on `[(selectedIndex)]` */
  @Output() readonly selectedIndexChange: EventEmitter<number> = new EventEmitter<number>();

  /** Event emitted when the body animation has completed */
  @Output() readonly animationDone: EventEmitter<void> = new EventEmitter<void>();

  /** Event emitted when the tab selection has changed. */
  @Output() readonly selectedPageChange: EventEmitter<MPageChangeEvent> =
    new EventEmitter<MPageChangeEvent>(true);

  private _groupId: number;

  constructor(
    elementRef: ElementRef,
    protected _changeDetectorRef: ChangeDetectorRef,
    @Inject(M_FLIPBOOK_CONFIG) @Optional() defaultConfig?: MFlipbookConfig
  ) {
    console.log('TODO: configuration goes here');
    this._groupId = nextId++;
    this.animationDuration = defaultConfig && defaultConfig.animationDuration ?
      defaultConfig.animationDuration : '500ms';
  }

  /**
   * After the content is checked, this component knows what pages have been defined
   * and what the selected index should be. This is where we can know exactly what position
   * each page should be in according to the new selected index.
   */
  ngAfterContentChecked() {
    // Don't clamp the `indexToSelect` immediately in the setter because it can happen that
    // the amount of pages changes before the actual change detection runs.
    const indexToSelect = this._clampPageIndex(this._indexToSelect);

    // If there is a change in selected index, emit a change event. Should not trigger if
    // the selected index has not yet been initialized.
    if (this._selectedIndex != indexToSelect) {
      const isFirstRun = this._selectedIndex == null;

      if (!isFirstRun) {
        this.selectedPageChange.emit(this._createChangeEvent(indexToSelect));
      }

      // Changing these values after change detection has run
      // since the checked content may contain references to them.
      Promise.resolve().then(() => {
        this._pages.forEach((page, index) => page.isActive = index === indexToSelect);

        if (!isFirstRun) {
          this.selectedIndexChange.emit(indexToSelect);
        }
      });
    }

    if (this._selectedIndex !== indexToSelect) {
      this._selectedIndex = indexToSelect;
      this._changeDetectorRef.markForCheck();
    }
  }

  ngAfterContentInit() {
    this._subscribeToAllPageChanges();

    // Subscribe to changes in the amount of pages, in order to be
    // able to re-render the content as new pages are added or removed.
    this._pagesSubscription = this._pages.changes.subscribe(() => {
      const indexToSelect = this._clampPageIndex(this._indexToSelect);

      // Maintain the previously-selected page if a new page is added or removed and there is no
      // explicit change that selects a different page.
      if (indexToSelect === this._selectedIndex) {
        const pages = this._pages.toArray();

        for (let i = 0; i < pages.length; i++) {
          if (pages[i].isActive) {
            // Assign both to the `_indexToSelect` and `_selectedIndex` so we don't fire a changed
            // event, otherwise the consumer may end up in an infinite loop in some edge cases like
            // adding a page within the `selectedIndexChange` event.
            this._indexToSelect = this._selectedIndex = i;
            break;
          }
        }
      }

      this._changeDetectorRef.markForCheck();
    });
  }

  /** Listens to changes in all of the pages. */
  private _subscribeToAllPageChanges() {
    this._allPages.changes
      .pipe(startWith(this._allPages))
      .subscribe((pages: QueryList<MPageComponent>) => {
        this._pages.reset(Array.from(pages));
        this._pages.notifyOnChanges();
      });
  }

  /** Clamps the given index to the bounds of 0 and the pages length. */
  private _clampPageIndex(index: number | null): number {
    // Note the `|| 0`, which ensures that values like NaN can't get through
    // and which would otherwise throw the component into an infinite loop
    // (since Math.max(NaN, 0) === NaN).
    return Math.min(this._pages.length - 1, Math.max(index || 0, 0));
  }

  /** Returns a unique id for each page content element */
  _getPageContentId(i: number): string {
    return `m-page-content-${this._groupId}-${i}`;
  }

  /**
   * Sets the height of the body wrapper to the height of the activating page if dynamic
   * height property is true.
   */
  _setPageBodyWrapperHeight(pageHeight: number): void {
    if (!this._dynamicHeight || !this._pageBodyWrapperHeight) { return; }

    const wrapper: HTMLElement = this._pageBodyWrapper.nativeElement;

    wrapper.style.height = this._pageBodyWrapperHeight + 'px';

    // This conditional forces the browser to paint the height so that
    // the animation to the new height can have an origin.
    if (this._pageBodyWrapper.nativeElement.offsetHeight) {
      wrapper.style.height = pageHeight + 'px';
    }
  }

  /** Removes the height of the page body wrapper. */
  _removePageBodyWrapperHeight(): void {
    const wrapper = this._pageBodyWrapper.nativeElement;
    this._pageBodyWrapperHeight = wrapper.clientHeight;
    wrapper.style.height = '';
    this.animationDone.emit();
  }

  private _createChangeEvent(index: number): MPageChangeEvent {
    const event = new MPageChangeEvent;
    event.index = index;
    if (this._pages && this._pages.length) {
      event.page = this._pages.toArray()[index];
    }
    return event;
  }
}

@Component({
  selector: 'm-flipbook',
  exportAs: 'm-flipbook',
  templateUrl: './m-flipbook.component.html',
  styleUrls: ['./m-flipbook.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
  inputs: ['config'],
  providers: [{
    provide: M_PAGE_GROUP,
    useExisting: MFlipbookComponent
  }],
  host: {
    'class': 'm-flipbook',
  },
})
export class MFlipbookComponent extends _MFlipBookBase implements OnInit {
  @ContentChildren(MPageComponent, { descendants: true }) _allPages: QueryList<MPageComponent>;
  @ViewChild('pageBodyWrapper') _pageBodyWrapper: ElementRef;
  constructor(
    elementRef: ElementRef,
    changeDetectorRef: ChangeDetectorRef,
    @Inject(M_FLIPBOOK_CONFIG) @Optional() defaultConfig?: MFlipbookConfig,
  ) {
    super(elementRef, changeDetectorRef, defaultConfig);
  }

  ngOnInit(): void {
  }

}
