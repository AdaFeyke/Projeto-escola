import { getUserSession } from "~/config/permission-manager";
import DashboardWrapper from "~/components/dashboard/DashboardWrapper";
import { getNameEscolaById } from "~/services/school/school.service";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getUserSession();
    const nomeEscola = await getNameEscolaById();

    return (
        <DashboardWrapper user={session} nomeEscola={nomeEscola}>
            {children}
        </DashboardWrapper>
    );
}