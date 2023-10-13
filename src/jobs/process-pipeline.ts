import Agenda, { Job } from "agenda";
import { Client } from 'pg'
import { createDecipheriv } from 'crypto'

type PipelineQueryResult = {
    status: 'SUCCESS' | 'ERROR',
    message: string,
    data?: { fields: Array<any>, rows: Array<any> },
    metadata: {
        time: number
    }
}

export type PipelineRunParams = {
    connection: string;
    connectionType: 'MSSQL' | 'MYSQL' | 'PG',
    userId: string;
    pipelineId: string,
    outputFormat: 'CSV',
    outputSettings: {
        type: 'FILE' | 'DB',
        csvSettings?: {
            delimeter: string;
            stringDelimiter: string;
        }
        dbMapping: { [key: string]: string }
    }
}

export function processPipeline(agenda: Agenda, id: string, secretStore: any) {
    agenda.define(`${id}`, {}, (job: Job<PipelineRunParams>): void => {
        const secret = secretStore.secrets()[job.attrs.data.userId][job.attrs.data.pipelineId];
        var iv = Buffer.from(secret, 'hex');
        var encrypted = Buffer.from(job.attrs.data.connection, 'hex');
        var decipher = createDecipheriv('aes-256-ocb', job.attrs.data.userId, iv);
        var decrypted = decipher.update(encrypted);
        var clearConnection = Buffer.concat([decrypted, decipher.final()]).toString();
        console.log("CONN", clearConnection)
        console.log("JOB DATA", job.attrs.data)
    });
};

async function getDataFromPG(connectionString: string, query: string): Promise<PipelineQueryResult> {
    let client: Client | undefined;
    const startTime = performance.now()
    let endTime = 0
    try {
        client = new Client({
            connectionString: connectionString
        })
        await client.connect();
        const data = await client.query(query);
        endTime = performance.now()
        await client.end()
        return {
            status: 'SUCCESS',
            message: 'Data was successfully gathered',
            data: { fields: data.fields, rows: data.rows },
            metadata: {
                time: endTime - startTime
            }
        }

    } catch (error) {
        if (client)
            await client.end()
        let errorMessage: string = ""
        if (typeof error === "string") {
            errorMessage = error.toUpperCase() // works, `e` narrowed to string
        } else if (error instanceof Error) {
            errorMessage = error.message // works, `e` narrowed to Error
        }
        return {
            status: 'ERROR',
            message: errorMessage,
            metadata: {
                time: endTime - startTime
            }
        }
    }
}