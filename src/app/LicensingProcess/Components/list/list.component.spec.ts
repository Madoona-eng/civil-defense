import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ActivityTypeService } from '../../../ActivityType/Services/activity-type.service';
import { DistrictService } from '../../../District/Services/district.service';
import { RequestingEntityService } from '../../../RequestingEntity/Services/requesting-entity.service';
import { LicensingProcessService } from '../../Services/licensing-process.service';
import { ListComponent } from './list.component';

describe('ListComponent', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListComponent],
      providers: [
        {
          provide: LicensingProcessService,
          useValue: {
            getAll: () =>
              of({
                data: {
                  items: [],
                  pageNumber: 1,
                  pageSize: 10,
                  totalCount: 0,
                  totalPages: 0,
                  hasNextPage: false,
                  hasPreviousPage: false,
                },
                isSuccess: true,
                errorCode: '',
                message: '',
              }),
          },
        },
        {
          provide: DistrictService,
          useValue: { getAll: () => of({ data: [], isSuccess: true }) },
        },
        {
          provide: RequestingEntityService,
          useValue: { getAll: () => of({ data: [], isSuccess: true }) },
        },
        {
          provide: ActivityTypeService,
          useValue: { getAll: () => of({ data: [], isSuccess: true }) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
