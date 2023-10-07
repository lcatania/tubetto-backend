import * as parser from 'cron-parser';

export class PipelineDto {

    id!: string;
    name!: string;
    nextExecution!: string;

    constructor(pipeline: { id: string, name: string, cron: string } | null | undefined) {
        if(!pipeline)
            return;
        this.id = pipeline.id;
        this.name = pipeline.name;
        this.nextExecution = parser.parseExpression(pipeline.cron).next().toISOString();
    }

}