import Agenda, { Job } from "agenda";
import { Client } from 'pg'

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

export function processPipeline(agenda: Agenda, id: string) {
    agenda.define(`${id}`, {}, (job: Job<PipelineRunParams>): void => {
        //TODO: Get iv from secretStore var iv = new Buffer(encryptedArray[0], 'hex');
        //TODO: This is encrypted conn var encrypted = new Buffer(encryptedArray[1], 'hex');
        //TODO: Insert userId as password var decipher = Crypto.createDecipheriv('aes-128-cbc', new Buffer(<128 bit password >), iv);
        //var decrypted = decipher.update(encrypted);
        //var clearText = Buffer.concat([decrypted, decipher.final()]).toString();
        console.log(job.attrs.data)
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