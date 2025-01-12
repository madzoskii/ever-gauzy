// tslint:disable: nx-enforce-module-boundaries
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
	IGetTimeLogInput,
	ITimeLog,
	ITimesheet,
	TimesheetStatus,
	OrganizationPermissionsEnum,
	PermissionsEnum
} from '@gauzy/contracts';
import { chain } from 'underscore';
import * as moment from 'moment';
import { filter, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { NbDialogService } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { TimesheetService } from './../../../../../@shared/timesheet/timesheet.service';
import { EditTimeLogModalComponent } from './../../../../../@shared/timesheet';
import { TranslationBaseComponent } from './../../../../../@shared/language-base';

@UntilDestroy({ checkProperties: true })
@Component({
	selector: 'ngx-timesheet-view',
	templateUrl: './view.component.html'
})
export class ViewComponent 
	extends TranslationBaseComponent 
	implements OnInit, OnDestroy {

	OrganizationPermissionsEnum = OrganizationPermissionsEnum;
	PermissionsEnum = PermissionsEnum;
	TimesheetStatus = TimesheetStatus;
	timeLogs: any;
	logs$: Subject<any> = new Subject();
	timesheet: ITimesheet;

	constructor(
		private readonly timesheetService: TimesheetService,
		private readonly activatedRoute: ActivatedRoute,
		private readonly nbDialogService: NbDialogService,
		public readonly translateService: TranslateService
	) {
		super(translateService);
	}

	ngOnInit() {
		this.logs$
			.pipe(
				tap(() => this.getLogs()),
				untilDestroyed(this)
			)
			.subscribe();
		this.activatedRoute.data
			.pipe(
				tap((data) => !!data && !!data.timesheet),
				tap(({ timesheet }) => this.timesheet = timesheet),
				tap(() => this.logs$.next(true)),
				untilDestroyed(this)
			)
			.subscribe();
	}

	async getLogs() {
		try {
			const request: IGetTimeLogInput = {
				timesheetId: this.timesheet.id
			};
			const logs: ITimeLog[] = await this.timesheetService.getTimeLogs(request);
			this.timeLogs = chain(logs).groupBy(
				(log) => moment(log.startedAt).format('YYYY-MM-DD')
			).value();
		} catch (error) {
			console.error('Error while retrieving logs', error);
		}
	}

	openEditDialog(timeLog: ITimeLog) {
		if (timeLog.isRunning) {
			return;
		}
		this.nbDialogService
			.open(EditTimeLogModalComponent, {
				context: { timeLog: timeLog }
			})
			.onClose
			.pipe(
				filter((data) => !!data),
				tap(() => this.logs$.next(true)),
				untilDestroyed(this)
			)
			.subscribe();
	}

	async deleteTimeLog(timeLog: ITimeLog) {
		if (timeLog.isRunning) {
			return;
		}
		try {
			await this.timesheetService.deleteLogs([timeLog.id]);
			this.logs$.next(true);
		} catch (error) {
			console.error('Error while deleting TimeLog', error);
		}
	}

	ngOnDestroy() {}
}
