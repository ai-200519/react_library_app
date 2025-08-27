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
import { BookOpen, Hash, ArrowRightLeft, Plus, BookCopy, Layers, Trash2, Pencil, Eye, Edit, PenTool, Calendar1, CalendarCog, CalendarFold, Tag, Tags, TagsIcon, MoreHorizontal, BookHeart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card } from './ui/card'
import { toast } from 'sonner'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

import BookForm from './book-form'
import { Progress } from './ui/progress'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './ui/breadcrumb'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import DropdownDot from './DropdownDot'
import BookCard from './book-card'


const LibraryView = ({ onBookSelect, onBack }) => {
  const [userBooks, setUserBooks] = useState([])
  const [activeSection, setActiveSection] = useState("myBooks")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const bookFormRef = useRef(null)
  const [canSaveForm, setCanSaveForm] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [selectedTag, setSelectedTag] = useState(null);
  const [dialogTag, setDialogTag] = useState(null); // tag being renamed
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const handleRenameConfirm = () => {
    if (!newName || newName === dialogTag) {
      toast.error("Renommage annulé");
      setIsDialogOpen(false);
      return;
    }
  
    // Ensure tag starts with #
    const normalizedName = newName.startsWith("#") ? newName : `#${newName}`;
  
    const updatedBooks = userBooks.map((b) => {
      const values = b.meta?.tags || [];
      if (values.includes(dialogTag)) {
        return {
          ...b,
          meta: {
            ...b.meta,
            tags: values.map((t) => (t === dialogTag ? normalizedName : t)),
          },
        };
      }
      return b;
    });
  
    setUserBooks(updatedBooks);
    toast.success(`Tag renommé en "${normalizedName}"`);
    setIsDialogOpen(false);
  };
  
  const handleDeleteTag = (tag) => {
    toast(`Supprimer le tag "${tag}" ?`, {
      description: "Cette action ne peut pas être annulée.",
      action: {
        label: "Supprimer",
        onClick: () => {
          const updatedBooks = userBooks.map(b => {
            return {
              ...b,
              meta: {
                ...b.meta,
                tags: (b.meta?.tags || []).filter(t => t !== tag)
              }
            }
          })
          setUserBooks(updatedBooks)
          toast.success(`Tag "${tag}" supprimé`)
        }
      },
      cancel: { label: "Annuler", onClick: () => toast.dismiss() },
      duration: 8000
    })
  }
  

  // Load and persist user-created books
  useEffect(() => {
    const saved = localStorage.getItem("userBooks")
    if (saved) {
      try {
        setUserBooks(JSON.parse(saved))
      } catch(err) {
        console.error("Failed to parse userBooks from localStorage", err)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("userBooks", JSON.stringify(userBooks))
  }, [userBooks])

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

  const openEditBook = (book) => {
    setEditingBook(book)
    setIsAddOpen(true)
  }

  const handleDeleteBook = (book) => {
    if (!book) return

    // Show confirmation toast with action buttons
    toast(`Supprimer "${book.title}" ?`, {
      description: "Cette action ne peut pas être annulée.",
      action: {
        label: "Supprimer",
        onClick: () => {
          // Perform the deletion
          const updatedBooks = userBooks.filter(b => b.id !== book.id)
          setUserBooks(updatedBooks)
          
          // Show success toast
          toast.success("Livre supprimé", {
            description: `"${book.title}" a été supprimé de votre bibliothèque.`
          })
          
          // Navigate back
          if (onBack) setTimeout(() => onBack(), 1000)
        },
      },
      cancel: {
        label: "Annuler",
        onClick: () => {
          toast.dismiss()
        }
      },
      duration: 10000, // Give user time to decide
    })
  }

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
            <Sheet open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) setEditingBook(null) }}>
              <SheetTrigger asChild>
                <Button
                  variant="muted"
                  className="ml-auto"
                  onClick={() => {
                    setEditingBook(null)
                    setIsAddOpen(true)
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Ajouter un livre
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-primary text-white sm:max-w-md" aria-describedby="book-form-desc">
                <SheetHeader>
                  <SheetTitle>{editingBook ? 'Modifier le livre' : 'Créer un livre'}</SheetTitle>
                </SheetHeader>
                <p id="book-form-desc" className="sr-only">Remplissez les champs pour {editingBook ? 'modifier' : 'créer'} un livre dans votre bibliothèque.</p>
                <BookForm
                  key={editingBook ? `edit-${editingBook.id}` : 'new'}
                  ref={bookFormRef}
                  book={editingBook || undefined}
                  onCanSaveChange={setCanSaveForm}
                  onSave={(newBook) => {
                    setUserBooks((prev) => {
                      if (editingBook) {
                        return prev.map((b) => (b.id === newBook.id ? newBook : b))
                      }
                      return [newBook, ...prev]
                    })
                    setIsAddOpen(false)
                    setEditingBook(null)
                    bookFormRef.current?.reset()
                  }}
                />
                <SheetFooter>
                  <div className="flex items-center gap-2">
                    <Button variant="muted" onClick={() => { setIsAddOpen(false); setEditingBook(null); bookFormRef.current?.reset() }}>Annuler</Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        if (!bookFormRef.current) return
                        const { ok } = bookFormRef.current.submit() // call the form's submit
                        if (ok) {
                          toast.success("Livre mis à jour") // Sonner toast
                          setIsAddOpen(false)
                          setEditingBook(null)
                        } else {
                          toast.error("Erreur : vérifiez les champs du livre")
                        }    
                      }}
                      disabled={!canSaveForm}
                    >
                      {editingBook ? 'Mettre à jour' : 'Enregistrer'}
                    </Button>
                  </div>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>

          <div className='text-amber-50'>
            {activeSection === "myBooks" && (
              <>
                <h3 className="text-white text-2xl font-semibold mb-2">Mes livres</h3>
                <span>Tous vos livres dans un emplacement</span>
                <Separator className="my-2 bg-light-100/20" />              
                {userBooks.length === 0 ? (
                  <header className="text-center max-w-md mx-auto space-y-3">
                    <img src="/src/assets/no-mybooks-no.png" className='max-w-xs mx-auto' alt="Book Banner" />
                    <h4 className="text-white font-semibold">Aucun livre créé</h4>
                    <p className="text-light-200 text-l">Essayez de créer un livre en utilisant ces fonctionnalités.</p>
                    <p className="text-sm">Cliquez sur <span className="text-gradient">« Ajouter un livre »</span> ou depuis la section <span className="text-gradient">« Accueil »</span>.</p>
                  </header>
                ) : (
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                    {userBooks.map((book) =>(
                        <BookCard
                        key={book.id}
                        book={book}
                        onSelect={onBookSelect}
                        onEdit={openEditBook}
                        onDelete={handleDeleteBook}
                      />
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
                    <p className="text-light-200 text-l">Ou en cliquant sur  .....</p>
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
                            <img 
                              src={book.imageUrl || "/src/assets/no-book.png"} 
                              alt={book.title} 
                              className="rounded-lg w-full h-auto object-cover cursor-pointer hover:opacity-80 transition-opacity" 
                              onClick={() => onBookSelect(book.id)}
                            />
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
                    <h1 className="text-center font-bold">Emprunté par</h1>
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
              <div className="text-amber-50">
                <h3 className="text-white text-2xl font-semibold mb-2 flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Tags
                </h3>
                <span>Organisez vos livres par catégories</span>
                <Separator className="my-2 bg-light-100/20" />

                {/* Breadcrumb */}
                <Breadcrumb className="mb-4">
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink
                        className="flex items-center gap-1 text-light-200 hover:text-light-100 transition-colors cursor-pointer"
                        onClick={() => setSelectedTag(null)}
                      >
                        <Hash className="h-4 w-4" /> My Tags
                      </BreadcrumbLink>
                      <BreadcrumbSeparator className="text-light-200" />
                    </BreadcrumbItem>

                    {selectedTag && (
                      <BreadcrumbItem>
                        <BreadcrumbPage className="text-white font-semibold flex items-center gap-1">
                          <BookHeart className="h-4 w-4" />
                          {selectedTag}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    )}
                  </BreadcrumbList>
                </Breadcrumb>

                {/* Tags Overview or Selected Tag Books */}
                {selectedTag ? (
                  <>
                    {/* Books under selected tag */}
                    {tagsMap.get(selectedTag)?.length ? (
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                        {tagsMap.get(selectedTag).map((book) => (
                          <BookCard
                            key={book.id}
                            book={book}
                            onSelect={onBookSelect}
                            onEdit={openEditBook}
                            onDelete={handleDeleteBook}
                          />
                        )
                        )}
                      </ul>
                    ) : (
                      <header className="text-center max-w-md mx-auto space-y-3">
                        <img src="/src/assets/no-mybooks-no.png" className='max-w-xs mx-auto' alt="Book Banner" />
                        <h4 className="text-white font-semibold">Aucun livre trouvé pour ce tag.</h4>
                      </header>                      
                    )}
                  </>
                ) : (
                  // Show all tags overview
                  tagsMap.size === 0 ? (
                    <header className="text-center max-w-md mx-auto space-y-3">
                      <img src="/src/assets/3D Hashtag.png" className="max-w-xs mx-auto" alt="Book Banner" />
                      <h4 className="text-white font-semibold">Aucun # tag.</h4>
                      <p className=" text-light-200 text-l">
                        Ajoutez-en via l'onglet <span className="text-gradient">Notations</span>.
                      </p>
                    </header>
                  ) : (
                    <ul className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 gap-4">
                      {Array.from(tagsMap.entries()).map(([tag, books]) => (
                        <li key={tag} className="relative">
                          <div
                            className="flex items-center justify-between px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-[#D6C7FF]/30 to-[#AB8BFF]/30 text-white cursor-pointer hover:from-[#D6C7FF]/50 hover:to-[#AB8BFF]/50 transition"
                            
                          >
                            <div onClick={() => setSelectedTag(tag)} className="flex items-center gap-2">
                              <TagsIcon className="h-4 w-4" />
                              <span>{tag}</span>
                              <span className="text-xs text-gray-100 font-semibold">{books.length} livre(s)</span>
                            </div>

                            {/* Dropdown Trigger */}
                            <DropdownDot
                              onRenameClick={() => {
                                setDialogTag(tag)
                                setNewName(tag)
                                setIsDialogOpen(true)
                              }}
                              onDeleteClick={() => handleDeleteTag(tag)}
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                  )
                )}
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Renommer tag</DialogTitle>
                        <DialogDescription>
                          Entrez un nouveau nom pour tag "{dialogTag}"
                        </DialogDescription>
                      </DialogHeader>
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        autoFocus
                        className="mt-2"
                        onKeyDown={(e) => e.key === "Enter" && handleRenameConfirm()}
                      />
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                        <Button onClick={handleRenameConfirm}>Renommer</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>  
              </div>              
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
    
  )
}

export default LibraryView