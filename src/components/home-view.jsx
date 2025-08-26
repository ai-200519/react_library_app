import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {Search, Loader2, ChevronLeft, ChevronRight, Globe, CalendarFold, PenTool, Accessibility } from "lucide-react"

const HomeView = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchFields, setSearchFields] = useState({
    title: true,
    author: true,
    year: true,
  })
  const [openLibraryBooks, setOpenLibraryBooks] = useState([])
  const [isLoadingAPI, setIsLoadingAPI] = useState(false) // Start as false, will be set to true only if fetching
  const [isSearching, setIsSearching] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const BOOKS_PER_PAGE = 24

  const allBooks = useMemo(() => {
    return [...openLibraryBooks]
  }, [openLibraryBooks])

  const [trendingBooks, setTrendingBooks] = useState([])
  const [isLoadingTrending, setIsLoadingTrending] = useState(false)

  const filteredBooks = useMemo(() => {
    if (!searchTerm) return allBooks

    const term = searchTerm.toLowerCase()
    return allBooks.filter((book) => {
      let matches = false

      if (searchFields.title && book.title?.toLowerCase().includes(term)) {
        matches = true
      }
      if (!matches && searchFields.author && book.author?.toLowerCase().includes(term)) {
        matches = true
      }
      if (!matches && searchFields.year && book.publishedYear?.toString().includes(searchTerm)) {
        matches = true
      }

      return matches
    })
  }, [allBooks, searchTerm, searchFields])

  const paginatedBooks = useMemo(() => {
    const startIndex = (currentPage - 1) * BOOKS_PER_PAGE
    const endIndex = startIndex + BOOKS_PER_PAGE
    return filteredBooks.slice(startIndex, endIndex)
  }, [filteredBooks, currentPage])

  const paginationInfo = useMemo(() => {
    const totalPages = Math.ceil(filteredBooks.length / BOOKS_PER_PAGE)
    const startIndex = (currentPage - 1) * BOOKS_PER_PAGE + 1
    const endIndex = Math.min(currentPage * BOOKS_PER_PAGE, filteredBooks.length)

    return {
      totalPages,
      startIndex,
      endIndex,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    }
  }, [filteredBooks.length, currentPage])

  useEffect(() => {
    const fetchOpenLibraryBooks = async () => {
      const cachedBooks = localStorage.getItem("openLibraryBooks")
      const cacheTimestamp = localStorage.getItem("openLibraryBooksTimestamp")
      const CACHE_DURATION = 30 * 60 * 1000 // 1/2 hour in milliseconds

      // If we have cached data and it's not expired, use it
      if (cachedBooks && cacheTimestamp) {
        const isExpired = Date.now() - Number.parseInt(cacheTimestamp) > CACHE_DURATION
        if (!isExpired) {
          console.log("Using cached OpenLibrary books")
          setOpenLibraryBooks(JSON.parse(cachedBooks))
          return
        }
      }

      try {
        console.log("Fetching fresh OpenLibrary books")
        setIsLoadingAPI(true)
        const response = await fetch(
          "https://openlibrary.org/search.json?q=bestseller&limit=800",
        )
        const data = await response.json()
        const formattedBooks = data.docs.map((book, index) => ({
          id: `ol-${book.key?.replace("/works/", "") || index}`,
          title: book.title || "Titre non disponible",
          author: book.author_name?.length > 1 ? book.author_name.join(", ") : book.author_name?.[0] || "Auteur inconnu",
          publishedYear: book.first_publish_year || new Date().getFullYear(),
          isbn: book.isbn?.[0].split("-") || "",
          genre: book.subject?.[0] || "Other",
          description: `Livre populaire de ${book.author_name || "auteur inconnu"}`,
          imageUrl: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : null,
          rating: (Math.random() * 2 + 3).toFixed(1), // Random rating between 3.0-5.0
          workKey: book.key, // Store the work key for description fetching
        }))

        localStorage.setItem("openLibraryBooks", JSON.stringify(formattedBooks))
        localStorage.setItem("openLibraryBooksTimestamp", Date.now().toString())

        setOpenLibraryBooks(formattedBooks)
        console.log("Cached", formattedBooks.length, "OpenLibrary books")
      } catch (error) {
        console.error("Erreur lors du chargement des livres OpenLibrary:", error)
      } finally {
        setIsLoadingAPI(false)
      }
    }

    fetchOpenLibraryBooks()
  }, []) // Empty dependency array ensures this only runs once per app session

  // Fetch trending books from OpenLibrary trending API
  useEffect(() => {
    const fetchTrendingBooks = async () => {
      const cachedTrending = localStorage.getItem("trendingBooks")
      const cacheTimestamp = localStorage.getItem("trendingBooksTimestamp")
      const CACHE_DURATION = 30 * 60 * 1000 // 1/2 hour in milliseconds

      // If we have cached data and it's not expired, use it
      if (cachedTrending && cacheTimestamp) {
        const isExpired = Date.now() - Number.parseInt(cacheTimestamp) > CACHE_DURATION
        if (!isExpired) {
          console.log("Using cached trending books")
          setTrendingBooks(JSON.parse(cachedTrending))
          return
        }
      }

      try {
        console.log("Fetching fresh trending books")
        setIsLoadingTrending(true)
          const response = await fetch("https://openlibrary.org/trending/yearly.json")
        const data = await response.json()
        
        // Parse the JSON data from OpenLibrary trending API
        const formattedTrendingBooks = data.works?.slice(0, 12).map((work, index) => ({
          id: `trending-${work.key?.replace("/works/", "") || index}`,
          title: work.title || "Titre non disponible",
          imageUrl: work.cover_i ? `https://covers.openlibrary.org/b/id/${work.cover_i}-L.jpg` : null,
          })) || []

        localStorage.setItem("trendingBooks", JSON.stringify(formattedTrendingBooks))
        localStorage.setItem("trendingBooksTimestamp", Date.now().toString())

        setTrendingBooks(formattedTrendingBooks)
        console.log("Cached", formattedTrendingBooks.length, "trending books")
      } catch (error) {
        console.error("Erreur lors du chargement des livres tendance:", error)
        // Fallback to sorting by rating if trending API fails
        const sortedByRating = [...allBooks].sort((a, b) => {
          const ratingA = parseFloat(a.rating) || 0
          const ratingB = parseFloat(b.rating) || 0
          return ratingB - ratingA
        })
        setTrendingBooks(sortedByRating.slice(0, 12))
      } finally {
        setIsLoadingTrending(false)
      }
    }

    fetchTrendingBooks()
  }, [allBooks]) // Depend on allBooks for fallback

  useEffect(() => {
    setIsSearching(true)
    const searchTimeout = setTimeout(() => {
      setCurrentPage(1) // Reset to first page on new search
      setIsSearching(false)
    }, 150) // Reduced from 300ms to 150ms

    return () => clearTimeout(searchTimeout)
  }, [searchTerm, searchFields])

  const getSearchPlaceholder = () => {
    const selectedFields = Object.entries(searchFields)
      .filter(([_, selected]) => selected)
      .map(([field, _]) => {
        switch (field) {
          case "title":
            return "titre"
          case "author":
            return "auteur"
          case "year":
            return "année"
          default:
            return field
        }
      })

    if (selectedFields.length === 0) {
      return "Sélectionnez au moins un champ de recherche"
    }

    return `Rechercher par ${selectedFields.join(", ")}...`
  }

  const handleSearchFieldChange = (field, checked) => {
    setSearchFields((prev) => ({
      ...prev,
      [field]: checked,
    }))
  }

  const handlePrevPage = () => {
    if (paginationInfo.hasPrevPage) {
      setCurrentPage((prev) => prev - 1)
    }
  }

  const handleNextPage = () => {
    if (paginationInfo.hasNextPage) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const handlePageClick = (page) => {
    setCurrentPage(page)
  }
  return (
    <>
      <div className="pattern"/>
            
      <div className="wrapper space-y-6">
          <header>
            <h1 className="mb-6 text-4xl leading-tight font-serif italic"><span className="text-gradient">"Lire</span>, c'est <span className="text-gradient">grandir</span>... "<br/></h1>          
            <img src="/src/assets/hero.png" alt="Book Banner" className="max-w-xs mx-auto" />
            <h1 className="mt-6">Les <span className="text-gradient">Livres</span> vous attendent... <br /> Cataloguez, organisez et trouvez vos <span className="text-gradient">collections</span> .</h1>
          </header>
          <Card className="mt-5.5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe color="#AB8BFF" className="h-5 w-5 text-primary" />
                <CardTitle>Explorer les livres en ligne</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="space-y-3">
              <span className="text-sm font-medium">Rechercher dans:</span>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="search-title"
                    checked={searchFields.title}
                    onCheckedChange={(checked) => handleSearchFieldChange("title", checked)}
                  />
                  <label
                    htmlFor="search-title"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Titre
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="search-author"
                    checked={searchFields.author}
                    onCheckedChange={(checked) => handleSearchFieldChange("author", checked)}
                  />
                  <label
                    htmlFor="search-author"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Auteur
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="search-year"
                    checked={searchFields.year}
                    onCheckedChange={(checked) => handleSearchFieldChange("year", checked)}
                  />
                  <label
                    htmlFor="search-year"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  > 
                    Année
                  </label>
                </div>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={getSearchPlaceholder()}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 hover:border-[#AB8BFF]/50 focus:border-primary transition-colors"
                disabled={!searchFields.title && !searchFields.author && !searchFields.year}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-white">
                {filteredBooks.length > 0 ? (
                  <span>
                    Affichage de {paginationInfo.startIndex}-{paginationInfo.endIndex} sur {filteredBooks.length} livre(s)
                  </span>
                ) : (
                  <span>0 livre(s) trouvé(s)</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <div>
        <header>
          <div className="flex items-center gap-2">
            {isSearching && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
          </div>
        </header>
        <main>
          {isSearching && (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 color="#AB8BFF" className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-white animate-pulse">Recherche en cours...</p>
                </div>
              </div>
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"   
              >
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg animate-pulse `}
                  >
                    <div
                      className={`w-full h-32 mb-3 bg-[#AB8BFF] rounded flex-shrink-0`}
                    ></div>
                    <div className={`space-y-2`}>
                      <div className="h-4 bg-[#AB8BFF] rounded w-3/4"></div>
                      <div className="h-3 bg-[#AB8BFF] rounded w-1/2"></div>
                      <div className="flex items-center gap-2">
                        <div className="h-5 bg-[#AB8BFF] rounded w-16"></div>
                        <div className="h-5 bg-[#AB8BFF] rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>              
            </div>
          )}

          {!isSearching && (
            <div className="space-y-4">
              {isLoadingTrending ? (
                <section className="trending">
                  <h2>Tendances</h2>
                  <div className="flex items-center justify-center py-4">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <p className="text-xs text-white animate-pulse">Chargement des tendances...</p>
                    </div>
                  </div>
                </section>
              ) : trendingBooks.length > 0 && (
                <section className="trending">
                  <h2>Tendances</h2>
                  <ul>
                    {trendingBooks.map((book, index) => (
                      <li key={book.id}>
                        <p>{index + 1}</p>
                        <img src={book.imageUrl || "/src/assets/no-book.png"} alt={book.title} />
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section className="all-movies">
                <h2>Tous les livres</h2>

                {isLoadingAPI ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm text-white animate-pulse">Chargement...</p>
                    </div>
                  </div>
                ) : filteredBooks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-10">
                    <Accessibility className=" text-white mx-auto mb-4 w-24 h-24 opacity-60" />
                    <p className="text-sm text-gray-100">Aucun résultat trouvé</p>
                  </div>
                ) : (
                  <>
                    <ul>
                      {paginatedBooks.map((book) => (
                        <li key={book.id} className="movie-card">
                          <img src={book.imageUrl || "/src/assets/no-book.png"} ClassName="rounded-lg w-full h-auto object-cover cursor-pointer hover:opacity-80 mb-2 group-hover:scale-105 transition-transform duration-200" alt={book.title} />
                          <h3 className="text-[16px] mt-2.5 ">{book.title}</h3>
                          <div className="content">
                            <div className="rating">
                              <img src="/src/assets/star.svg" alt="rating" />
                              <p>{book.rating}</p>
                            </div>
                            <span>•</span>
                            <span>
                            <PenTool className="size-3"></PenTool>
                            </span>                            
                            <span className="lang">{book.author}</span>
                            <span>•</span>
                            <span>
                            <CalendarFold className="size-3"></CalendarFold>
                            </span>
                            <span className="year">{book.publishedYear}</span>
                          </div>
                        </li>
                      ))}
                    </ul>

                    {paginationInfo.totalPages > 1 && (
                      <div className="mt-4 flex items-center justify-between">
                        <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={!paginationInfo.hasPrevPage}>
                          <ChevronLeft className="h-4 w-4 mr-1" /> Précédent
                        </Button>

                        {/* Page number buttons */}
                        <div className="flex items-center gap-2">
                          {(() => {
                            const total = paginationInfo.totalPages
                            const pages = []
                            if (total <= 7) {
                              for (let i = 1; i <= total; i++) pages.push(i)
                            } else {
                              const start = Math.max(2, currentPage - 2)
                              const end = Math.min(total - 1, currentPage + 2)
                              pages.push(1)
                              if (start > 2) pages.push("...")
                              for (let i = start; i <= end; i++) pages.push(i)
                              if (end < total - 1) pages.push("...")
                              pages.push(total)
                            }
                            return pages.map((p, idx) =>
                              typeof p === "number" ? (
                                <Button
                                  key={`${p}-${idx}`}
                                  variant={p === currentPage ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handlePageClick(p)}
                                >
                                  {p}
                                </Button>
                              ) : (
                                <span key={`ellipsis-${idx}`} className="px-2 text-gray-100">…</span>
                              ),
                            )
                          })()}
                        </div>

                        <Button variant="outline" size="sm" onClick={handleNextPage} disabled={!paginationInfo.hasNextPage}>
                          Suivant <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </section>
            </div>
          )}
        </main>
        </div>              


      </div>
    </>
  )
}

export default HomeView