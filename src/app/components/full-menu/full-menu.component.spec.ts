import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullMenuComponent } from './full-menu.component';

describe('FullMenuComponent', () => {
  let component: FullMenuComponent;
  let fixture: ComponentFixture<FullMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FullMenuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FullMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
