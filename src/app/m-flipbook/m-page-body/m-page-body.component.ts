import { CdkPortalOutlet, TemplatePortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import { Component, OnInit, Directive, OnDestroy, ComponentFactoryResolver, ViewContainerRef, forwardRef, Inject, EventEmitter, Output, Input, ElementRef, Optional, ChangeDetectorRef, ViewEncapsulation, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { Subscription, Subject } from 'rxjs';
import { distinctUntilChanged, startWith } from 'rxjs/operators';

/**
 * The portal host directive for the contents of the page.
 * @docs-private
 */
@Directive({
  selector: '[mPageBodyHost]'
})
export class MPageBodyPortal extends CdkPortalOutlet implements OnInit, OnDestroy {
  /** Subscription to events for when the page body begins centering. */
  private _centeringSub = Subscription.EMPTY;
  /** Subscription to events for when the page body finishes leaving from center position. */
  private _leavingSub = Subscription.EMPTY;

  constructor(
    componentFactoryResolver: ComponentFactoryResolver,
    viewContainerRef: ViewContainerRef,
    @Inject(forwardRef(() => MPageBodyComponent)) private _host: MPageBodyComponent,
    @Inject(DOCUMENT) _document: any
  ) {
    super(componentFactoryResolver, viewContainerRef, _document);
  }

  /** Set initial visibility or set up subscription for changing visibility. */
  ngOnInit(): void {
    super.ngOnInit();

    if (!this.hasAttached()) {
      this.attach(this._host._content);
    }

    // this._centeringSub = this._host._beforeCentering
    //   .pipe()
    //   .subscribe(() => {
    //     if (!this.hasAttached()) {
    //       this.attach(this._host._content);
    //     }   
    //   });

    this._leavingSub = this._host._afterLeavingCenter.subscribe(() => {
      this.detach();
    });
  }

  /** Clean up centering subscription. */
  ngOnDestroy(): void {
    super.ngOnDestroy();
    this._centeringSub.unsubscribe();
    this._leavingSub.unsubscribe();
  }
}

/**
 * Base class with all of the `MPageBody` functionality.
 * @docs-private
 */
@Directive()
export abstract class _MPageBodyBase implements OnInit, OnDestroy {
  /** Current position of the page-body in the page-group. Zero means that the page is visible. */
  private _positionIndex: number;

  /** Subscription to the directionality change observable. */
  private _dirChangeSubscription = Subscription.EMPTY;

  // /** Page body position state. Used by the animation trigger for the current state. */
  // _position: MPageBodyPositionState;

  /** Emits when an animation on the page is complete. */
  // _translatePageComplete = new Subject<AnimationEvent>();

  /** Event emitted when the page begins to animate towards the center as the active page. */
  @Output() readonly _onCentering: EventEmitter<number> = new EventEmitter<number>();

  /** Event emitted before the centering of the page begins. */
  @Output() readonly _beforeCentering: EventEmitter<boolean> = new EventEmitter<boolean>();

  /** Event emitted before the centering of the page begins. */
  @Output() readonly _afterLeavingCenter: EventEmitter<void> = new EventEmitter<void>();

  /** Event emitted when the page completes its animation towards the center. */
  @Output() readonly _onCentered: EventEmitter<void> = new EventEmitter<void>(true);

  /** The portal host inside of this container into which the pagw body content will be loaded. */
  abstract _portalHost: CdkPortalOutlet;

  /** The page body content to display. */
  @Input('content') _content: TemplatePortal;

  /** Position that will be used when the page is immediately becoming visible after creation. */
  @Input() origin: number | null;

  // Note that the default value will always be overwritten by `MPageBody`, but we need one
  // anyway to prevent the animations module from throwing an error if the body is used on its own.
  /** Duration for the page's animation. */
  @Input() animationDuration: string = '500ms';

  /** The shifted index position of the page body, where zero represents the active center page. */
  @Input()
  set position(position: number) {
    this._positionIndex = position;
    // this._computePositionAnimationState();
  }

  constructor(private _elementRef: ElementRef<HTMLElement>,
    changeDetectorRef: ChangeDetectorRef) {

    console.log('TODO: sth about animation');
    // // Ensure that we get unique animation events, because the `.done` callback can get
    // // invoked twice in some browsers. See https://github.com/angular/angular/issues/24084.
    // this._translateTabComplete.pipe(distinctUntilChanged((x, y) => {
    //   return x.fromState === y.fromState && x.toState === y.toState;
    // })).subscribe(event => {
    //   // If the transition to the center is complete, emit an event.
    //   if (this._isCenterPosition(event.toState) && this._isCenterPosition(this._position)) {
    //     this._onCentered.emit();
    //   }

    //   if (this._isCenterPosition(event.fromState) && !this._isCenterPosition(this._position)) {
    //     this._afterLeavingCenter.emit();
    //   }
    // });
  }

  /**
   * After initialized, check if the content is centered and has an origin. If so, set the
   * special position states that transition the page from the left or right before centering.
   */
  ngOnInit() {
    // if (this._position == 'center' && this.origin != null) {
    //   this._position = this._computePositionFromOrigin(this.origin);
    // }
  }

  ngOnDestroy() {
    this._dirChangeSubscription.unsubscribe();
    // this._translateTabComplete.complete();
  }

  // _onTranslateTabStarted(event: AnimationEvent): void {
  //   const isCentering = this._isCenterPosition(event.toState);
  //   this._beforeCentering.emit(isCentering);
  //   if (isCentering) {
  //     this._onCentering.emit(this._elementRef.nativeElement.clientHeight);
  //   }
  // }

  // /** Whether the provided position state is considered center, regardless of origin. */
  // _isCenterPosition(position: MPageBodyPositionState | string): boolean {
  //   return position == 'center' ||
  //     position == 'left-origin-center' ||
  //     position == 'right-origin-center';
  // }

  // /** Computes the position state that will be used for the page-body animation trigger. */
  // private _computePositionAnimationState(dir: Direction = this._getLayoutDirection()) {
  //   if (this._positionIndex < 0) {
  //     this._position = dir == 'ltr' ? 'left' : 'right';
  //   } else if (this._positionIndex > 0) {
  //     this._position = dir == 'ltr' ? 'right' : 'left';
  //   } else {
  //     this._position = 'center';
  //   }
  // }

  // /**
  //  * Computes the position state based on the specified origin position. This is used if the
  //  * tab is becoming visible immediately after creation.
  //  */
  // private _computePositionFromOrigin(origin: number): MatTabBodyPositionState {
  //   const dir = this._getLayoutDirection();

  //   if ((dir == 'ltr' && origin <= 0) || (dir == 'rtl' && origin > 0)) {
  //     return 'left-origin-center';
  //   }

  //   return 'right-origin-center';
  // }
}

/**
 * Wrapper for the contents of a tab.
 * @docs-private
 */
@Component({
  selector: 'm-page-body',
  templateUrl: './m-page-body.component.html',
  styleUrls: ['./m-page-body.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
  host: {
    'class': 'm-page-body'
  }
})
export class MPageBodyComponent extends _MPageBodyBase {

  @ViewChild(CdkPortalOutlet) _portalHost: CdkPortalOutlet;

  constructor(elementRef: ElementRef<HTMLElement>,
    changeDetectorRef: ChangeDetectorRef) {
    super(elementRef, changeDetectorRef);
  }

}
