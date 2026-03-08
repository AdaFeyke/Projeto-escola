import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { formatDisplayDate } from "~/utils/date-utils";
import { StudentRowActions } from "./StudentRowActions";
import type { AlunoTabela } from "~/services/students/aluno.service.types"

interface StudentsTableProps {
  isAdmin: boolean;
  onView: (id: string) => void;
  onEdit: (student: AlunoTabela) => void;
  onDelete: (student: AlunoTabela) => void;
}

export const getStudentColumns = ({
  isAdmin,
  onView,
  onEdit,
  onDelete,
}: StudentsTableProps): ColumnDef<AlunoTabela>[] => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) =>
            table.toggleAllPageRowsSelected(!!value)
          }
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "nome",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "dataNascimento",
      header: "Data de Nascimento",
      cell: ({ getValue }) =>
      formatDisplayDate(getValue<Date | string | null>()),
      enableSorting: false,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        if (!isAdmin) return null;

        return (
          <StudentRowActions
            id={row.original.id}
            onView={onView}
            onEdit={() => onEdit(row.original)}
            onDelete={() => onDelete(row.original)}
          />
        );
      },
    },
  ];
