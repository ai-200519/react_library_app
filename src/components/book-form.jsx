import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from "@/components/ui/select"
import { formatISBN } from '@/lib/isbn'

const BookForm = forwardRef(function BookForm({ book, onSave, onCanSaveChange, shelves=[] }, ref) {
  const [details, setDetails] = useState({
    title: "",
    series: "",
    volume: "",
    authors: [""],
    publicationDate: "",
    coverUrl: "",
    isbn: "",
    language: "",
    pages: "",
    genre: "",
    description: "",
  })

  const [notations, setNotations] = useState({
    pagesRead: 0,
    dateStarted: "",
    dateFinished: "",
    shelfId : "",
    shelfInput: "",
    tags: [],
    tagInput: "",
    lendTo: "",
    borrowFrom: "",
    dateAdded: "",
  })

  const totalPages = useMemo(() => Number.parseInt(details.pages || 0) || 0, [details.pages])

  useEffect(() => {
    if (book) {
      setDetails({
        title: book.title || "",
        series: book.series || "",
        volume: book.volume || "",
        authors: book.author ? book.author.split(", ") : [""],
        publicationDate: book.publicationDate || "",
        coverUrl: book.imageUrl || "",
        isbn: (book.isbn || "").replace(/[^0-9Xx]/g, "").toUpperCase(),
        language: book.language || "",
        pages: String(book.pages || ""),
        genre: book.genre || "",
        description: book.description || "",
      })
      setNotations({
        pagesRead: book.meta?.pagesRead || 0,
        dateStarted: book.meta?.dateStarted || "",
        dateFinished: book.meta?.dateFinished || "",
        // FIX: Handle shelves array properly - take first shelf ID or empty string
        shelves: (book.meta?.shelves && Array.isArray(book.meta.shelves) && book.meta.shelves.length > 0) 
          ? book.meta.shelves[0] 
          : "",
        shelfInput: "",
        tags: book.meta?.tags || [],
        tagInput: "",
        lendTo: book.meta?.lendTo || "",
        borrowFrom: book.meta?.borrowFrom || "",
        dateAdded: book.meta?.dateAdded || "",
      })
    }
  }, [book])

  const handleAddAuthor = () => {
    setDetails((prev) => ({ ...prev, authors: [...prev.authors, ""] }))
  }

  const handleRemoveAuthor = (index) => {
    setDetails((prev) => ({ ...prev, authors: prev.authors.filter((_, i) => i !== index) }))
  }

  const handleAuthorChange = (index, value) => {
    setDetails((prev) => {
      const authors = [...prev.authors]
      authors[index] = value
      return { ...prev, authors }
    })
  }


  const handleAddTag = () => {
    let t = (notations.tagInput || "").trim()
    if (!t) return
    if (!t.startsWith("#")) t = `#${t}`
    if (!notations.tags.includes(t)) {
      setNotations((p) => ({ ...p, tags: [...p.tags, t], tagInput: "" }))
    } else {
      setNotations((p) => ({ ...p, tagInput: "" }))
    }
  }

  const removeTag = (t) => {
    setNotations((p) => ({ ...p, tags: p.tags.filter((x) => x !== t) }))
  }
    
  const [errors, setErrors] = useState({})

  const validateISBN = (isbn) => {
    const cleanISBN = (isbn || "").replace(/[^0-9Xx]/g, "").toUpperCase()

    if (cleanISBN.length === 10) {
      return /^[0-9]{9}[0-9X]$/.test(cleanISBN)
    }

    if (cleanISBN.length === 13) {
      return /^(978|979)[0-9]{10}$/.test(cleanISBN)
    } 

    return false
  }



  const handleISBNChange = (value) => {
    const clean = value.replace(/[^0-9Xx]/g, "").toUpperCase()
    setDetails((p) => ({ ...p, isbn: clean }))

    if (clean && !validateISBN(clean)){
      setErrors((prev) => ({...prev, isbn: "Format ISBN Invalide."}) )
    } else {
      setErrors((prev) => {
        const { isbn, ...rest } = prev
        return rest
      })
    }
  }
  
  const validateForm = () => {
    const newErrors = {}
    if (!details.title.trim()) {
      newErrors.title = "Le titre ne peut pas etre vide."
    }
    if (details.isbn && !validateISBN(details.isbn)) {
      newErrors.isbn = "Format ISBN invalide (ISBN-13 commence par 978/979, ISBN-10 accepté)."
    }
    if (details.coverUrl && !/^https?:\/\/.+\/.+/i.test(details.coverUrl)) {
      newErrors.coverUrl = "L'URL de la couverture doit etre une URL valide d'image."
    }
    setErrors(newErrors)
    return { ok: Object.keys(newErrors).length === 0, errors: newErrors }
}

  const canSave = useMemo(() => {
    if (!details.title.trim()) return false
    if (notations.pagesRead > totalPages && totalPages > 0) return false
    if (details.isbn && !validateISBN(details.isbn)) return false
    return true
  }, [details.title, details.isbn, notations.pagesRead, totalPages])

  useEffect(() => {
    onCanSaveChange && onCanSaveChange(canSave)
  }, [canSave, onCanSaveChange])

  const buildBook = () => {
    const shelfId = notations.shelves || ""
    const shelfName = shelves.find((s) => s.id === shelfId)?.name || ""
    
    return {
      id: book?.id || `user-${Date.now()}`,
      title: details.title.trim(),
      author: details.authors.filter(Boolean).join(", ") || "Auteur inconnu",
      publicationDate: details.publicationDate || "",      
      publishedYear: details.publicationDate ? new Date(details.publicationDate).getFullYear() : new Date().getFullYear(),
      isbn: details.isbn,
      genre: details.genre || "Non specifiee",
      description: details.description || "",
      imageUrl: details.coverUrl || "\\src\\assets\\no-book.png",
      language: details.language || "", 
      pages: totalPages,
      series: details.series || "",
      volume: details.volume || "",
      meta: {
        ...notations,
        shelves: shelfId ? [shelfId] : [],
        shelfName: shelfName,
        tags: [...notations.tags],
        dateAdded: notations.dateAdded || new Date().toISOString(),
      },
      rating: (Math.random() * 2 + 3).toFixed(1),
    }
  }
  const submit = () => {
    const { ok, errors: latestErrors } = validateForm()
    if (!ok) return { ok: false, errors: latestErrors }
    const newBook = buildBook()
    onSave && onSave(newBook)
    return { ok: true, book: newBook }
  }

  const reset = () => {
    setDetails({
      title: "",
      series: "",
      volume: "",
      authors: [""],
      publicationDate: "",  
      coverUrl: "",
      isbn: "",
      language: "",
      pages: "",
      genre: "",
      description: "",
    })
    setNotations({
      pagesRead: 0,
      dateStarted: "",
      dateFinished: "",
      shelfId: "",  
      tags: [],
      tagInput: "",
      lendTo: "",
      borrowFrom: "",
      dateAdded: "",
    })
    setErrors({})
  }

  useImperativeHandle(ref, () => ({ submit, reset, getCanSave: () => canSave }))

  return (
    <div className="px-4 pb-4 space-y-4 overflow-y-auto">
      <Tabs defaultValue="details">
        <TabsList className="bg-dark-100/40">
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="notations">Notations</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="mt-3 space-y-3">
          <div>
            <label className="text-xs text-light-200">Titre</label>
            <Input value={details.title} onChange={(e) => setDetails((p) => ({ ...p, title: e.target.value }))} placeholder="Titre du livre" />
            {errors.title && <p className="text-[10px] text-red-400 mt-1">{errors.title}</p>}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-light-200">Série</label>
              <Input value={details.series} onChange={(e) => setDetails((p) => ({ ...p, series: e.target.value }))} placeholder="Nom de la série (optionnel)" />
            </div>
            <div>
              <label className="text-xs text-light-200">Volume</label>
              <Input type="number" value={details.volume} onChange={(e) => setDetails((p) => ({ ...p, volume: e.target.value }))} placeholder="Ex: 1" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-light-200">Auteur(s)</label>
              <Button variant="outline" size="icon-sm" onClick={handleAddAuthor}>+</Button>
            </div>
            <div className="space-y-1">
              {details.authors.map((a, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input value={a} onChange={(e) => handleAuthorChange(idx, e.target.value)} placeholder={`Auteur ${idx + 1}`} />
                  {details.authors.length > 1 && (
                    <Button variant="ghost" size="icon-sm" onClick={() => handleRemoveAuthor(idx)}>×</Button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-light-200">Date de publication</label>
              <Input type="date" value={details.publicationDate} onChange={(e) => setDetails((p) => ({ ...p, publicationDate: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-light-200">Langue</label>
              <Input value={details.language} onChange={(e) => setDetails((p) => ({ ...p, language: e.target.value }))} placeholder="Ex: Français" />
            </div>
          </div>
          <div>
            <label className="text-xs text-light-200">URL de couverture</label>
            <Input type="url" value={details.coverUrl} onChange={(e) => setDetails((p) => ({ ...p, coverUrl: e.target.value }))} placeholder="https://..." />
            {errors.coverUrl && <p className="text-[10px] text-red-400 mt-1">{errors.coverUrl}</p>}
          </div>
          <div>
            <label className="text-xs text-light-200">ISBN</label>
            <Input value={formatISBN(details.isbn)} onChange={(e) => handleISBNChange(e.target.value)} placeholder="978-1-4028-9462-6" />
            {errors.isbn && <p className="text-[10px] text-red-400 mt-1">{errors.isbn}</p>}
            <p className="text-[10px] text-light-200 mt-1">Saisissez un ISBN-10 ou ISBN-13 (format libre).</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-light-200">Pages</label>
              <Input type="number" min="0" value={details.pages} onChange={(e) => setDetails((p) => ({ ...p, pages: e.target.value }))} placeholder="Ex: 320" />
            </div>
            <div>
              <label className="text-xs text-light-200">Genre</label>
              <Select value={details.genre} onValueChange={(value) => setDetails((p) => ({ ...p, genre: value }))} placeholder="Sélectionnez un genre">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionnez un genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="Fiction">Fiction</SelectItem>
                    <SelectItem value="Non-fiction">Non-fiction</SelectItem>
                    <SelectItem value="Classique">Classique</SelectItem>
                    <SelectItem value="Science-fiction">Science-fiction</SelectItem>
                    <SelectItem value="Fantasy">Fantasy</SelectItem>
                    <SelectItem value="Romance">Romance</SelectItem>
                    <SelectItem value="Thriller">Thriller</SelectItem>
                    <SelectItem value="Biographie">Biographie</SelectItem>
                    <SelectItem value="Histoire">Histoire</SelectItem>
                    <SelectItem value="Philosophie">Philosophie</SelectItem>
                    <SelectItem value="Autre">Autre</SelectItem>
                  </SelectGroup>  
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-xs text-light-200">Description</label>
            <textarea
              rows={3}
              className="file:text-foreground placeholder:text-muted-foreground selection:bg-[#AB8BFF] selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
              value={details.description}
              onChange={(e) => setDetails((p) => ({ ...p, description: e.target.value }))}
              placeholder="Ajouter une description de livre ..."
            />
          </div>
        </TabsContent>
        <TabsContent value="notations" className="mt-3 space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs text-light-200">Pages lues</label>
              <span className="text-xs text-light-200">{notations.pagesRead}/{totalPages || 0}</span>
            </div>
            <input
              type="range"
              min={0}
              max={Math.max(totalPages || 0, 0)}
              value={Math.min(notations.pagesRead, totalPages || 0)}
              onChange={(e) => setNotations((p) => ({ ...p, pagesRead: Number.parseInt(e.target.value) || 0 }))}
              className="w-full accent-[#AB8BFF]"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-light-200">Date début</label>
              <Input type="date" value={notations.dateStarted} onChange={(e) => setNotations((p) => ({ ...p, dateStarted: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-light-200">Date fin</label>
              <Input type="date" value={notations.dateFinished} onChange={(e) => setNotations((p) => ({ ...p, dateFinished: e.target.value }))} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="text-xs text-light-200">Étagères</label>
                <Select
                  value={notations.shelves || ""}
                  onValueChange={(value) => setNotations((p) => ({ ...p, shelves: value }))}
                > 
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choisissez une étagère" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {shelves.map((shelf) => (
                        <SelectItem key={shelf.id} value={shelf.id}>
                          {shelf.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="flex flex-1 justify-around items-center gap-2 ">
                <label className="text-xs text-light-200">Tags</label>
                <Input value={notations.tagInput} onChange={(e) => setNotations((p) => ({ ...p, tagInput: e.target.value }))} placeholder="#tag" />
              </div>
              <Button variant="outline" size="sm" onClick={handleAddTag}>Ajouter</Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {notations.tags.map((t) => (
                <Badge key={t} className="cursor-default">
                  {t}
                  <button className="ml-1 text-xs" onClick={() => removeTag(t)}>×</button>
                </Badge>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-light-200">Prêté à</label>
              <Input value={notations.lendTo} onChange={(e) => setNotations((p) => ({ ...p, lendTo: e.target.value }))} placeholder="Nom" />  
            </div>
            <div>
              <label className="text-xs text-light-200">Emprunté par</label>
              <Input value={notations.borrowFrom} onChange={(e) => setNotations((p) => ({ ...p, borrowFrom: e.target.value }))} placeholder="Nom" />
            </div>
          </div>
          <div>
            <label className="text-xs text-light-200">Date d'ajout</label>
            <Input type="datetime-local" value={notations.dateAdded} onChange={(e) => setNotations((p) => ({ ...p, dateAdded: e.target.value }))} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
})

export default BookForm

