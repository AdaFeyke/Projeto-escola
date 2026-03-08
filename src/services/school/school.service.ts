'use server';

import prisma from '~/lib/prisma';
import { getCurrentEscolaId } from '~/config/permission-manager'

export async function getNameEscolaById() {
  try {
    const escolaId = await getCurrentEscolaId();

    const escola = await prisma.escola.findUnique({
      where: {
        id: escolaId
      },
      select: {
        nome: true
      }
    });

    return escola?.nome || "Escola não encontrada";

  } catch (error) {
    console.error("Erro ao buscar a escola", error);
    return "Erro ao carregar nome";
  }
}