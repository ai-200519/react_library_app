import React from 'react'
import { Button } from "@/components/ui/button"
import { Eye, Edit, Trash2, PenTool, CalendarFold } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from './ui/progress'

const BookCard = ({ book, onSelect, onEdit, onDelete }) => {
  const readingProgress = Math.min((book.meta?.pagesRead || 0) / (book.pages || 1) * 100, 100)

  return (
    <li className="flex gap-4 p-4 rounded-xl bg-dark-100 shadow-inner shadow-light-100/10 hover:bg-dark-100/70 transition">
      {/* Cover */}
      <img
        src={book.imageUrl || "/src/assets/no-book.png"}
        alt={book.title}
        className="w-30 h-50 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
        onClick={() => onSelect(book.id)}
      />

      {/* Right Column */}
      <div className="flex-1 space-y-2">
        {/* Title + Actions */}
        <div className="flex justify-between items-start">
          <h4 className="text-white cursor-pointer hover:text-light-200 font-bold text-xl line-clamp-1"
              onClick={() => onSelect(book.id)}>
            {book.title}
          </h4>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onSelect(book.id)}><Eye className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => onEdit(book)}><Edit className="h-4 w-4" /></Button>
            <Button variant="destructive" size="sm" onClick={() => onDelete(book)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        </div>

        {/* Author + Year */}
        <div className="text-sm text-light-200 flex items-center gap-2">
          <PenTool className="h-4 w-4" />
          <span>{book.author || "Auteur inconnu"}</span>
          {book.publishedYear && (
            <>
              <span>•</span>
              <CalendarFold className="h-4 w-4" />
              <span>{book.publishedYear}</span>
            </>
          )}
        </div>

        {/* Description */}
        <p className="text-light-300 text-sm line-clamp-2">{book.description || "Pas de description disponible."}</p>

        {/* Genre */}
        {book.genre && (
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-gradient-to-r from-[#D6C7FF] to-[#AB8BFF] text-primary">{book.genre}</Badge>
          </div>
        )}

        {/* Tags */}
        {book.meta?.tags?.length ? (
          <div className="flex flex-wrap gap-2 mt-2">
            {book.meta.tags.slice(0, 3).map((t) => (
              <Badge key={t} variant="outline" className="text-light-200 border-light-100/30">{t}</Badge>
            ))}
          </div>
        ) : (
          <Badge className="text-light-200 border-light-100/30">#notags 😒</Badge>
        )}

        {/* Progress */}
        <div className="mt-3">
          <Progress value={readingProgress} className="bg-light-100/10 h-2" />
          <p className="text-xs text-light-200 mt-1">Progression : {readingProgress > 0 ? Math.round(readingProgress) + "%" : "Not defined %"}</p>
        </div>
      </div>
    </li>
  )
}

export default BookCard
