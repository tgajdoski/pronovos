import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThumbComponentComponent } from './thumb-component.component';

describe('ThumbComponentComponent', () => {
  let component: ThumbComponentComponent;
  let fixture: ComponentFixture<ThumbComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThumbComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThumbComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
