import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostPlaceholderComponent } from './post-placeholder.component';

describe('PostPlaceholderComponent', () => {
  let component: PostPlaceholderComponent;
  let fixture: ComponentFixture<PostPlaceholderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostPlaceholderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostPlaceholderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
