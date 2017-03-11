import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileuploadComponentComponent } from './fileupload-component.component';

describe('FileuploadComponentComponent', () => {
  let component: FileuploadComponentComponent;
  let fixture: ComponentFixture<FileuploadComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileuploadComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileuploadComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
