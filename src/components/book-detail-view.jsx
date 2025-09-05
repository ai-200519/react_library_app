import React, { useEffect, useState } from 'react'
import { ArrowLeft, Pencil, Trash2, Star, Calendar, BookOpen, Paperclip, Languages, Loader2, Wifi, WifiOff, Plus, Edit, Quote, Heart, MessageSquare, BookmarkCheck, Bookmark, ScanBarcode, PenTool, Landmark, NotebookPen, MessageCircleHeart, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Textarea } from './ui/textarea'
import BookForm from './book-form'
import { useRef } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { formatISBN } from '@/lib/isbn'
import ApiService from '../services/api'
import apiService from '../services/api'

const BookDetailView = ({ bookId, onBack }) => {
  const [book, setBook] = useState(null)
  const [userBooks, setUserBooks] = useState([])
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [userReview, setUserReview] = useState("")
  const [shelves, setShelves] = useState([])

  const [readingStatus, setReadingStatus] = useState("to_read")
  const [readingNotes, setReadingNotes] = useState("")
  const [editingBook, setEditingBook] = useState(null)
  const [isAddOpen, setIsAddOpen] = useState(false)  
  const bookFormRef = useRef(null)
  const [canSaveForm, setCanSaveForm] = useState(false)
  const [pagesRead, setPagesRead] = useState(0)
  
  // Quotes state
  const [quotes, setQuotes] = useState([])
  const [newQuote, setNewQuote] = useState("")
  const [newQuotePage, setNewQuotePage] = useState("")
  const [newQuoteChapter, setNewQuoteChapter] = useState("")
  const [newQuoteNotes, setNewQuoteNotes] = useState("")
  const [editingQuote, setEditingQuote] = useState(null)
  const [isQuoteSheetOpen, setIsQuoteSheetOpen] = useState(false)
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSaving, setIsSaving] = useState(false)

  const [isSavingReview, setIsSavingReview] = useState(false)
  const [quotesLoading, setQuotesLoading] = useState(false)
  const [reviewMode, setReviewMode] = useState("view")

 // hhmmm .... for description tab ... some styling
  const [expanded, setExpanded] = useState(false);

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

  // Load book data
  const loadBookData = async () => {
    try {
      setIsLoading(true)

      if (isOnline) {
        // Try to load from API first (already transformed by ApiService)
        const apiBooks = await ApiService.getBooks()
        const foundBook = apiBooks.find(b => b.id === bookId)
      
        setUserBooks(apiBooks)
        
        if (foundBook) {
          setBook(foundBook)
          setPagesRead(foundBook.meta?.pagesRead || 0)
          setUserRating(foundBook.personal_rating || 0)
          setUserReview(foundBook.personal_review || "")
          setReadingStatus(foundBook.reading_status || "to_read")
          setReadingNotes(foundBook.reading_notes || "")
                    
          // Load quotes
          loadQuotes(bookId)
        }
        
        // Update localStorage as cache
        localStorage.setItem('userBooks', JSON.stringify(apiBooks))
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
      toast.error("Erreur lors du chargement du livre")
    } finally {
      setIsLoading(false)
    }
  }

  // Load quotes
  const loadQuotes = async (bookId) => {
    try {
      setQuotesLoading(true)
      const bookQuotes = await ApiService.getBookQuotesOfflineFirst(bookId)
      setQuotes(bookQuotes)
    } catch (error) {
      console.error('Failed to load quotes:', error)
      toast.error("Erreur lors du chargement des citations")
    } finally {
      setQuotesLoading(false)
    }
  }

  useEffect(() => {
    loadBookData()
  }, [bookId])

  const deletePersonalReview = async () => {
    if (!book) return
    try {
      await ApiService.updateBookReview(book.id, {
        personal_rating: null,
        personal_review: null,
        reading_status: readingStatus,
        reading_notes: null
      })
      setUserReview("")
      setReadingNotes("")
      setReviewMode("edit")
      toast.success("Votre avis a été supprimé")
    } catch (error) {
      console.error("Failed to delete review:", error)
      toast.error("Erreur lors de la suppression")
    }
  }
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
        savedBook = await ApiService.updateBook(editingBook.id, bookData)
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

  const handleEdit = () => {
    setEditingBook(book)
    setIsAddOpen(true)
  }

  // Save personal review
  const savePersonalReview = async () => {
    if (!book) return
    
    try {
      setIsSavingReview(true)
      
      const reviewData = {
        personal_rating: userRating || null,
        personal_review: userReview.trim() || null,
        reading_status: readingStatus,
        reading_notes: readingNotes.trim() || null
      }

      await ApiService.updateBookReview(book.id, reviewData)
      
      // Update local book data
      const updatedBook = { 
        ...book, 
        personal_rating: userRating,
        personal_review: userReview,
        reading_status: readingStatus,
        reading_notes: readingNotes
      }
      setBook(updatedBook)
      
      toast.success("Votre avis a été sauvegardé")
      
    } catch (error) {
      console.error('Failed to save review:', error)
      if (!isOnline) {
        ApiService.queueOfflineChange({
          type: 'update_review',
          bookId: book.id,
          data: { personal_rating: userRating, personal_review: userReview, reading_status: readingStatus, reading_notes: readingNotes }
        })
        toast.info("Avis sauvegardé localement, sera synchronisé plus tard")
      } else {
        toast.error("Erreur lors de la sauvegarde")
      }
    } finally {
      setIsSavingReview(false)
    }
  }

const handleRatingChange = async (newRating) => {
  if (!book) return
  
  try {
    setUserRating(newRating);
    
    // Send rating update immediately
    await ApiService.updateBookReview(book.id, {
      personal_rating: newRating,
      reading_status: readingStatus,
    });
    
    // Update local state
    const updatedBook = { 
      ...book, 
      personal_rating: newRating,
      reading_status: readingStatus,
    };
    setBook(updatedBook);
    
    // Update userBooks array
    const updatedBooks = userBooks.map(b => 
      b.id === updatedBook.id ? updatedBook : b
    );
    setUserBooks(updatedBooks);
    localStorage.setItem('userBooks', JSON.stringify(updatedBooks));
    
    toast.success("Note sauvegardée");
    
  } catch (error) {
    console.error('Failed to save rating:', error);
    if (!isOnline) {
      ApiService.queueOfflineChange({
        type: 'update_review',
        bookId: book.id,
        data: { 
          personal_rating: newRating, 
          reading_status: readingStatus,
          personal_review: userReview,
          reading_notes: readingNotes
        }
      });
      toast.info("Note sauvegardée localement, sera synchronisée plus tard");
    } else {
      toast.error("Erreur lors de la sauvegarde de la note");
    }
  }
};
  // Add new quote
  const addQuote = async () => {
    if (!newQuote.trim()) {
      toast.error("Le texte de la citation est requis")
      return
    }

    try {
      const quoteData = {
        quote_text: newQuote.trim(),
        page_number: newQuotePage ? parseInt(newQuotePage) : null,
        chapter: newQuoteChapter.trim() || null,
        notes: newQuoteNotes.trim() || null,
        is_favorite: false
      }

      const quote = await ApiService.addQuote(book.id, quoteData)
      setQuotes([...quotes, quote])
      
      // Reset form
      setNewQuote("")
      setNewQuotePage("")
      setNewQuoteChapter("")
      setNewQuoteNotes("")
      setIsQuoteSheetOpen(false)
      
      toast.success("Citation ajoutée")
      
    } catch (error) {
      console.error('Failed to add quote:', error)
      toast.error("Erreur lors de l'ajout de la citation")
    }
  }

  // Toggle quote as favorite
  const toggleQuoteFavorite = async (quote) => {
    try {
      const updatedQuote = await ApiService.updateQuote(quote.id, {
        is_favorite: !quote.is_favorite
      })
      
      setQuotes(quotes.map(q => q.id === quote.id ? updatedQuote : q))
      toast.success(updatedQuote.is_favorite ? "Ajouté aux favoris" : "Retiré des favoris")
      
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
      toast.error("Erreur lors de la mise à jour")
    }
  }

  // Delete quote
  const deleteQuote = async (quoteId) => {
    try {
      await ApiService.deleteQuote(quoteId)
      setQuotes(quotes.filter(q => q.id !== quoteId))
      toast.success("Citation supprimée")
    } catch (error) {
      console.error('Failed to delete quote:', error)
      toast.error("Erreur lors de la suppression")
    }
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
  const statusOptions = ApiService.getReadingStatusOptions()

  return (
    <div className="min-h-screen bg-primary">
      {/* Enhanced Header with Connection Status */}
      <div className="bg-gradient-to-r from-dark-100 via-dark-100 to-dark-100/90 border-b border-light-100/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button 
                variant="secondary" 
                onClick={onBack}
                className="text-white  hover:scale-105 transition-all duration-200"
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
                className="hover:scale-105 transition-all duration-200"
                onClick={handleDelete}
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
                    className="flex w-auto h-auto max-w-sm mx-auto lg:mx-0 rounded-2xl shadow-2xl transform group-hover:scale-105 transition-transform duration-300"
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
                  <span className="text-lg font-semibold">Auteur (s):</span>
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
                      Série: {book.series ? book.series : "Non spécifiée" } {book.volume && `(Vol. ${book.volume})`}
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
                        : `??/??/${book.publishedYear}` || "N/A"
                      }
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <img className="h-8 w-8" src="/src/assets/write-paper.svg" alt="papers" />
                    <Badge variant="outline" className='text-lg ml-1.5'>
                      {book.pages || 0} pages
                    </Badge>
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
                    <div className="flex items-center gap-2">
                      <ScanBarcode className="text-white w-full h-full"/>
                      <Badge variant="outline" className ="text-lg ml-1.5">ISBN: 000-0-000-000</Badge>
                    </div>
                  )}
                </div>
                
                {/* Personal Rating */}
                <div className="flex items-center gap-2 mb-4 lg:justify-start text-light-200 ">
                  <MessageCircleHeart className="h-6 w-6 text-white"/>
                  <span className="text-lg font-semibold">Ma note (rating):</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 transition-all duration-200 ${
                          star <= userRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                  {userRating > 0 && <span className="text-light-200 text-sm">({userRating}/5)</span>}
                </div>
                
                {/* Genre Tags */}    
                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge className="bg-gradient-to-r from-[#D6C7FF] to-[#AB8BFF] text-primary">
                    {book.genre}
                  </Badge>
                  {book.meta?.tags?.length ? 
                  (book.meta.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-red-400 bg-red-400/10 border-light-100/30">
                      {tag}
                    </Badge>  
                    )))
                  : (
                    <Badge variant="outline" className="text-red-400 bg-red-400/10 border-light-100/30">
                      #notags 😒
                    </Badge>  
                  )
                  } 
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
      
      {/* Tabs Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="review" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-dark-100/40 mb-6">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="review">Mon Avis</TabsTrigger>
            <TabsTrigger value="quotes">Citations ({quotes.length})</TabsTrigger>
          </TabsList>

          {/* Description Tab */}
          <TabsContent value="description" className="space-y-6">
            {/* Additional Book Details Card */}
            <Card className="bg-dark-100/50 border-light-100/20">
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-light-200 flex gap-3"><Calendar/>Date d'ajout</div>
                <p className="text-white font-medium">
                  {book.meta?.dateAdded ? 
                    new Date(book.meta.dateAdded).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 
                    "Non spécifiée"
                  }
                </p>
              </div>
            </CardContent>
            </Card>            
            <Card className="bg-gradient-to-br from-dark-100/70 to-purple-900/20 border-light-100/20 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-white">
                  <BookOpen className="h-5 w-5 ml-1.5 mr-1 text-white" />
                  Description du livre
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {book.description ? (
                  <div className="relative">
                    <p className={`text-light-100 leading-relaxed text-lg font-serif ${
                      !expanded && "line-clamp-4"
                    }`}>
                      {book.description}
                    </p>
                    {book.description.length > 200 && (
                      <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-purple-400 hover:text-purple-300 text-sm font-medium mt-2 flex items-center gap-1"
                      >
                        {expanded ? (
                          <>
                            <ChevronUp className="h-4 w-4" />
                            Voir moins
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4" />
                            Voir plus
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-light-200/50 mx-auto mb-3" />
                    <p className="text-light-200 mb-2">Aucune description disponible</p>
                    <p className="text-light-200/70 text-sm">
                      Vous pouvez ajouter une description en modifiant ce livre
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Personal Review Tab */}
          <TabsContent value="review" className="space-y-6">
            <Card className="bg-dark-100/50 border-light-100/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <NotebookPen className="h-5 w-5" />
                  Mon avis personnel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
              {/* Rating Display - Similar to Progress Slider */}
              <div className="">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="text-white font-medium">Ma note</span>
                    {/* Interactive rating display */}
                    <div className="flex items-center gap-1 text-xs text-light-200">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= userRating 
                              ? 'text-yellow-400 fill-yellow-400' 
                              : 'text-gray-400'
                          }`}
                        />
                      ))} 
                      <div className="ml-1.5">
                        {userRating === 0 ? "Aucune note" : 
                        userRating === 5 ? "Excellent !" :
                        userRating === 4 ? "Très bon" :
                        userRating === 3 ? "Bon" :
                        userRating === 2 ? "Moyen" : "Décevant"}
                      </div>                   
                    </div>
                  </div>
                  <span className="text-white text-sm">
                    {userRating}/5
                  </span>
                </div>
              </div>
              { ( userReview || readingNotes ) && reviewMode === "view" ? (
                <div className="space-y-6">
                  {/* Main Review */}
                  { userReview  ? (
                    <blockquote className="relative pl-6 border-l-4 border-purple-400 text-xl italic leading-relaxed text-light-100">
                      "{userReview}"
                      <span className="absolute -top-2 -left-3 text-4xl text-purple-400 opacity-40">"</span>
                    </blockquote>
                  ) : (
                    <div className="text-white"> le champs de votre impression n'est pas remplit </div>
                  )}
                  
                  { readingNotes  ? (
                  <div className="bg-dark-100/60 border border-light-100/10 rounded-lg p-4">
                    <h4 className="text-sm uppercase tracking-wide text-light-300 mb-2">
                      Notes de lecture
                    </h4>
                    <p className="text-light-100 whitespace-pre-line">{readingNotes}</p>
                  </div>                  
                  ) : (
                    <div className="text-white"> le champs de votre notes n'est pas remplit </div>
                  )}                  
                  {/* Actions */}
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReviewMode("edit")}
                      className="flex items-center gap-2"
                    >
                      <Pencil className="h-4 w-4" /> Modifier
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={deletePersonalReview}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" /> Supprimer
                    </Button>
                  </div>
                </div>
                ) : (
                  <>
                  <div className='space-y-2'>
                    {/* Existing editable textareas */}
                    <span className="text-lg font-semibold">Régler votre Rating :</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 cursor-pointer transition-all duration-200 ${
                            star <= userRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'
                          } hover:text-yellow-300 hover:scale-110`}
                          onClick={() => handleRatingChange(star)}
                        />
                      ))}
                    </div>
                  {userRating > 0 && <span className="text-light-200 text-sm">({userRating}/5)</span>}  
                  </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm text-light-200">Mes impressions</label>
                      <Textarea
                        placeholder="Qu'avez-vous pensé de ce livre ?..."
                        value={userReview}
                        onChange={(e) => setUserReview(e.target.value)}
                        className="min-h-[120px] bg-dark-100 border-light-100/20 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-light-200">Notes de lecture</label>
                      <Textarea
                        placeholder="Notes personnelles..."
                        value={readingNotes}
                        onChange={(e) => setReadingNotes(e.target.value)}
                        className="min-h-[100px] bg-dark-100 border-light-100/20 text-white"
                      />
                    </div>
                    <Button 
                      onClick={async () => {
                        await savePersonalReview()
                        setReviewMode("view")
                      }}
                      disabled={isSavingReview}
                      className="bg-gradient-to-r from-[#D6C7FF] to-[#AB8BFF] text-primary"
                    >
                      {isSavingReview ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sauvegarde...
                        </>
                      ) : (
                        <>
                          <Pencil className="h-4 w-4 mr-2" />
                          Sauvegarder mon avis
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>


          {/* Quotes Tab */}
          <TabsContent value="quotes" className="space-y-6">
            <Card className="bg-dark-100/50 border-light-100/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Quote className="h-5 w-5" />
                    Mes citations favorites
                  </div>
                  <Button
                    onClick={() => setIsQuoteSheetOpen(true)}
                    size="sm"
                    className="bg-gradient-to-r from-[#D6C7FF] to-[#AB8BFF] text-primary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {quotesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-[#AB8BFF]" />
                  </div>
                ) : quotes.length === 0 ? (
                  <div className="text-center py-8">
                    <Quote className="h-12 w-12 text-light-200/50 mx-auto mb-3" />
                    <p className="text-light-200 mb-2">Aucune citation sauvegardée</p>
                    <p className="text-light-200/70 text-sm">Ajoutez vos passages préférés !</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {quotes.map((quote) => (
                      <div key={quote.id} className="border border-light-100/10 rounded-lg p-4 bg-dark-100/30">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <blockquote className="text-white italic text-lg leading-relaxed mb-2">
                              "{quote.quote_text}"
                            </blockquote>
                            {(quote.page_number || quote.chapter) && (
                              <div className="flex gap-4 text-sm text-light-200/70">
                                {quote.page_number && <span>Page {quote.page_number}</span>}
                                {quote.chapter && <span>Chapitre: {quote.chapter}</span>}
                              </div>
                            )}
                            {quote.notes && (
                              <p className="text-light-200 text-sm mt-2 bg-dark-100/50 p-2 rounded">
                                {quote.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleQuoteFavorite(quote)}
                              className={quote.is_favorite ? "text-red-400" : "text-light-200"}
                            >
                              <Heart className={`h-4 w-4 ${quote.is_favorite ? 'fill-current' : ''}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteQuote(quote.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-xs text-light-200/50">
                          Ajouté le {new Date(quote.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>


        </Tabs>

        {/* Add Quote Sheet */}
        <Sheet open={isQuoteSheetOpen} onOpenChange={setIsQuoteSheetOpen}>
          <SheetContent className="bg-primary text-white sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Ajouter une citation</SheetTitle>
            </SheetHeader>
            
            <div className="px-4 pb-4 space-y-4 overflow-y-auto">
              <div className="space-y-2">
                <label className="text-sm text-light-200">Citation *</label>
                <Textarea
                  placeholder="Saisissez le texte de la citation..."
                  value={newQuote}
                  onChange={(e) => setNewQuote(e.target.value)}
                  className="min-h-[100px] bg-dark-100 border-light-100/20 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-light-200">Page</label>
                  <Input
                    type="number"
                    placeholder="123"
                    value={newQuotePage}
                    onChange={(e) => setNewQuotePage(e.target.value)}
                    className="bg-dark-100 border-light-100/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-light-200">Chapitre</label>
                  <Input
                    placeholder="Chapitre 5"
                    value={newQuoteChapter}
                    onChange={(e) => setNewQuoteChapter(e.target.value)}
                    className="bg-dark-100 border-light-100/20 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-light-200">Notes personnelles</label>
                <Textarea
                  placeholder="Pourquoi cette citation vous a-t-elle marqué ?"
                  value={newQuoteNotes}
                  onChange={(e) => setNewQuoteNotes(e.target.value)}
                  className="bg-dark-100 border-light-100/20 text-white"
                />
              </div>
            </div>

            <SheetFooter className="mt-6">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setIsQuoteSheetOpen(false)}
                className="text-white border-light-100/30"
              >
                Annuler
              </Button>
              <Button
                onClick={addQuote}
                disabled={!newQuote.trim()}
                className="bg-gradient-to-r from-[#D6C7FF] to-[#AB8BFF] text-primary"
              >
                Ajouter la citation
              </Button>
            </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        
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