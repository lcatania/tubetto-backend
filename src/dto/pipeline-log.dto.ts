
export class PipelineLogDto {

    content!: string;
    status!: 'SUCCESS' | 'FAILED' | 'WARNING'
    executedAt!: Date;
    executionTime!: number | null;

    constructor(log: { content: string, status: 'SUCCESS' | 'FAILED' | 'WARNING', executedAt: Date, executionTime: number | null }) {
        this.content = log.content;
        this.status = log.status;
        this.executedAt = log.executedAt;
        this.executionTime = log.executionTime;
    }

}