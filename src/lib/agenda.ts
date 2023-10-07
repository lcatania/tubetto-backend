import Agenda from "agenda";
import { processPipeline } from "../jobs/process-pipeline"

export function createAgenda(isWorker: boolean = false): Agenda {
    const connectionOpts = { db: { address: 'mongodb://root:test@localhost:27017', collection: 'agendaJobs' } };

    const agenda = new Agenda(connectionOpts);

    //TODO: Get pipeline ids or randomJobId on creation
    const jobs = ['1', '2', '3'];

    jobs.forEach(jobId => {
        processPipeline(agenda, jobId)
    });

    if (jobs.length && isWorker) {
        agenda.start(); // Returns a promise, which should be handled appropriately
    }
    return agenda
}