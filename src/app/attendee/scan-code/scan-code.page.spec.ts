import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ScanCodePage } from './scan-code.page';

describe('ScanCodePage', () => {
  let component: ScanCodePage;
  let fixture: ComponentFixture<ScanCodePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScanCodePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ScanCodePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
