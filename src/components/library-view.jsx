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
  const [selectedShelf, setSelectedShelf] = useState(null);

  const [isAddShelfDialogOpen, setIsAddShelfDialogOpen] = useState(false);
  const [newShelfName, setNewShelfName] = useState("");
  const [dialogShelf, setDialogShelf] = useState(null); // shelf being renamed
  const [isShelfDialogOpen, setIsShelfDialogOpen] = useState(false);
  const [newShelfRenameName, setNewShelfRenameName] = useState("");

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

  const handleShelfRenameConfirm = () => {
    if (!newShelfRenameName || newShelfRenameName === dialogShelf?.name) {
      toast.error("Renommage annulé");
      setIsShelfDialogOpen(false);
      return;
    }
  
    const trimmedName = newShelfRenameName.trim();
    
    // Check for duplicate names (excluding current shelf)
    if (shelves.some(s => s.id !== dialogShelf?.id && s.name.toLowerCase() === trimmedName.toLowerCase())) {
      toast.error("Une étagère portant ce nom existe déjà.");
      return;
    }
  
    // Update the shelf name in shelves array
    setShelves(prev => prev.map(shelf => 
      shelf.id === dialogShelf?.id 
        ? { ...shelf, name: trimmedName }
        : shelf
    ));
  
    // IMPORTANT: Update the shelf name in all books that reference this shelf
    const updatedBooks = userBooks.map(book => {
      const bookShelves = book.meta?.shelves || [];
      // Check if this book is in the renamed shelf
      if (bookShelves.includes(dialogShelf?.id)) {
        return {
          ...book,
          meta: {
            ...book.meta,
            shelfName: trimmedName // Update the shelf name in book metadata
          }
        };
      }
      return book;
    });
    
    // Update the books state if any books were modified
    if (updatedBooks.some((book, index) => book !== userBooks[index])) {
      setUserBooks(updatedBooks);
    }
  
    toast.success(`Étagère renommée en "${trimmedName}"`);
    setIsShelfDialogOpen(false);
  };

  const handleDeleteShelf = (shelf) => {
    // Prevent deletion if it's the last shelf
    if (shelves.length <= 1) {
      toast.error("Impossible de supprimer la dernière étagère", {
        description: "Vous devez avoir au moins une étagère dans votre bibliothèque."
      });
      return;
    }

    const booksInShelf = shelvesMap.get(shelf.id) || [];
    
    toast(`Supprimer l'étagère "${shelf.name}" ?`, {
      description: booksInShelf.length > 0 
        ? `Cette étagère contient ${booksInShelf.length} livre(s). Les livres ne seront pas supprimés mais retirés de cette étagère.`
        : "Cette action ne peut pas être annulée.",
      action: {
        label: "Supprimer",
        onClick: () => {
          // Remove shelf from shelves list
          setShelves(prev => prev.filter(s => s.id !== shelf.id));
          
          // Remove shelf from all books
          if (booksInShelf.length > 0) {
            const updatedBooks = userBooks.map(book => {
              const bookShelves = book.meta?.shelves || [];
              if (bookShelves.includes(shelf.id)) {
                return {
                  ...book,
                  meta: {
                    ...book.meta,
                    shelves: bookShelves.filter(id => id !== shelf.id),
                    shelfName: "" // Clear shelf name if it was the deleted shelf
                  }
                };
              }
              return book;
            });
            setUserBooks(updatedBooks);
          }
          
          toast.success(`Étagère "${shelf.name}" supprimée`);
          
          // If we were viewing this shelf, go back to shelves overview
          if (selectedShelf === shelf.id) {
            setSelectedShelf(null);
          }
        },
      },
      cancel: {
        label: "Annuler",
        onClick: () => toast.dismiss()
      },
      duration: 10000,
    });
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

  const [shelves, setShelves] = useState([
    { id: "default", name: "Shelf A" }
  ]);

  // Fix: Improved shelf mapping logic
  const shelvesMap = useMemo(() => {
    const map = new Map()
    
    // Initialize all shelves with empty arrays
    for (const shelf of shelves) {
      map.set(shelf.id, [])
    }
    
    // Populate shelves with books
    for (const book of userBooks) {
      const bookShelves = book.meta?.shelves || []
      
      // Handle both string and array formats for backward compatibility
      const shelfIds = Array.isArray(bookShelves) ? bookShelves : [bookShelves].filter(Boolean)
      
      for (const shelfId of shelfIds) {
        if (shelfId) { // Only process non-empty shelf IDs
          if (!map.has(shelfId)) {
            // If shelf doesn't exist in our shelves list, create it
            map.set(shelfId, [])
          }
          map.get(shelfId).push(book)
        }
      }
    }
    
    console.log('Shelves map:', Object.fromEntries(map)) // Debug log
    return map
  }, [userBooks, shelves])
  
  // load shelves from localStorage
  useEffect(() => {
    const savedShelves = localStorage.getItem("userShelves")
    if (savedShelves) {
      try {
        setShelves(JSON.parse(savedShelves))
      } catch(err) {
        console.error("Failed to parse userShelves from localStorage", err)
      }
    }
  }, [])
  
  useEffect(() => {
    localStorage.setItem("userShelves", JSON.stringify(shelves))
  }, [shelves])
  

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

  const generateShelfId = (name) => {
    const base = name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "")
    if (!base) return `shelf-${Date.now()}`
    if (!shelves.some(s => s.id === base)) return base
    // append increasing suffix if collision
    let i = 1
    while (shelves.some(s => s.id === `${base}-${i}`)) i++
    return `${base}-${i}`
  }

  const handleAddShelfConfirm = () => {
    const name = (newShelfName || "").trim()
    if (!name) {
      toast.error("Veuillez saisir un nom d'étagère.")
      return
    }
    // prevent name duplicate
    if (shelves.some(s => s.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Une étagère portant ce nom existe déjà.")
      return
    }
    const id = generateShelfId(name)
    setShelves(prev => [...prev, { id, name }])
    toast.success(`Étagère "${name}" créée`)
    setNewShelfName("")
    setIsAddShelfDialogOpen(false)
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
                  shelves={shelves}   
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
              <div className="text-amber-50">
                <h3 className="text-white text-2xl font-semibold mb-2">Étagères</h3>
                <span>Vos étagères, organisez vos collections de livres.</span>
                <Separator className="my-2 bg-light-100/20" />

                {/* Breadcrumb */}
                <Breadcrumb className="mb-4">
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink
                        className="flex items-center gap-1 text-light-200 hover:text-light-100 transition-colors cursor-pointer"
                        onClick={() => setSelectedShelf(null)}
                      >
                        <Layers className="h-4 w-4" /> Mes étagères
                      </BreadcrumbLink>
                      <BreadcrumbSeparator className="text-light-200" />  
                    </BreadcrumbItem>

                    {selectedShelf && (
                      <BreadcrumbItem>
                        <BreadcrumbPage className="text-white font-semibold flex items-center gap-1">
                          <BookOpen className="h-4 w-4" /> {shelves.find(s => s.id === selectedShelf)?.name}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    )}
                  </BreadcrumbList>
                </Breadcrumb>

                {/* Shelves Overview or Selected Shelf Books */}
                {!selectedShelf ? (
                  shelves.length === 0 ? (
                    <header className="text-center max-w-md mx-auto space-y-3">
                      <img src="/src/assets/no-mybooks-no.png" className='max-w-xs mx-auto' alt="Book Banner" />
                      <h4 className="text-white font-semibold">Aucune étagère.</h4>
                      <p className="text-light-200 text-l">Ajoutez-en via le bouton <span className="text-gradient">« + »</span>.</p>
                    </header>
                  ) : (
                    <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {shelves.map(shelf => (
                      <li key={shelf.id} className="relative group cursor-pointer">
                        <div className="bg-dark-100 p-2 rounded-xl shadow-inner shadow-light-100/10 hover:bg-dark-100/80 transition-colors">
                          <div className="grid grid-cols-2 gap-1" onClick={() => setSelectedShelf(shelf.id)}>
                            {[0,1,2,3].map(i => {
                              const book = shelvesMap.get(shelf.id)?.[i];
                              return (
                                <img
                                  key={i}
                                  src={book?.imageUrl || "/src/assets/no-mybooks-no.png"}
                                  alt={book?.title || "Placeholder"}
                                  className="w-full h-20 object-cover rounded"
                                />
                              )
                            })}
                          </div>
                          <div className="mt-2 flex justify-between items-center">
                            <div onClick={() => setSelectedShelf(shelf.id)} className="flex-1">
                              <span className="text-white font-semibold truncate block">{shelf.name}</span>
                              <span className="text-xs text-gray-100">{(shelvesMap.get(shelf.id)?.length || 0)} livre(s)</span>
                            </div>
                            
                            {/* Dropdown for shelf actions */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon-sm" className="h-6 w-6">
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-dark-100 border-light-100/20">
                                  <DropdownMenuItem 
                                    className="text-light-200 hover:bg-light-100/10 focus:bg-light-100/10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDialogShelf(shelf);
                                      setNewShelfRenameName(shelf.name);
                                      setIsShelfDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Renommer
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteShelf(shelf);
                                    }}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Supprimer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>                  
                  )
                ) : (
                  // Selected shelf books
                  <div>
                    {(shelvesMap.get(selectedShelf)?.length || 0) === 0 ? (
                      <header className="text-center max-w-md mx-auto space-y-3">
                        <img src="/src/assets/no-mybooks-no.png" className='max-w-xs mx-auto' alt="Book Banner" />
                        <h4 className="text-white font-semibold">Aucun livre dans cette étagère.</h4>
                        <p className="text-light-200 text-l">Ajoutez des livres en les créant et en sélectionnant cette étagère.</p>
                      </header>
                    ) : (
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(shelvesMap.get(selectedShelf) || []).map(book => (
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
                  </div>
                )}
                  {/* Shelf Rename Dialog */}
                  <Dialog open={isShelfDialogOpen} onOpenChange={setIsShelfDialogOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Renommer étagère</DialogTitle>
                        <DialogDescription>
                          Entrez un nouveau nom pour l'étagère "{dialogShelf?.name}"
                        </DialogDescription>
                      </DialogHeader>
                      <Input
                        value={newShelfRenameName}
                        onChange={(e) => setNewShelfRenameName(e.target.value)}
                        autoFocus
                        className="mt-2"
                        placeholder="Nom de l'étagère"
                        onKeyDown={(e) => e.key === "Enter" && handleShelfRenameConfirm()}
                      />
                      <DialogFooter>
                        <Button 
                          className="mt-2 rounded-b-md" 
                          variant="destructive" 
                          onClick={() => setIsShelfDialogOpen(false)}
                        >
                          Annuler
                        </Button>
                        <Button 
                          className="mt-2" 
                          variant="secondary" 
                          onClick={handleShelfRenameConfirm}
                        >
                          Renommer
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>                  
              </div>
            )}


            {activeSection === "lendBorrow" && (
              <>
                <h3 className="text-white text-2xl font-semibold mb-2">Prêts et Emprunts</h3>
                <span>Empruntez des livres près de chez vous et prêtez les vôtres </span>                
                <Separator className="my-2 bg-light-100/20" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Card>
                    <h1 className="flex flex-auto justify-center items-center font-bold">Prêté à </h1>
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
                            <div className="text-light-200 hover:bg-light-100/10 focus:bg-light-100/10">
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
                        <Button className="mt-2 rounded-b-md" variant="destructive" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                        <Button className="mt-2" variant="aurora" onClick={handleRenameConfirm}>Renommer</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
              </div>              
            )}
          </div>
        </div>
        {/* --- Floating Add Shelf FAB (only when in shelves section) --- */}
        {activeSection === "shelves" && (
          <>
            <button
              aria-label="Ajouter une étagère"
              onClick={() => setIsAddShelfDialogOpen(true)}
              className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-xl bg-gradient-to-br from-[#AB8BFF] to-[#7C5CFF] flex items-center justify-center text-white"
            >
              <Plus className="h-4 w-6" />
            </button>

            <Dialog open={isAddShelfDialogOpen} onOpenChange={setIsAddShelfDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer une nouvelle étagère</DialogTitle>
                  <DialogDescription>Donnez un nom à votre étagère.</DialogDescription>
                </DialogHeader>

                <div className="mt-2">
                  <Input
                    placeholder="Nom de l'étagère (Ex: Fantasy, Auteurs A-L)"
                    value={newShelfName}
                    onChange={(e) => setNewShelfName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddShelfConfirm()}
                    autoFocus
                  />
                </div>

                <DialogFooter>
                  <Button variant="destructive" className="mt-2 rounded-b-md" onClick={() => { setIsAddShelfDialogOpen(false); setNewShelfName("") }}>Annuler</Button>
                  <Button variant="secondary" className="mt-2 rounded-b-md" onClick={handleAddShelfConfirm}>Créer</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </SidebarInset>
    </SidebarProvider>
    
  )
}

export default LibraryView