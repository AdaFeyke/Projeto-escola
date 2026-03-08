import { getAlunoDetails } from "~/services/students/aluno.service";
import { FichaAluno } from "~/components/students/FichaAluno";
import { PageHeader } from "~/components/ui/PageHeader";
import { getNameEscolaById } from "~/services/school/school.service";
import { User } from "lucide-react";

interface AlunoDetailsPageProps {
  params: Promise<{ alunoId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AlunoDetailsPage({
  params,
  searchParams,
}: AlunoDetailsPageProps) {
  const { alunoId } = await params;

  const alunoData = await getAlunoDetails(alunoId);
  const nomeEscola = await getNameEscolaById();

  if (!alunoData) {
    return <div className="p-8 text-center text-gray-500">Aluno não encontrado.</div>;
  }

  const serializedAluno = JSON.parse(JSON.stringify(alunoData));

  return (
    <>
      <PageHeader
        title="Ficha do Aluno"
        iconElement={<User className="w-7 h-7 md:w-8 md:h-8" />}
        backHref="/dashboard/students"
      />
      <FichaAluno user={serializedAluno} nomeEscola={nomeEscola} />
    </>
  );
}