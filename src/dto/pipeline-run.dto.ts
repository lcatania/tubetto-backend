
export class PipelineRunDto {

    executedAt!: Date;
    status!: 'SUCCESS' | 'FAILED' | 'WARNING';
    fileSize!: number | null;
    processTime!: number | null;
    queryTime!: number | null;
    executionTime!: number | null;

    constructor(run: {
        executedAt: Date,
        status: 'SUCCESS' | 'FAILED' | 'WARNING',
        fileSize: number | null,
        processTime: number | null,
        queryTime: number | null,
        executionTime: number | null
    }) {
        this.executedAt = run.executedAt;
        this.status = run.status;
        this.fileSize = run.fileSize;
        this.processTime = run.processTime;
        this.queryTime = run.queryTime;
        this.executionTime = run.executionTime;
    }

}