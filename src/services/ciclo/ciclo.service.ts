import db from '~/lib/db';
import { cicloLetivo } from '~/lib/schema';
import { asc } from 'drizzle-orm';

export async function getCiclosAtuais() {
    return await db.query.cicloLetivo.findMany({
        with: {
            anoLetivo: true,
        },
        orderBy: [asc(cicloLetivo.dataInicio)],
    });
}