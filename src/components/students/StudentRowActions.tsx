"use client";

import { Edit, Trash2, FileUser, MoreHorizontal } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

interface StudentRowActionsProps {
  id: string;
  onView: (id: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function StudentRowActions({
  id,
  onView,
  onEdit,
  onDelete,
}: StudentRowActionsProps) {
  return (
    <div className="flex justify-end gap-1 w-full">
      <div className="hidden md:flex gap-1">
        <Button variant="outline" size="icon" title="Ver Ficha" onClick={() => onView(id)}>
          <FileUser className="w-4 h-4 text-green-500" />
        </Button>

        <Button variant="outline" size="icon" title="Editar" onClick={onEdit}>
          <Edit className="w-4 h-4" />
        </Button>

        <Button variant="destructive" size="icon" title="Excluir" onClick={onDelete}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(id)}>
              <FileUser className="w-4 h-4 mr-2 text-green-500" />
              Ver Ficha
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete}>
              <Trash2 className="w-4 h-4 mr-2 text-red-500" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
