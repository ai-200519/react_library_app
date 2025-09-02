import React from 'react'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { Calendar, CalendarClock, AlertCircle, UserRound, PenTool, User2, UserCog, User } from 'lucide-react'

const LendBorrowList = ({ title, books = [], type = 'lend', onSelect }) => {
  return (
    <div className="bg-dark-100/50 border border-light-100/20 rounded-xl p-4">
      <h4 className="text-white text-lg font-semibold mb-3">{title}</h4>
      {books.length === 0 ? (
        <div className="text-center max-w-md mx-auto space-y-3 py-6">
          <img src="/src/assets/reshot-icon-borrow-book-GJM3PD62HZ.svg" className='max-w-xs mx-auto ' alt="Book Banner" />
          <p className="text-sm text-light-200">Aucun élément pour le moment.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {books.map((b) => {
            const due = b.meta?.dueDate ? new Date(b.meta.dueDate) : null
            const now = new Date()
            const daysLeft = due ? Math.ceil((due - now) / (1000 * 60 * 60 * 24)) : null
            const isOverdue = typeof daysLeft === 'number' && daysLeft < 0
            const totalPages = Number(b.pages) || 1
            const pagesRead = Number(b.meta?.pagesRead) || 0
            const readingProgress = Math.min((pagesRead / totalPages) * 100, 100)
            const hasContext = ((b.meta?.lendTo || '').trim().length > 0) || ((b.meta?.borrowFrom || '').trim().length > 0)

            return (
            <li key={b.id} className="flex gap-3 p-3 rounded-lg bg-dark-100 border border-light-100/10 hover:bg-dark-100/80 transition cursor-pointer" onClick={() => onSelect && onSelect(b.id)}>
              <img
                src={b.imageUrl || "/src/assets/no-book.png"}
                alt={b.title}
                className="w-17 h-34 object-cover rounded cursor-pointer"
                onClick={(e) => { e.stopPropagation(); onSelect && onSelect(b.id) }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h5 className="text-white font-medium truncate pr-2">{b.title}</h5>
                  {b.publishedYear && (
                    <span className="text-sm text-light-200 flex-shrink-0">{b.publishedYear}</span>
                  )}
                </div>
                {b.author && (
                  <div className="text-[11px] text-light-200 truncate flex items-center gap-2">
                    <PenTool className="h-4 w-4" />
                    <Badge variant="outline" className=" text-light-300 border-light-100/30" >{b.author}</Badge>
                  </div>  
                )}
                <div className="text-sm text-light-200 mt-1 truncate flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {type === 'lend' ? (
                    <>Prêté à: <Badge variant="outline">{b.meta?.lendTo || '—'}</Badge></>
                  ) : (
                    <>Emprunté de: <Badge variant="outline">{b.meta?.borrowFrom || '—'}</Badge></>
                  )}
                </div>
                {due ? (
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4  text-light-300" />
                    <span className="text-sm text-light-300">{due.toLocaleDateString()}</span>
                    <Badge
                      variant="outline"
                      className={`${isOverdue ? 'border-red-400 text-red-400' : daysLeft === 0 ? 'border-yellow-400 text-yellow-400' : 'border-green-400 text-green-400'} px-2 py-0.5 text-[10px]`}
                    >
                      {isOverdue ? 'En retard' : daysLeft === 0 ? "Aujourd'hui" : `Dans ${daysLeft} j`}
                    </Badge>
                  </div>
                ) : hasContext ? (
                  <div className="mt-1 flex items-center gap-2">
                    <AlertCircle className="h-3 w-3 text-light-300" />
                    <Badge variant="outline" className="px-2 py-0.5 text-[13px] text-light-300 border-light-100/30">Échéance: —</Badge>
                  </div>
                ) : null}
                <div className="text-[13px] text-light-300 mt-1 flex items-center gap-2 flex-wrap">
                  <CalendarClock className="h-3 w-3" />
                  {b.meta?.dateStarted && (
                    <Badge variant="outline" className="px-2 py-0.5 text-[13px] border-light-100/30 text-light-300">
                      Débuté: {new Date(b.meta.dateStarted).toLocaleDateString()}
                    </Badge>
                  )}
                  {b.meta?.dateFinished && (
                    <Badge variant="outline" className="px-2 py-0.5 text-[10px] border-light-100/30 text-light-300">
                      Fini: {new Date(b.meta.dateFinished).toLocaleDateString()}
                    </Badge>
                  )}
                  {!b.meta?.dateStarted && !b.meta?.dateFinished && (
                    <Badge variant="outline" className="px-2 py-0.5 text-[13px] border-light-100/30 text-light-300">
                      Dates non définies
                    </Badge>
                  )}
                </div>

                <div className="mt-2">
                  <Progress value={readingProgress} className="bg-light-100/10 h-1.5" />
                  <div className="text-[13px] text-light-300 mt-1">Progression: {readingProgress > 0 ? Math.round(readingProgress) + "%" : "Not defined %"}</div>
                </div>   
              </div>
            </li>
          )})}
        </ul>
      )}
    </div>
  )
}

export default LendBorrowList


