import { Edit, MoreHorizontal, Trash, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import { Button } from "@/components/ui/button"

export default function DropdownDot({ onRenameClick, onDeleteClick }) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="text-light-200 hover:bg-light-100/10 focus:bg-light-100/10" onClick={onRenameClick}>
          <Edit className="mr-2 h-4 w-4" />          
            Renommer
          </DropdownMenuItem>
          <DropdownMenuItem className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10" onClick={onDeleteClick}>
          <Trash2 className="mr-2 h-4 w-4" />          
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
  