import React, { useEffect, useState } from 'react'
import { ArrowLeft, Pencil, Trash2, Eye, Calendar, BookOpen, Hash, ArrowRightLeft, Star, Clock, Users, MessageSquare, Bookmark, BookmarkCheck, Play, Headphones, Download, Share2, Heart, ThumbsUp, PenTool, Landmark, PartyPopper, Paperclip, LucidePaperclip, ScanBarcode, Languages, Loader2, Wifi, WifiOff } from 'lucide-react'
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
import { formatISBN } from '@/lib/isbn'
import { Copy } from "lucide-react"
import { Textarea } from './ui/textarea'
import ApiService from '../services/api'

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
  const [pagesRead, setPagesRead] = useState(0)
  const [userReview, setUserReview] = useState("")
  const [shelves, setShelves] = useState([])
  
  // Loading and connection states
  const [isLoading, setIsLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSaving, setIsSaving] = useState(false)

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Load book data from API with fallback to localStorage
  const loadBookData = async () => {
    try {
      setIsLoading(true)
      
      if (isOnline) {
        // Try to load from API first
        const apiBooks = await ApiService.getBooks()
        const transformedBooks = apiBooks.map(book => ApiService.transformBackendBook(book))
        setUserBooks(transformedBooks)
        
        const foundBook = transformedBooks.find(b => b.id === bookId)
        if (foundBook) {
          setBook(foundBook)
          setPagesRead(foundBook.meta?.pagesRead || 0)
          if (foundBook.userRating) {
            setUserRating(foundBook.userRating)
          }
        }
        
        // Update localStorage as cache
        localStorage.setItem('userBooks', JSON.stringify(transformedBooks))
      } else {
        // Fallback to localStorage
        const localBooks = JSON.parse(localStorage.getItem('userBooks') || '[]')
        setUserBooks(localBooks)
        const foundBook = localBooks.find(b => b.id === bookId)
        if (foundBook) {
          setBook(foundBook)
          setPagesRead(foundBook.meta?.pagesRead || 0)
          if (foundBook.userRating) {
            setUserRating(foundBook.userRating)
          }
        }
      }
      
      // Load shelves
      if (isOnline) {
        const apiShelves = await ApiService.getShelves()
        setShelves(apiShelves)
      } else {
        const localShelves = JSON.parse(localStorage.getItem('userShelves') || '[]')
        setShelves(localShelves)
      }
      
    } catch (error) {
      console.error('Failed to load book data:', error)
      // Fallback to localStorage on error
      const localBooks = JSON.parse(localStorage.getItem('userBooks') || '[]')
      setUserBooks(localBooks)
      const foundBook = localBooks.find(b => b.id === bookId)
      if (foundBook) {
        setBook(foundBook)
        setPagesRead(foundBook.meta?.pagesRead || 0)
      }
      
      toast.error("Mode hors ligne", {
        description: "Impossible de charger les dernières données"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadBookData()
  }, [bookId, isOnline])

  // Update book progress
  const updateBookProgress = async (newPagesRead) => {
    if (!book) return
    
    const updatedBook = {
      ...book,
      meta: { ...book.meta, pagesRead: newPagesRead }
    }
    
    try {
      if (isOnline) {
        await ApiService.updateBook(book.id, updatedBook)
      }
      
      // Update local state
      setBook(updatedBook)
      setPagesRead(newPagesRead)
      
      // Update userBooks array
      const updatedBooks = userBooks.map(b => b.id === updatedBook.id ? updatedBook : b)
      setUserBooks(updatedBooks)
      localStorage.setItem('userBooks', JSON.stringify(updatedBooks))
      
    } catch (error) {
      console.error('Failed to update progress:', error)
      // Still update locally even if API fails
      setBook(updatedBook)
      setPagesRead(newPagesRead)
      const updatedBooks = userBooks.map(b => b.id === updatedBook.id ? updatedBook : b)
      setUserBooks(updatedBooks)
      localStorage.setItem('userBooks', JSON.stringify(updatedBooks))
      
      toast.warning("Progression sauvegardée localement", {
        description: "Sera synchronisée quand la connexion sera rétablie"
      })
    }
  }

  // Save book changes
  const handleSaveBook = async (bookData) => {
    try {
      setIsSaving(true)
      let savedBook

      if (isOnline) {
        const updatedBook = await ApiService.updateBook(editingBook.id, bookData)
        savedBook = ApiService.transformBackendBook(updatedBook)
      } else {
        // Offline mode
        savedBook = { ...bookData, id: editingBook.id }
        toast.info("Livre sauvegardé localement", {
          description: "Sera synchronisé quand la connexion sera rétablie"
        })
      }
      
      // Update local state
      const updatedBooks = userBooks.map(b => b.id === savedBook.id ? savedBook : b)
      setUserBooks(updatedBooks)
      localStorage.setItem('userBooks', JSON.stringify(updatedBooks))
      setBook(savedBook)
      
      setIsAddOpen(false)
      setEditingBook(null)
      bookFormRef.current?.reset()
      
      toast.success("Livre mis à jour")
      
    } catch (error) {
      console.error('Failed to save book:', error)
      toast.error("Erreur lors de la sauvegarde", {
        description: error.message || "Réessayez plus tard"
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Delete book
  const handleDelete = async () => {
    if (!book) return

    toast(`Supprimer "${book.title}" ?`, {
      description: "Cette action ne peut pas être annulée.",
      action: {
        label: "Supprimer",
        onClick: async () => {
          try {
            if (isOnline) {
              await ApiService.deleteBook(book.id)
            }
            
            // Update local state
            const updatedBooks = userBooks.filter(b => b.id !== book.id)
            setUserBooks(updatedBooks)
            localStorage.setItem('userBooks', JSON.stringify(updatedBooks))
            
            toast.success("Livre supprimé", {
              description: `"${book.title}" a été supprimé de votre bibliothèque.`
            })
            
            setTimeout(() => onBack(), 1000)
            
          } catch (error) {
            console.error('Failed to delete book:', error)
            toast.error("Erreur lors de la suppression", {
              description: "Réessayez plus tard"
            })
          }
        },
      },
      cancel: {
        label: "Annuler",
        onClick: () => toast.dismiss()
      },
      duration: 10000,
    })
  }

  const submitReview = () => {
    if (userReview.trim()) {
      toast.success("Votre avis a été publié")
      setUserReview("")
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <p className="text-white">Chargement du livre...</p>
        </div>
      </div>
    )
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

  const readingProgress = Math.min((pagesRead || 0) / (book.pages || 1) * 100, 100)

  return (
    <div className="min-h-screen bg-primary">
      {/* Enhanced Header with Connection Status */}
      <div className="bg-gradient-to-r from-dark-100 via-dark-100 to-dark-100/90 border-b border-light-100/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={onBack}
                className="text-white hover:bg-light-100/20 hover:scale-105 transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Retour
              </Button>
              
              {/* Connection status indicator */}
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Wifi className="h-4 w-4 text-green-400" title="En ligne" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-400" title="Hors ligne" />
                )}
                <span className="text-xs text-light-200">
                  {isOnline ? "En ligne" : "Hors ligne"}
                </span>
              </div>
            </div>
            
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
                disabled={isSaving}
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
                    className="w-full h-120 max-w-sm mx-auto lg:mx-0 rounded-2xl shadow-2xl transform group-hover:scale-105 transition-transform duration-300"
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
                  <PenTool className="h-6 w-6 text-white" />
                  <span className="text-lg font-semibold">Auteur(s):</span>
                  <div className="flex flex-wrap gap-2">
                    {(book.author ? book.author.split(",") : ["Inconnu"]).map((a, idx) => (
                      <Badge 
                        key={idx} 
                        variant="outline" 
                        className="text-light-200 border-light-100/30 text-lg"
                      >
                        {a.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>                

                <div className="flex flex-wrap items-center gap-4 text-light-200 mb-4">
                  <div className="flex items-center gap-1 ">
                    <Landmark className="h-full w-fll mr-2 text-white" />                  
                    <Badge variant="outline" className="text-light-200 border-light-100/30 text-lg">
                      Série: {book.series != "" ? book.series : "Non spécifiée" } {book.volume && `(Vol. ${book.volume})`}
                    </Badge>
                  </div>
                  {book.language &&
                  <div className="flex items-center gap-1">
                    <Languages className="h-full w-fll mr-2 text-white" />                  
                    <Badge variant="outline" className="text-light-200 border-light-100/30 text-lg">
                      Language: {book.language} 
                    </Badge>
                  </div>
                  }
                </div>

                {/* Enhanced Stats Row */}
                <div className="flex flex-wrap items-center gap-4 text-light-200 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-full w-full text-white" />
                    <Badge className="text-lg font-semibold"> publiee le: </Badge>
                    <Badge variant="outline" className='text-lg ml-1.5'>
                      {book.publicationDate
                        ? (() => {
                          const d = new Date(book.publicationDate)
                          const day = String(d.getDate()).padStart(2, "0")
                          const month = String(d.getMonth() + 1).padStart(2, "0")
                          const year = d.getFullYear()
                          return `${day}-${month}-${year}`
                        })()
                        : book.publishedYear || "N/A"
                      }
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <img className="h-8 w-8" src="/src/assets/write-paper.svg" alt="papers" />
                    <Badge variant="outline" className='text-lg ml-1.5'>
                      {book.pages || 'N/A'} pages
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1">
                    <Eye className="h-6 w-8" />
                    <span>{Math.floor(Math.random() * 50000) + 5000} vues </span>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-light-200 mb-4">
                  {book.isbn ? (
                    <div className="flex items-center gap-2">
                      <ScanBarcode className="text-white w-full h-full"/>
                      <Badge className="text-lg font-semibold">
                        {book.isbn.length === 13 ? "ISBN-13: " : "ISBN-10: "}
                      </Badge>
                      <Badge variant="outline" className='text-lg ml-1.5'>
                        {formatISBN(book.isbn)}
                      </Badge>
                    </div>
                  ) : (
                    <Badge variant="outline" className ="text-lg ml-1.5">N/A</Badge>
                  )}
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
                    <Badge key={tag} variant="outline" className="text-red-400 bg-red-400/10 border-light-100/30">
                      {tag}
                    </Badge>
                  ))} 
                </div>

                {/* Reading Progress Card */}
                {readingProgress >= 0 && (
                  <div className="border-light-100/20 mb-6">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Paperclip className="text-white h-4 w-4 " />
                        <span className="text-white font-medium">Progression</span>
                      </div>
                      <span className="text-white text-sm">
                        {Math.round((pagesRead / (book.pages || 1)) * 100)}%
                      </span>
                    </div>

                    {/* Interactive slider */}
                    <input
                      type="range"
                      min={0}
                      max={book.pages || 0}
                      value={pagesRead}
                      onChange={(e) => {
                        const newPages = Number(e.target.value)
                        updateBookProgress(newPages)
                      }}
                      className="w-full accent-[#AB8BFF] mb-2"
                    />

                    <div className="text-xs text-light-200">
                      {pagesRead} / {book.pages || 0} pages
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tabs Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="description" className="w-full mt-6">
        <TabsList className="grid w-full grid-cols-3 bg-dark-100/40 mb-4">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="reviews">Avis</TabsTrigger>
          <TabsTrigger value="similar">Similaires</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="space-y-6">
          <Card className="bg-dark-100/50 border-light-100/20">
            <CardContent className="p-6 space-y-4">
              <p className="text-white leading-relaxed text-lg">
                {book.description || "Aucune description disponible."}
              </p>

              <div className="flex flex-wrap gap-2">
                {book.meta?.dateAdded && (
                  <Badge variant="outline" className="text-light-200">
                    Ajouté le: {new Date(book.meta.dateAdded).toLocaleDateString()}
                  </Badge>
                )}
                {book.meta?.dateStarted && (
                  <Badge variant="outline" className="text-light-200">
                    Débuté le: {new Date(book.meta.dateStarted).toLocaleDateString()}
                  </Badge>
                )}
                {book.meta?.dateFinished && (
                  <Badge variant="outline" className="text-light-200">
                    Terminé le: {new Date(book.meta.dateFinished).toLocaleDateString()}
                  </Badge>
                )}
                {book.pages && (
                  <Badge variant="outline" className="text-light-200">
                    {book.meta?.pagesRead || 0} / {book.pages} pages lues
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
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
              <Card className="bg-dark-100/50 border-light-100/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Ajouter votre avis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-light-200">Votre note:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 cursor-pointer transition-all duration-200 ${
                          star <= userRating 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-gray-400'
                        } hover:text-yellow-300 hover:scale-110`}
                        onClick={() => handleRating(star)}
                      />
                    ))}
                  </div>
                </div>
                
                <Textarea
                  placeholder="Partagez votre expérience de lecture..."
                  value={userReview}
                  onChange={(e) => setUserReview(e.target.value)}
                  className="bg-dark-100 border-light-100/20 text-white min-h-[100px]"
                />
                
                <Button 
                  onClick={submitReview}
                  disabled={!userReview.trim()}
                  className="bg-gradient-to-r from-[#D6C7FF] to-[#AB8BFF] text-primary hover:from-[#AB8BFF] hover:to-[#8B5DFF]"
                >
                  Publier votre avis
                </Button>
              </CardContent>
            </Card>

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
        
        {/* Edit Book Sheet */}
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
              shelves={shelves}
              onCanSaveChange={setCanSaveForm}
              onSave={handleSaveBook}
            />
            <SheetFooter>
              <div className="flex items-center gap-2">
                <Button 
                  variant="muted" 
                  onClick={() => { setIsAddOpen(false); setEditingBook(null); bookFormRef.current?.reset() }}
                  disabled={isSaving}
                >
                  Annuler
                </Button>
                <Button
                  variant="secondary"
                  onClick={async () => {    
                    if (!bookFormRef.current) return
                    const { ok } = await bookFormRef.current.submit()
                    if (ok) {
                      toast.success("Livre mis à jour")
                      setIsAddOpen(false)
                      setEditingBook(null)
                    } else {
                      toast.error("Erreur : vérifiez les champs du livre")
                    }
                  }}
                  disabled={!canSaveForm || isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sauvegarde...
                    </>
                  ) : (
                    'Mettre à jour'
                  )}
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