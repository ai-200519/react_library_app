import React, { useEffect, useMemo, useState, useRef } from 'react'
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { BookOpen, Bookmark, Inbox, Calendar, Search, Book, Hash, ArrowRightLeft, Plus, Car, Barcode, BookCopy, Layers } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardTitle } from './ui/card'

const LibraryView = () => {
  const [userBooks, setUserBooks] = useState([])
  const [activeSection, setActiveSection] = useState("myBooks")
  const [isAddOpen, setIsAddOpen] = useState(false)

  const [details, setDetails] = useState({
    title: "",
    series: "",
    volume: "",
    authors: [""],
    publicationDate: "",
    coverUrl: "",
    isbnDigits: Array(13).fill(""),
    language: "",
    pages: "",
    genre: "",
    description: "",
  })

  const [notations, setNotations] = useState({
    pagesRead: 0,
    dateStarted: "",
    dateFinished: "",
    shelves: [],
    shelfInput: "",
    tags: [],
    tagInput: "",
    lendTo: "",
    borrowFrom: "",
  })

  // Load and persist user-created books
  useEffect(() => {
    const saved = localStorage.getItem("userBooks")
    if (saved) {
      try {
        setUserBooks(JSON.parse(saved))
      } catch {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("userBooks", JSON.stringify(userBooks))
  }, [userBooks])

  const totalPages = useMemo(() => Number.parseInt(details.pages || 0) || 0, [details.pages])

  const isbnValue = useMemo(() => details.isbnDigits.join("").replace(/[^0-9Xx]/g, "").toUpperCase(), [details.isbnDigits])

  const resetForms = () => {
    setDetails({
      title: "",
      series: "",
      volume: "",
      authors: [""],
      publicationDate: "",
      coverUrl: "",
      isbnDigits: Array(13).fill(""),
      language: "",
      pages: "",
      genre: "",
      description: "",
    })
    setNotations({
      pagesRead: 0,
      dateStarted: "",
      dateFinished: "",
      shelves: [],
      shelfInput: "",
      tags: [],
      tagInput: "",
      lendTo: "",
      borrowFrom: "",
    })
  }

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

  const isbnRefs = useRef([])

  const handleIsbnChange = (idx, value) => {
    const val = value.replace(/[^0-9Xx]/g, "").toUpperCase().slice(0, 1)
    setDetails((prev) => {
      const digits = [...prev.isbnDigits]
      digits[idx] = val
      return { ...prev, isbnDigits: digits }
    })
    if (val && idx < 12) {
      isbnRefs.current[idx + 1]?.focus()
    }
  }

  const handleIsbnKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !details.isbnDigits[idx] && idx > 0) {
      e.preventDefault()
      isbnRefs.current[idx - 1]?.focus()
    }
  }

  const handleAddShelf = () => {
    const name = (notations.shelfInput || "").trim()
    if (!name) return
    if (!notations.shelves.includes(name)) {
      setNotations((p) => ({ ...p, shelves: [...p.shelves, name], shelfInput: "" }))
    } else {
      setNotations((p) => ({ ...p, shelfInput: "" }))
    }
  }

  const removeShelf = (name) => {
    setNotations((p) => ({ ...p, shelves: p.shelves.filter((s) => s !== name) }))
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

  const canSave = useMemo(() => {
    if (!details.title.trim()) return false
    if (notations.pagesRead > totalPages && totalPages > 0) return false
    return true
  }, [details.title, notations.pagesRead, totalPages])

  const handleSave = () => {
    if (!canSave) return
    const book = {
      id: `user-${Date.now()}`,
      title: details.title.trim(),
      author: details.authors.filter(Boolean).join(", ") || "Auteur inconnu",
      publishedYear: details.publicationDate ? new Date(details.publicationDate).getFullYear() : new Date().getFullYear(),
      isbn: isbnValue,
      genre: details.genre || "Other",
      description: details.description || "",
      imageUrl: details.coverUrl || null,
      language: details.language || "",
      pages: totalPages,
      series: details.series || "",
      volume: details.volume || "",
      meta: {
        ...notations,
        shelves: [...notations.shelves],
        tags: [...notations.tags],
      },
      rating: (Math.random() * 2 + 3).toFixed(1),
    }
    setUserBooks((prev) => [book, ...prev])
    setIsAddOpen(false)
    resetForms()
  }

  const items = [
    { id: "myBooks", title: "My Books", titledescription: "Tous vos livres", icon: BookCopy },
    { id: "shelves", title: "Shelves", titledescription: "Vos étagères", icon: Layers },
    { id: "lendBorrow", title: "Lend/Borrow", titledescription: "Emprunter/Rendre", icon: ArrowRightLeft },
    { id: "tags", title: "Tags Personnels", titledescription: "Vos tags personnels", icon: Hash },
  ]

  const shelvesMap = useMemo(() => {
    const map = new Map()
    for (const b of userBooks) {
      const shelves = b.meta?.shelves || []
      for (const s of shelves) {
        if (!map.has(s)) map.set(s, [])
        map.get(s).push(b)
      }
    }
    return map
  }, [userBooks])

  const tagsMap = useMemo(() => {
    const map = new Map()
    for (const b of userBooks) {
      const tags = b.meta?.tags || []
      for (const t of tags) {
        if (!map.has(t)) map.set(t, [])
        map.get(t).push(b)
      }
    }
    return map
  }, [userBooks])

  const lendList = useMemo(() => userBooks.filter((b) => (b.meta?.lendTo || "").trim()), [userBooks])
  const borrowList = useMemo(() => userBooks.filter((b) => (b.meta?.borrowFrom || "").trim()), [userBooks])
  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1">
            <BookOpen className="h-4 w-4" />
            <span className="text-sm font-semibold">Titre de logo</span>
          </div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className=" text-lg font-semibold text-foreground mt-2">Side Menu</SidebarGroupLabel>
            <SidebarGroupLabel className="text-sm text-muted-foreground">Organisez votre collection</SidebarGroupLabel>
            <SidebarSeparator className="my-2" />
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton isActive={activeSection === item.id} onClick={() => setActiveSection(item.id)}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarRail />
      </Sidebar>
      <SidebarInset className="bg-primary">
        <div className="p-4">
          <div className="flex items-center justify-between gap-2 mb-4">
            <SidebarTrigger />
            <h2>Bibliothèque</h2>
            {/* Global Add Book trigger - always accessible */}
            <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
              <SheetTrigger asChild>
                <Button variant="muted"  className="ml-auto">
                  <Plus className="h-4 w-4" />
                  Ajouter un livre
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-primary text-white sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Créer un livre</SheetTitle>
                </SheetHeader>
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
                          <label className="text-xs text-light-2 00">Date de publication</label>
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
                      </div>
                      <div>
                        <label className="text-xs text-light-200">ISBN (OTP)</label>
                        <div className="flex gap-1 flex-wrap">
                          {details.isbnDigits.map((d, i) => (
                            <Input
                              key={i}
                              ref={(el) => (isbnRefs.current[i] = el)}
                              className="w-8 text-center"
                              value={d}
                              onChange={(e) => handleIsbnChange(i, e.target.value)}
                              onKeyDown={(e) => handleIsbnKeyDown(i, e)}
                              maxLength={1}
                              inputMode="numeric"
                              placeholder="_"
                            />
                          ))}
                        </div>
                        <p className="text-[10px] text-light-200 mt-1">Saisissez 13 caractères (chiffres).</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-light-200">Pages</label>
                          <Input type="number" min="0" value={details.pages} onChange={(e) => setDetails((p) => ({ ...p, pages: e.target.value }))} placeholder="Ex: 320" />
                        </div>
                        <div>
                          <label className="text-xs text-light-200">Genre</label>
                          <Input value={details.genre} onChange={(e) => setDetails((p) => ({ ...p, genre: e.target.value }))} placeholder="Ex: Fantasy" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-light-200">Description</label>
                        <textarea
                          rows={3}
                          className="file:text-foreground placeholder:text-muted-foreground selection:bg-[#AB8BFF] selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
                          value={details.description}
                          onChange={(e) => setDetails((p) => ({ ...p, description: e.target.value }))}
                          placeholder="Brève description"/>
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
                          className="w-full accent-[#AB8BFF]"/>
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
                            <Input value={notations.shelfInput} onChange={(e) => setNotations((p) => ({ ...p, shelfInput: e.target.value }))} placeholder="Ex: Salon, Pile à lire..." />
                          </div>
                          <Button variant="outline" size="sm" onClick={handleAddShelf}>Ajouter</Button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {notations.shelves.map((s) => (
                            <Badge key={s} variant="secondary" className="cursor-default">
                              {s}
                              <button className="ml-1 text-xs" onClick={() => removeShelf(s)}>×</button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
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
                    </TabsContent>
                  </Tabs>
                </div>
                <SheetFooter>
                  <div className="flex items-center gap-2">
                    <Button variant="muted" onClick={() => { setIsAddOpen(false); resetForms() }}>Annuler</Button>
                    <Button variant="secondary" onClick={handleSave} disabled={!canSave}>Enregistrer</Button>
                  </div>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
          <div className='text-amber-50'>
            {activeSection === "myBooks" && (
              <>
                <h3 className="text-white text-2xl font-semibold mb-2">Mes livres</h3>
                <span>Tous vos livres dams un emplacement</span>
                <Separator className="my-2 bg-light-100/20" />              
                {userBooks.length === 0 ? (
                  <header className="text-center max-w-md mx-auto space-y-3">
                    <img src="/src/assets/no-mybooks-no.png" className='max-w-xs mx-auto' alt="Book Banner" />
                    <h4 className="text-white font-semibold">Aucun livre créé</h4>
                    <p className="text-light-200 text-l">Essayez de créer un livre en utilisant ces fonctionnalités.</p>
                    <p className="text-sm">Cliquez sur <span className="text-gradient">« Ajouter un livre »</span> ou depuis la section <span className="text-gradient">« Accueil »</span>.</p>
                  </header>
                ) : (
                  <ul className="grid grid-cols-1 gap-2 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {userBooks.map((book) => (
                      <li key={book.id} className="bg-dark-100 p-2 rounded-xl shadow-inner shadow-light-100/10">
                        <img src={book.imageUrl || "/src/assets/no-book.png"} alt={book.title} className="rounded-lg w-full h-auto object-cover" />
                        <h4 className="text-white font-bold text-sm mt-2 line-clamp-1">{book.title}</h4>
                        <div className="text-xs text-gray-100 flex items-center gap-1">
                          <span>{book.author}</span>
                          <span>•</span>
                          <span>{book.publishedYear}</span>
                        </div>
                        {book.meta?.tags?.length ? (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {book.meta.tags.slice(0, 3).map((t) => (
                              <Badge key={t} variant="outline" className="text-light-200 border-light-100/30">{t}</Badge>
                            ))}
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            {activeSection === "shelves" && (
              <>
                <h3 className="text-white text-2xl font-semibold mb-2">Étagères</h3>
                <span>Vos étagères, votre royaume ... Organisez vos collections des livres en des Shelves</span>
                <Separator className="my-2 bg-light-100/20" />
                {shelvesMap.size === 0 ? (
                  <header className="text-center max-w-md mx-auto space-y-3">
                    <img src="/src/assets/no-mybooks-no.png" className='max-w-xs mx-auto' alt="Book Banner" />
                    <h4 className="text-white font-semibold">Aucune Shelve.</h4>
                    <p className="text-sm text-light-200"> </p>
                    <p className=" text-l">Ajoutez-en via <span className="text-gradient">l'onglet Notations </span> .</p>
                  </header>
                ) : (
                  Array.from(shelvesMap.entries()).map(([shelf, books]) => (
                    <div key={shelf} className="mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{shelf}</Badge>
                        <span className="text-xs text-gray-100">{books.length} livre(s)</span>
                      </div>
                      <ul className="mt-2 grid grid-cols-1 gap-2 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {books.map((book) => (
                          <li key={book.id} className="bg-dark-100 p-2 rounded-xl shadow-inner shadow-light-100/10">
                            <img src={book.imageUrl || "/src/assets/no-book.png"} alt={book.title} className="rounded-lg w-full h-auto object-cover" />
                            <h4 className="text-white font-bold text-sm mt-2 line-clamp-1">{book.title}</h4>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </>
            )}

            {activeSection === "lendBorrow" && (
              <>
                <h3 className="text-white text-2xl font-semibold mb-2">Prêts et Emprunts</h3>
                <span>Empruntez des livres près de chez vous et prêtez les vôtres </span>                
                <Separator className="my-2 bg-light-100/20" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Card>
                    <h1 className="flex flex-auto justify-center items-center font-bold">Prêté à</h1>
                    {lendList.length === 0 ? (
                      <header className="text-center max-w-md mx-auto space-y-3">
                        <img src="/src/assets/reshot-icon-borrow-book-GJM3PD62HZ.svg" className='max-w-xs mx-auto ' alt="Book Banner" />
                        <p className=" text-l">Liste des livres Prêtés/Empruntés est vide .</p>
                      </header>
                    ) : (
                      <ul className="mt-2 space-y-2">
                        {lendList.map((b) => (
                          <li key={b.id} className="bg-dark-100 p-2 rounded-md">
                            <div className="text-sm text-white">{b.title}</div>
                            <div className="text-xs text-light-200">{b.meta.lendTo}</div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Card>
                  <Card>
                    <h1 className="flex flex-auto justify-center items-center font-bold">Emprunté par</h1>
                    {borrowList.length === 0 ? (
                      <header className="text-center max-w-md mx-auto space-y-3">
                        <img src="/src/assets/reshot-icon-borrow-book-GJM3PD62HZ.svg" className='max-w-xs mx-auto ' alt="Book Banner" />
                        <p className=" text-l">Liste des livres Empruntés/Prêtés est vide .</p>
                      </header>
                    ) : (
                      <ul className="mt-2 space-y-2">
                        {borrowList.map((b) => (
                          <li key={b.id} className="bg-dark-100 p-2 rounded-md">
                            <div className="text-sm text-white">{b.title}</div>
                            <div className="text-xs text-light-200">{b.meta.borrowFrom}</div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Card>
                </div>
              </>
            )}

            {activeSection === "tags" && (
              <>
                <h3 className="text-white text-2xl font-semibold mb-2">Tags</h3>
                <span>Organisez vos livres par catégories</span>                
                <Separator className="my-2 bg-light-100/20" />
                {tagsMap.size === 0 ? (
                  <header className="text-center max-w-md mx-auto space-y-3">
                    <img src="/src/assets/3D Hashtag.png" className='max-w-xs mx-auto' alt="Book Banner" />
                    <h4 className="text-white font-semibold">Aucun # tag.</h4>
                    <p className=" text-l">Ajoutez-en via l'onglet <span className="text-gradient"> Notations</span>.</p>
                  </header>                  
                ) : (
                  Array.from(tagsMap.entries()).map(([tag, books]) => (
                    <div key={tag} className="mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-light-200 border-light-100/30">{tag}</Badge>
                        <span className="text-xs text-gray-100">{books.length} livre(s)</span>
                      </div>
                      <ul className="mt-2 grid grid-cols-1 gap-2 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {books.map((book) => (
                          <li key={book.id} className="bg-dark-100 p-2 rounded-xl shadow-inner shadow-light-100/10">
                            <img src={book.imageUrl || "/src/assets/no-book.png"} alt={book.title} className="rounded-lg w-full h-auto object-cover" />
                            <h4 className="text-white font-bold text-sm mt-2 line-clamp-1">{book.title}</h4>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
    
  )
}

export default LibraryView