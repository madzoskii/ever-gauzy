import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManualTimeRoutingModule } from './manual-time-routing.module';
import { ManualTimeComponent } from './manual-time/manual-time.component';
import { SharedModule } from '../../../@shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import {
	NbIconModule,
	NbSpinnerModule,
	NbCardModule,
	NbSelectModule,
	NbBadgeModule
} from '@nebular/theme';
import { FiltersModule } from '../../../@shared/timesheet/filters/filters.module';
import { HeaderTitleModule } from '../../../@shared/components/header-title/header-title.module';
import { DateRangeTitleModule } from '../../../@shared/components/date-range-title/date-range-title.module';
import { GauzyRangePickerModule } from '../../../@shared/timesheet/gauzy-range-picker/gauzy-range-picker.module';

@NgModule({
	declarations: [ManualTimeComponent],
	imports: [
		CommonModule,
		ManualTimeRoutingModule,
		SharedModule,
		TranslateModule,
		NbIconModule,
		NbSpinnerModule,
		NbCardModule,
		FiltersModule,
		NbSelectModule,
		FormsModule,
		NbBadgeModule,
		HeaderTitleModule,
		DateRangeTitleModule,
    	GauzyRangePickerModule
	]
})
export class ManualTimeModule {}
