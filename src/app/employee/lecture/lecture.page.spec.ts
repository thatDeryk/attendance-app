import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LecturePage } from './lecture.page';

describe('LecturePage', () => {
  let component: LecturePage;
  let fixture: ComponentFixture<LecturePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LecturePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LecturePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
