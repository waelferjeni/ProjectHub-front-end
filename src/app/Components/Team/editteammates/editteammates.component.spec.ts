import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditteammatesComponent } from './editteammates.component';

describe('EditteammatesComponent', () => {
  let component: EditteammatesComponent;
  let fixture: ComponentFixture<EditteammatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditteammatesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditteammatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
