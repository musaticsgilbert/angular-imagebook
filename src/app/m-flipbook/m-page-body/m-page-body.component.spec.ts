import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MPageBodyComponent } from './m-page-body.component';

describe('MPageBodyComponent', () => {
  let component: MPageBodyComponent;
  let fixture: ComponentFixture<MPageBodyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MPageBodyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MPageBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
