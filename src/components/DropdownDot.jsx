import { MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

/**
 * Reusable 3-dots dropdown menu for Tags or Shelves
 *
 * @param {string} type - "tag" | "shelf"
 * @param {string} name - the tag or shelf name
 * @param {Array} userBooks - all books
 * @param {Function} setUserBooks - state setter
 */
export default function DropdownDot({ onRenameClick, onDeleteClick }) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onRenameClick}>Renommer</DropdownMenuItem>
          <DropdownMenuItem onClick={onDeleteClick}>Supprimer</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
  