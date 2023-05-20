import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullFooterComponent } from './full-footer.component';

describe('FullFooterComponent', () => {
  let component: FullFooterComponent;
  let fixture: ComponentFixture<FullFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FullFooterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FullFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
