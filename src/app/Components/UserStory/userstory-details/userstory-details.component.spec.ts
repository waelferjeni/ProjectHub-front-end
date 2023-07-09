import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserstoryDetailsComponent } from './userstory-details.component';

describe('UserstoryDetailsComponent', () => {
  let component: UserstoryDetailsComponent;
  let fixture: ComponentFixture<UserstoryDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserstoryDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserstoryDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
