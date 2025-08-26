import React, { useEffect, useState } from 'react'
import { ArrowLeft, Pencil, Trash2, Eye, Calendar, BookOpen, Hash, ArrowRightLeft, Star, Clock, Users, MessageSquare, Bookmark, BookmarkCheck, Play, Headphones, Download, Share2, Heart, ThumbsUp, PenTool, Landmark } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from 'sonner'
import { Progress } from '@/components/ui/progress'
import BookForm from './book-form'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger } from "@/components/ui/sheet"
import { Plus, Edit } from "lucide-react"
import { useRef } from "react"

const BookDetailView = ({ bookId, onBack }) => {
  const [book, setBook] = useState(null)
  const [userBooks, setUserBooks] = useState([])
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const bookFormRef = useRef(null)
  const [canSaveForm, setCanSaveForm] = useState(false)
  
  useEffect(() => {
    // Load user books from localStorage
    const saved = localStorage.getItem("userBooks")
    if (saved) {
      try {
        const books = JSON.parse(saved)
        setUserBooks(books)
        const foundBook = books.find(b => b.id === bookId)
        if (foundBook) {
          setBook(foundBook)
        }
      } catch {}
    }
  }, [bookId])

  const openEditBook = (book) => {
    setEditingBook(book)
    setIsAddOpen(true)
  }

  const handleDelete = () => {
    if (!book) return

    toast(`Supprimer "${book.title}" ?`, {
      description: "Cette action ne peut pas être annulée.",
      action: {
        label: "Supprimer",
        onClick: () => {
          const updatedBooks = userBooks.filter(b => b.id !== book.id)
          setUserBooks(updatedBooks)
          
          toast.success("Livre supprimé", {
            description: `"${book.title}" a été supprimé de votre bibliothèque.`
          })
          
          setTimeout(() => onBack(), 1000)
        },
      },
      cancel: {
        label: "Annuler",
        onClick: () => {
          toast.dismiss()
        }
      },
      duration: 10000,
    })
  }

  const handleEdit = () => {
    setEditingBook(book)
    setIsAddOpen(true)
  }

  const handleWishlistToggle = () => {
    setIsInWishlist(!isInWishlist)
    toast.success(isInWishlist ? "Retiré de la wishlist" : "Ajouté à la wishlist")
  }

  const handleRating = (rating) => {
    setUserRating(rating)
    toast.success(`Note attribuée: ${rating}/5 étoiles`)
  }

  const handleLikeToggle = () => {
    setIsLiked(!isLiked)
    toast.success(isLiked ? "Like retiré" : "Livre liké")
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Livre non trouvé</h2>
          <Button onClick={onBack} variant="secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la bibliothèque
          </Button>
        </div>
      </div>
    )
  }

  const readingProgress = Math.min((book.meta?.pagesRead || 0) / (book.pages || 1) * 100, 100)

  return (
    <div className="min-h-screen bg-primary">
      {/* Enhanced Header with Gradient */}
      <div className="bg-gradient-to-r from-dark-100 via-dark-100 to-dark-100/90 border-b border-light-100/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="text-white hover:bg-light-100/20 hover:scale-105 transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour
            </Button>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleWishlistToggle}
                className={`text-white border-light-100/30 hover:bg-light-100/20 transition-all duration-200 ${
                  isInWishlist ? 'bg-gradient-to-r from-[#D6C7FF] to-[#AB8BFF] text-primary border-none' : ''
                }`}
              >
                {isInWishlist ? <BookmarkCheck className="h-4 w-4 mr-2" /> : <Bookmark className="h-4 w-4 mr-2" />}
                {isInWishlist ? 'Dans la wishlist' : 'Wishlist'}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleEdit}
                className="text-white border-light-100/30 hover:bg-light-100/20 hover:scale-105 transition-all duration-200"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Modifier
              </Button>
              
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleDelete}
                className="hover:scale-105 transition-all duration-200"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-dark-100/50 to-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Enhanced Left Column */}
            <div className="lg:col-span-1">
              <div className="text-center lg:text-left">
                {/* Enhanced Cover with Shadow and Hover Effect */}
                <div className="relative group mb-6">
                  <img 
                    src={book.imageUrl || "/src/assets/no-book.png"} 
                    alt={book.title} 
                    className="w-full max-w-sm mx-auto lg:mx-0 rounded-2xl shadow-2xl transform group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>  
      
              </div>
            </div>

            {/* Enhanced Right Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Enhanced Title Section */}
                <h2 className="mt-15 flex text-4xl font-bold mb-5 leading-tight">{book.title}</h2>
              {/* Author */}
                <div className="flex items-center gap-2 mb-4 text-light-200">
                  <PenTool className="h-5 w-5 text-white" />
                  <span className="text-lg">
                    <span className="font-semibold">Auteur (s) :</span> {book.author || "Inconnu"}
                  </span>
                </div>                

                <div className="mb-4">
                  <div className="flex ">
                    <Landmark className="h-10 w-5 mr-2 text-white" />                  
                    <Badge variant="outline" className="text-light-200 border-light-100/30 text-lg">
                      Série: {book.series != "" ? book.series : "non specifiee" } {book.volume && `(Vol. ${book.volume})`}
                    </Badge>
                  </div>
                </div>


                {/* Enhanced Stats Row */}
                <div className="flex flex-wrap items-center gap-4 text-light-200 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-7 w-5 text-white" />
                    <Badge variant="outline" className='text-lg ml-1.5'>
                      {book.publicationDate
                        ? (() => {
                          const d = new Date(book.publicationDate)
                          const day = String(d.getDate()).padStart(2, "0")
                          const month = String(d.getMonth() + 1).padStart(2, "0")
                          const year = d.getFullYear()
                          return `${year}-${month}-${day}`
                        })()
                        : book.publishedYear || "N/A"
                      }
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{book.pages || 'N/A'} pages</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{Math.ceil((book.pages || 250) / 250)} heures</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{Math.floor(Math.random() * 50000) + 5000} lecteurs</span>
                  </div>
                </div>
                {/* Enhanced Rating Display */}
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 cursor-pointer transition-all duration-200 ${
                          star <= (userRating || parseFloat(book.rating)) 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-gray-400'
                        } hover:text-yellow-300 hover:scale-110`}
                        onClick={() => handleRating(star)}
                      />
                    ))}
                  </div>
                  <span className="text-light-200 text-sm">
                    {book.rating} ({Math.floor(Math.random() * 1000) + 100} avis)
                  </span>
                </div>
                {/* Genre Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge className="bg-gradient-to-r from-[#D6C7FF] to-[#AB8BFF] text-primary">
                    {book.genre}
                  </Badge>
                  {book.meta?.tags?.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-light-200 border-light-100/30">
                      {tag}
                    </Badge>
                  ))} 
                </div>

                {/* Reading Progress Card */}
                {readingProgress >= 0 && (
                  <div className=" border-light-100/20 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">Progression</span>
                      <span className="text-white text-sm">
                        {Math.round(readingProgress)}%
                      </span>
                    </div>
                    <Progress value={readingProgress} className="h-2 mb-2" />
                    <div className="text-xs text-light-200">
                      {book.meta?.pagesRead || 0} / {book.pages || 0} pages
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tabs Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-dark-100/40 mb-6">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="reviews">Avis</TabsTrigger>
            <TabsTrigger value="similar">Similaires</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="space-y-6">
            <Card className="bg-dark-100/50 border-light-100/20">
              <CardContent className="p-6">
                <p className="text-white leading-relaxed text-lg">
                  {book.description || "Aucune description disponible pour ce livre."}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-dark-100/50 border-light-100/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Informations du livre
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-light-200">
                    <div>
                      <span className="font-semibold">Pages:</span>
                      <p className="text-white">{book.pages || 'Non spécifié'}</p>
                    </div>
                    <div>
                      <span className="font-semibold">Langue:</span>
                      <p className="text-white">{book.language || 'Français'}</p>
                    </div>
                    <div>
                      <span className="font-semibold">ISBN:</span>
                      <p className="text-white font-mono text-sm">{book.isbn || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-semibold">Format:</span>
                      <p className="text-white">PDF, EPUB</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dark-100/50 border-light-100/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="h-5 w-5" />
                    Organisation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {book.meta?.shelves?.length > 0 && (
                    <div>
                      <span className="text-light-200 font-medium">Étagères:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {book.meta.shelves.map((shelf) => (
                          <Badge key={shelf} variant="secondary" className="text-light-200 border-light-100/30">
                            {shelf}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card className="bg-dark-100/50 border-light-100/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Avis des lecteurs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sample reviews */}
                {[
                  { name: "Marie L.", rating: 5, comment: "Un livre absolument captivant ! Je n'ai pas pu le lâcher.", date: "Il y a 2 jours" },
                  { name: "Thomas B.", rating: 4, comment: "Très bon livre, quelques longueurs mais globalement excellent.", date: "Il y a 1 semaine" },
                  { name: "Sophie R.", rating: 5, comment: "L'un de mes livres préférés de l'année. Highly recommended!", date: "Il y a 2 semaines" }
                ].map((review, index) => (
                  <div key={index} className="border-b border-light-100/10 pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{review.name}</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-light-200">{review.date}</span>
                    </div>
                    <p className="text-light-200">{review.comment}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Button variant="ghost" size="sm" className="text-light-200 hover:text-white">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        Utile ({Math.floor(Math.random() * 20) + 1})
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="similar" className="space-y-6">
            <Card className="bg-dark-100/50 border-light-100/20">
              <CardHeader>
                <CardTitle>Livres similaires</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="text-center group cursor-pointer">
                      <img 
                        src="/src/assets/no-book.png" 
                        alt="Similar book" 
                        className="w-full rounded-lg mb-2 group-hover:scale-105 transition-transform duration-200"
                      />
                      <p className="text-white text-sm font-medium">Titre similaire {item}</p>
                      <p className="text-light-200 text-xs">Auteur {item}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <Sheet open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) setEditingBook(null) }}>
          <SheetContent side="right" className="bg-primary text-white sm:max-w-md" aria-describedby="book-form-desc">
            <SheetHeader>
              <SheetTitle>{editingBook ? 'Modifier le livre' : 'Créer un livre'}</SheetTitle>
            </SheetHeader>
            <p id="book-form-desc" className="sr-only">
              Remplissez les champs pour {editingBook ? 'modifier' : 'créer'} un livre.
            </p>
            <BookForm
              key={editingBook ? `edit-${editingBook.id}` : 'new'}
              ref={bookFormRef}
              book={editingBook || undefined}
              onCanSaveChange={setCanSaveForm}
              onSave={(newBook) => {
                const updatedBooks = userBooks.map((b) => b.id === newBook.id ? newBook : b)
                setUserBooks(updatedBooks)
                localStorage.setItem("userBooks", JSON.stringify(updatedBooks))
                setBook(newBook)
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
                  Mettre à jour
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>    
      </div>
    </div>
    
  )
}

export default BookDetailView