import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { chain } from 'underscore';
import * as moment from 'moment';
import {
	IReportDayGroupByEmployee,
	ITimeLog,
	ITimeSlot
} from '@gauzy/contracts';
import { GetTimeLogGroupByEmployeeCommand } from '../get-time-log-group-by-employee.command';

@CommandHandler(GetTimeLogGroupByEmployeeCommand)
export class GetTimeLogGroupByEmployeeHandler
	implements ICommandHandler<GetTimeLogGroupByEmployeeCommand> {
	constructor() {}

	public async execute(
		command: GetTimeLogGroupByEmployeeCommand
	): Promise<IReportDayGroupByEmployee> {
		const { timeLogs } = command;

		const dailyLogs: any = chain(timeLogs)
			.groupBy((log) => log.employeeId)
			.map((byEmployeeLogs: ITimeLog[]) => {
				const employee =
					byEmployeeLogs.length > 0
						? byEmployeeLogs[0].employee
						: null;

				const byDate = chain(byEmployeeLogs)
					.groupBy((log) =>
						moment(log.startedAt).format('YYYY-MM-DD')
					)
					.map((byDateLogs: ITimeLog[], date) => {
						const byProject = chain(byDateLogs)
							.groupBy('projectId')
							.map((byProjectLogs: ITimeLog[]) => {
								const sum = byProjectLogs.reduce(
									(iteratee: any, log: any) => {
										return iteratee + log.duration;
									},
									0
								);

								const timeSlots: ITimeSlot[] = chain(
									byProjectLogs
								)
								.pluck('timeSlots')
								.flatten(true)
								.value();
								/**
								* Calculate Average activity of the employee
								*/
								const overallSum = timeSlots.reduce(
									(
										iteratee: any,
										timeSlot: ITimeSlot
									) => {
										return (
											iteratee +
											timeSlot.overall
										);
									},
									0
								) || 0;
								const durationSum = timeSlots.reduce(
									(
										iteratee: any,
										timeSlot: ITimeSlot
									) => {
										return (
											iteratee +
											timeSlot.duration
										);
									},
									0
								) || 0;
								const avgActivity = ((overallSum * 100) / (durationSum));

								const project =
									byProjectLogs.length > 0
										? byProjectLogs[0].project
										: null;

								const task =
									byProjectLogs.length > 0
										? byProjectLogs[0].task
										: null;

								return {
									task,
									project,
									sum,
									activity: avgActivity.toFixed(2)
								};
							})
							.value();

						return {
							date,
							projectLogs: byProject
						};
					})
					.value();

				return { employee, logs: byDate };
			})
			.value();

		return dailyLogs;
	}
}
