import { Elysia, InternalServerError, NotFoundError, t } from "elysia";
import { ConnectionType, PrismaClient } from "@prisma/client";
import { PipelineDto } from "./dto/pipeline.dto.";
import { cors } from '@elysiajs/cors';
import { PipelineStatsDto } from "./dto/pipeline-stats.dto";
import { PipelineLogDto } from "./dto/pipeline-log.dto";
import { PipelineRunDto } from "./dto/pipeline-run.dto";
import { createAgenda } from "./lib/agenda";

const db = new PrismaClient()
// const agenda = createAgenda(false)

const app = new Elysia()
  .use(cors())
  .onError(({ code, error, set }) => {
    if (code === 'NOT_FOUND') {
      set.status = 404
      return error.message;
    }
  })
  .group("pipeline", (app) =>
    app
      .get('/', async () => {
        let data = (await db.pipeline.findMany({
          select: {
            id: true,
            name: true,
            cron: true
          }
        })).map((p) => {
          return new PipelineDto(p);
        })
        return data;
      })
      .post('/', async ({ body }) => {
        const newPipeline = (await db.pipeline.create({
          data: {
            name: body.name,
            cron: body.cron,
            tz: body.tz,
            query: body.query,
            emails: body.emails,
            outputFormat: body.format,
            outputSettings: body.formatSettings,
            connection: {
              create: {
                type: body.connectionType,
                conn: body.connection
              }
            }
          },
          select: {
            id: true,
            name: true,
            cron: true
          }
        }))
        //TODO: Encryption
        //TODO: VAULT
        //TODO: ADD QUEUES
        //TODO: 
        return new PipelineDto(newPipeline);
      }, {
        body: t.Object({
          name: t.String(),
          cron: t.String(),
          tz: t.String(),
          emails: t.Array(t.String()),
          query: t.String(),
          connection: t.String(),
          connectionType: t.Enum(ConnectionType),
          format: t.Union([t.Literal('CSV')]),
          formatSettings: t.Object({}),
          fileAvailability: t.String()
        })
      })
      .group('/:id',
        {
          params: t.Object({
            id: t.String({ format: 'uuid', error: 'Id not valid' })
          }),
          beforeHandle: (context: any) => {
            if (!context['pipeline'])
              throw new NotFoundError();
          }
        },
        (app) => app
          .derive(async ({ params }) => {
            if (!params)
              return { pipeline: undefined }
            const pipeline = (await db.pipeline.findUnique({
              where: {
                id: params.id
              },
              select: {
                id: true,
                name: true,
                cron: true,
                avgExecutionTime: true,
                avgProcessTime: true,
                avgQueryTime: true,
                avgFilesize: true
              }
            }))
            return {
              pipeline: pipeline
            }
          })
          .delete('/', async (context) => {
            if (!context.pipeline)
              throw new NotFoundError();

            const deletedPipeline = await db.pipeline.delete({ where: { id: context.pipeline.id } })
            await db.connection.delete({ where: { id: deletedPipeline.connectionId } })
            if (deletedPipeline)
              return { id: deletedPipeline.id }
            else
              throw new InternalServerError();
          })
          .get('/', async (context) => {
            return new PipelineDto(context.pipeline);
          })

          .get('/logs', async (context) => {
            return (await db.pipelineRun.findMany({
              select: {
                content: true,
                executedAt: true,
                status: true,
                executionTime: true,
              },
              skip: context.query.skip,
              take: context.query.take,
              where: {
                pipelineId: context.params.id
              }
            })).map(log => new PipelineLogDto(log))
          }, {
            query: t.Object({
              skip: t.Numeric(),
              take: t.Numeric()
            })
          })
          .get('/stats', async (context) => {
            return new PipelineStatsDto(context.pipeline);
          })
          .get('/runs', async (context) => {
            let mappedStatus: ('SUCCESS' | 'FAILED' | 'WARNING')[] = []
            if (context.query.status === 'ALL')
              mappedStatus = ['SUCCESS', 'FAILED', 'WARNING']
            if (context.query.status === 'SUCCESS')
              mappedStatus = ['SUCCESS', 'WARNING']
            if (context.query.status === 'FAILED')
              mappedStatus = ['FAILED']
            return (await db.pipelineRun.findMany({
              select: {
                executedAt: true,
                status: true,
                fileSize: true,
                processTime: true,
                queryTime: true,
                executionTime: true,
              },
              orderBy: {
                executedAt: 'asc'
              },
              skip: 0,
              take: 10,
              where: {
                pipelineId: context.params.id,
                status: {
                  in: mappedStatus
                }
              }
            })).map(run => new PipelineRunDto(run))
          }, {
            query: t.Object({
              status: t.Union([
                t.Literal('ALL'),
                t.Literal('SUCCESS'),
                t.Literal('FAILED')
              ]),
            })
          })
      )
  )
  .get('/enqueue', async (context) => {
    //TODO : Create this on pipeline creation
    // const test = await agenda.every('* * * * *', '1', { test: 'test' })
    // console.log(test)
    // return;
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
