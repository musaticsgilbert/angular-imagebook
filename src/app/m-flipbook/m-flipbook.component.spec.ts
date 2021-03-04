import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MFlipbookComponent } from './m-flipbook.component';

describe('MFlipbookComponent', () => {
  let component: MFlipbookComponent;
  let fixture: ComponentFixture<MFlipbookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MFlipbookComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MFlipbookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
