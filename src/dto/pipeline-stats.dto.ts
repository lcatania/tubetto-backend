import * as parser from 'cron-parser';

export class PipelineStatsDto {

    nextExecution!: string;
    avgExecutionTime!: number | null;
    avgQueryTime!: number | null;
    avgProcessTime!: number | null;
    avgFilesize!: number | null;

    constructor(pipeline: {
        cron: string,
        avgExecutionTime: number | null,
        avgQueryTime: number | null,
        avgProcessTime: number | null,
        avgFilesize: number | null
    } | null | undefined) {
        if (!pipeline)
            return;
        this.nextExecution = parser.parseExpression(pipeline.cron).next().toISOString();
        this.avgExecutionTime = pipeline.avgExecutionTime;
        this.avgQueryTime = pipeline.avgQueryTime;
        this.avgProcessTime = pipeline.avgProcessTime;
        this.avgFilesize = pipeline.avgFilesize;
    }

}