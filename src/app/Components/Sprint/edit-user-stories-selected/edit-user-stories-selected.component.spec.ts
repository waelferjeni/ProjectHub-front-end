import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditUserStoriesSelectedComponent } from './edit-user-stories-selected.component';

describe('EditUserStoriesSelectedComponent', () => {
  let component: EditUserStoriesSelectedComponent;
  let fixture: ComponentFixture<EditUserStoriesSelectedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditUserStoriesSelectedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditUserStoriesSelectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
