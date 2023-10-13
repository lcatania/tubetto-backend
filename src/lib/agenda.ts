import Agenda from "agenda";
import { processPipeline } from "../jobs/process-pipeline"
import { createSecretEngine } from "./secret-engine";


export async function createAgenda(isWorker: boolean = false): Promise<Agenda> {
    const connectionOpts = { db: { address: 'mongodb://root:test@localhost:27017', collection: 'agendaJobs' } };
    const secretStore = await createSecretEngine(Bun.env.SECRET_STORE_PATH ?? "")

    const agenda = new Agenda(connectionOpts);

    //TODO: Get pipeline ids or randomJobId on creation
    const jobs = ['1', '2', '3'];

    if (isWorker) {
        jobs.forEach(jobId => {
            processPipeline(agenda, jobId, secretStore)
        });
    }

    if (jobs.length && isWorker) {
        await agenda.start(); // Returns a promise, which should be handled appropriately
    }
    return agenda
}