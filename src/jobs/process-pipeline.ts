import Agenda, { Job } from "agenda";

export function processPipeline(agenda: Agenda, id: string) {
    agenda.define(`${id}`, {}, (job: Job) => {
        console.log(job.attrs.data)
    });
};