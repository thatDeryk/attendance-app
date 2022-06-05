import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AttendeesPage } from './attendees.page';

describe('AttendeesPage', () => {
  let component: AttendeesPage;
  let fixture: ComponentFixture<AttendeesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttendeesPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AttendeesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
