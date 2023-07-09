import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectUserStoriesComponent } from './select-user-stories.component';

describe('SelectUserStoriesComponent', () => {
  let component: SelectUserStoriesComponent;
  let fixture: ComponentFixture<SelectUserStoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectUserStoriesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectUserStoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
