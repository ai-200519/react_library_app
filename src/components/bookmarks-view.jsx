import React, { useState, useEffect } from 'react'
import { Search, Quote, Heart, BookOpen, Filter, Calendar, Loader2, BookmarkCheck, Star, ChevronDown, ChevronUp } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ApiService from '../services/api'
import { toast } from 'sonner'
import WishlistSkeletonLoader from './quoteCard-skeleton'

const BookmarksView = () => {
  const [quotes, setQuotes] = useState([])
  const [books, setBooks] = useState([])
  const [filteredQuotes, setFilteredQuotes] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBook, setSelectedBook] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [isLoading, setIsLoading] = useState(true)
  const [expandedQuote, setExpandedQuote] = useState(null)

  useEffect(() => {
    loadBookmarksData()
  }, [])

  useEffect(() => {
    filterAndSortQuotes()
  }, [quotes, searchTerm, selectedBook, sortBy])

  const loadBookmarksData = async () => {
    try {
      setIsLoading(true)
      
      // Load all books first
      const allBooks = await ApiService.getBooks()
      setBooks(allBooks)
      
      // Load quotes for all books
      const allQuotes = []
      
      for (const book of allBooks) {
        try {
          const bookQuotes = await ApiService.getBookQuotesOfflineFirst(book.id)
          const quotesWithBookInfo = bookQuotes.map(quote => ({
            ...quote,
            bookTitle: book.title,
            bookAuthor: book.author,
            bookId: book.id,
            bookImageUrl: book.imageUrl,
            bookSeries: book.series,
            bookVolume: book.volume,
            bookUserRating: book.personal_rating,
            bookGenre: book.genre,
            bookPages: book.pages,
            bookLanguage: book.language,
            bookPublishedYear: book.publishedYear
          }))
          allQuotes.push(...quotesWithBookInfo)
        } catch (error) {
          console.warn(`Failed to load quotes for book ${book.title}:`, error)
        }
      }
      
      setQuotes(allQuotes)
      
    } catch (error) {
      console.error('Failed to load bookmarks data:', error)
      toast.error("Erreur lors du chargement des citations")
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortQuotes = () => {
    let filtered = [...quotes]
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(quote => 
        quote.quote_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.bookAuthor.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Filter by book
    if (selectedBook !== 'all') {
      if (selectedBook === 'favorites') {
        filtered = filtered.filter(quote => quote.is_favorite)
      } else {
        filtered = filtered.filter(quote => quote.bookId === selectedBook)
      }
    }
    
    // Sort quotes
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at)
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at)
        case 'book':
          return a.bookTitle.localeCompare(b.bookTitle)
        case 'favorites':
          if (a.is_favorite && !b.is_favorite) return -1
          if (!a.is_favorite && b.is_favorite) return 1
          return new Date(b.created_at) - new Date(a.created_at)
        default:
          return 0
      }
    })
    
    setFilteredQuotes(filtered)
  }

  const toggleQuoteFavorite = async (quote) => {
    try {
      const updatedQuote = await ApiService.updateQuote(quote.id, {
        is_favorite: !quote.is_favorite
      })
      
      // Update local state
      const updatedQuotes = quotes.map(q => 
        q.id === quote.id 
          ? { ...q, is_favorite: updatedQuote.is_favorite }
          : q
      )
      setQuotes(updatedQuotes)
      
      toast.success(updatedQuote.is_favorite ? "Ajouté aux favoris" : "Retiré des favoris")
      
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
      toast.error("Erreur lors de la mise à jour")
    }
  }

  const toggleExpanded = (quoteId) => {
    setExpandedQuote(expandedQuote === quoteId ? null : quoteId)
  }

  const getBookInfo = (quote) => {
    return {
      title: quote.bookTitle || 'Titre inconnu',
      author: quote.bookAuthor || 'Auteur inconnu',
      imageUrl: quote.bookImageUrl || '/src/assets/no-book.png',
      series: quote.bookSeries || 'Non spécifiée',
      volume: quote.bookVolume || 'Non spécifié',
      rating: quote.bookUserRating || 'Non noté',
      genre: quote.bookGenre || 'Non spécifié',
      pages: quote.bookPages || 'Non spécifié',
      language: quote.bookLanguage || 'Non spécifié',
      publishedYear: quote.bookPublishedYear || 'Non spécifié'
    }
  }  

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary">
        {/* Header - even while loading */}
        <div className="bg-gradient-to-r from-dark-100 via-dark-100 to-dark-100/90 border-b border-light-100/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <BookmarkCheck className="h-8 w-8 text-[#AB8BFF]" />
                <h1 className="text-4xl font-bold text-white">Mes Citations</h1>
              </div>
              <p className="text-light-200 text-lg animate-pulse">
                Chargement de vos citations...
              </p>
            </div>
          </div>
        </div>

        {/* Loading Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <WishlistSkeletonLoader 
            type="quote" 
            count={5} 
            message="Chargement des citations favorites..." 
          />
        </div>
      </div>
    )
  }

  const favoriteQuotes = quotes.filter(q => q.is_favorite)

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <div className="bg-gradient-to-r from-dark-100 via-dark-100 to-dark-100/90 border-b border-light-100/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BookmarkCheck className="h-8 w-8 text-[#AB8BFF]" />
              <h1 className="text-4xl font-bold text-white">Mes Citations</h1>
            </div>
            <p className="text-light-200 text-lg">
              {quotes.length} citation{quotes.length !== 1 ? 's' : ''} sauvegardée{quotes.length !== 1 ? 's' : ''}, 
              dont {favoriteQuotes.length} favorite{favoriteQuotes.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-dark-100/50 border border-light-100/20 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-light-200" />
              <Input
                placeholder="Rechercher dans les citations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-dark-100 border-light-100/20 text-white"
              />
            </div>

            {/* Book Filter */}
            <Select value={selectedBook} onValueChange={setSelectedBook}>
              <SelectTrigger className="bg-dark-100 border-light-100/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les livres</SelectItem>
                <SelectItem value="favorites">Favoris uniquement</SelectItem>
                {books.map((book) => (
                  <SelectItem key={book.id} value={book.id}>
                    {book.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-dark-100 border-light-100/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Plus récentes</SelectItem>
                <SelectItem value="oldest">Plus anciennes</SelectItem>
                <SelectItem value="book">Par livre</SelectItem>
                <SelectItem value="favorites">Favoris d'abord</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        {filteredQuotes.length === 0 ? (
          <div className="text-center py-12">
            <Quote className="h-16 w-16 text-light-200/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm || selectedBook !== 'all' ? 'Aucune citation trouvée' : 'Aucune citation sauvegardée'}
            </h3>
            <p className="text-light-200 max-w-md mx-auto">
              {searchTerm || selectedBook !== 'all' 
                ? 'Essayez de modifier vos critères de recherche'
                : 'Commencez par ajouter des citations à vos livres favoris'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuotes.map((quote) => {
            const bookInfo = getBookInfo(quote)
            
            return (
              <Card key={quote.id} className="bg-gradient-to-br from-dark-100/70 to-purple-900/20 border-light-100/20 backdrop-blur-sm hover:border-[#AB8BFF]/30 transition-colors duration-300">
                <CardContent className="p-6">
                  {/* Book Info Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={bookInfo.imageUrl}
                      alt={bookInfo.title}
                      className="w-12 h-16 rounded object-cover"
                      onError={(e) => {
                        e.target.src = '/src/assets/no-book.png'
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-lg">{bookInfo.title}</h3>
                      <p className="text-light-200 text-sm">{bookInfo.author}</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {bookInfo.series !== 'Non spécifiée' && (
                          <Badge variant="outline" className="text-xs border-light-100/30">
                            Série: {bookInfo.series}
                          </Badge>
                        )}
                        {bookInfo.volume !== 'Non spécifié' && (
                          <Badge variant="outline" className="text-xs border-light-100/30">
                            Volume: {bookInfo.volume}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleQuoteFavorite(quote)}
                      className={`${quote.is_favorite ? 'text-red-400' : 'text-light-200'} hover:scale-110 transition-transform`}
                    >
                      <Heart className={`h-5 w-5 ${quote.is_favorite ? 'fill-current' : ''}`} />
                    </Button>
                  </div>

                  {/* Quote */}
                  <blockquote className="relative mb-4">
                    <Quote className="absolute -top-2 -left-2 h-6 w-6 text-[#AB8BFF]/40" />
                    <p className={`text-white text-lg italic leading-relaxed pl-6 ${
                      !expandedQuote || expandedQuote !== quote.id ? 'line-clamp-3' : ''
                    }`}>
                      {quote.quote_text || "Aucun texte de citation disponible"}
                    </p>
                    {quote.quote_text && quote.quote_text.length > 200 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(quote.id)}
                        className="text-[#AB8BFF] hover:text-purple-300 p-0 h-auto text-sm mt-2"
                      >
                        {expandedQuote === quote.id ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Voir moins
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            Voir plus
                          </>
                        )}
                      </Button>
                    )}
                  </blockquote>

                  {/* Quote Details */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-light-200/70 mb-3">
                    {quote.page_number ? (
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        Page {quote.page_number}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-light-200/50">
                        <BookOpen className="h-3 w-3" />
                        Page non spécifiée
                      </span>
                    )}
                    
                    {quote.chapter ? (
                      <Badge variant="outline" className="text-xs border-light-100/30">
                        Chapitre: {quote.chapter}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs border-light-100/30 text-light-200/50">
                        Aucun chapitre
                      </Badge>
                    )}
                    
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {quote.created_at ? 
                        new Date(quote.created_at).toLocaleDateString('fr-FR') : 
                        'Date inconnue'
                      }
                    </span>
                  </div>

                  {/* Personal Notes */}
                  <div className="bg-dark-100/60 border border-light-100/10 rounded-lg p-3">
                    <h4 className="text-xs uppercase tracking-wide text-light-300 mb-1">
                      Mes notes
                    </h4>
                    <p className="text-light-100 text-sm">
                      {quote.notes || "Aucune note personnelle pour cette citation"}
                    </p>
                  </div>

                  {/* Additional Book Info */}
                  <div className="mt-4 pt-3 border-t border-light-100/10">
                    <div className="grid grid-cols-2 gap-2 text-xs text-light-200/60">
                      <div>Genre: {bookInfo.genre}</div>
                      <div>Langue: {bookInfo.language}</div>
                      <div>Année: {bookInfo.publishedYear}</div>
                      {bookInfo.rating !== 'Non noté' && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-400" />
                          Note personnel : {bookInfo.rating}/5
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                </Card>
              )
            })}          
        </div>
        )}
      </div>
    </div>
  )
}

export default BookmarksView