import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BaseAPI } from '../../Shared/Env/env';
import {
  LicensingProcessDetails,
  LicensingProcessQuery,
  LicensingProcessUpdateRequest,
} from '../Models/licensing-process';
import { LicensingProcessService } from './licensing-process.service';

describe('LicensingProcessService', () => {
  let service: LicensingProcessService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(LicensingProcessService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('requests all process filters from the licensing process endpoint', () => {
    const query: LicensingProcessQuery = {
      districtId: 'district-id',
      requestingEntityId: 'entity-id',
      activityTypeId: 'activity-id',
      processStep: 'Inspection',
      submissionDateFrom: '2026-01-01',
      submissionDateTo: '2026-01-31',
      searchTerm: 'request term',
      pageNumber: 2,
      pageSize: 25,
    };

    service.getAll(query).subscribe();

    const request = httpMock.expectOne(
      (req) => req.url === `${BaseAPI}/api/LicensingProcess`,
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('districtId')).toBe('district-id');
    expect(request.request.params.get('requestingEntityId')).toBe('entity-id');
    expect(request.request.params.get('activityTypeId')).toBe('activity-id');
    expect(request.request.params.get('processStep')).toBe('Inspection');
    expect(request.request.params.get('submissionDateFrom')).toBe('2026-01-01');
    expect(request.request.params.get('submissionDateTo')).toBe('2026-01-31');
    expect(request.request.params.get('searchTerm')).toBe('request term');
    expect(request.request.params.get('pageNumber')).toBe('2');
    expect(request.request.params.get('pageSize')).toBe('25');
    request.flush({
      data: {
        items: [],
        pageNumber: 2,
        pageSize: 25,
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      isSuccess: true,
      errorCode: '',
      message: '',
    });
  });

  it('requests full process details by id', () => {
    service.getById('process-id').subscribe();

    const request = httpMock.expectOne(`${BaseAPI}/api/LicensingProcess/process-id`);
    expect(request.request.method).toBe('GET');
    request.flush({
      data: {
        id: 'process-id',
        transactionCode: 'REQ-1',
        currentStep: 'Inspection',
        createdBy: 'admin',
        createdAt: '2026-01-01T10:00:00',
        isReturned: false,
        submissionDate: '2026-01-01',
        establishmentName: 'Establishment',
        establishmentAddress: 'Address',
        requestingEntity: 'Entity',
        district: 'District',
        activityType: 'Activity',
        applicantName: 'Applicant',
        applicantRole: 'Owner',
        nationalId: '123',
        responsibleManager: 'Manager',
        phone: '01000000000',
        inspectorName: null,
        opinion: null,
        inspectedBy: null,
        finalStatus: null,
        approvedBy: null,
        archivedBy: null,
        entityLetters: [],
        proofDocuments: [],
        engineeringReports: [],
        inspectionReports: [],
        otherAttachments: [],
        notes: [],
        reviews: [],
      } satisfies LicensingProcessDetails,
      isSuccess: true,
      errorCode: '',
      message: '',
    });
  });

  it('updates a process using the documented JSON request body', () => {
    const requestBody: LicensingProcessUpdateRequest = {
      establishmentName: 'Establishment',
      establishmentAddress: 'Address',
      requestingEntityId: 'entity-id',
      districtId: 'district-id',
      activityTypeId: 'activity-id',
      applicantName: 'Applicant',
      applicantRole: 'Owner',
      nationalId: '123',
      responsibleManager: 'Manager',
      phone: '01000000000',
    };

    service.update('process-id', requestBody).subscribe();

    const request = httpMock.expectOne(`${BaseAPI}/api/LicensingProcess/process-id`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(requestBody);
    request.flush({
      data: true,
      isSuccess: true,
      errorCode: '',
      message: '',
    });
  });
});
