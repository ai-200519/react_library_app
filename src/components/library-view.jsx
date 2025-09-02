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
import { BookOpen, Hash, ArrowRightLeft, Plus, BookCopy, Layers, Trash2, Pencil, Eye, Edit, PenTool, Calendar1, CalendarCog, CalendarFold, Tag, Tags, TagsIcon, MoreHorizontal, BookHeart, Loader2, Wifi, WifiOff, AlertCircle, RefreshCw, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card } from './ui/card'
import LendBorrowList from './lend-borrow-list'
import { toast } from 'sonner'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import BookForm from './book-form'
import { Progress } from './ui/progress'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './ui/breadcrumb'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,   DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuRadioGroup, DropdownMenuRadioItem, } from './ui/dropdown-menu'
import DropdownDot from './DropdownDot'
import BookCard from './book-card'

import { Search, Filter, X } from "lucide-react"

const LibraryView = ({ onBookSelect, onBack }) => {
  // State management
  const [userBooks, setUserBooks] = useState([])
  const [activeSection, setActiveSection] = useState("myBooks")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const bookFormRef = useRef(null)
  const [canSaveForm, setCanSaveForm] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [selectedTag, setSelectedTag] = useState(null)
  const [dialogTag, setDialogTag] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [selectedShelf, setSelectedShelf] = useState(null)
  const [shelves, setShelves] = useState([])
  
  // Loading and network states
  const [isLoading, setIsLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState(null)
  const [hasLocalData, setHasLocalData] = useState(false)
  const [migrationStatus, setMigrationStatus] = useState(null)

  // Shelf management states
  const [isAddShelfDialogOpen, setIsAddShelfDialogOpen] = useState(false)
  const [newShelfName, setNewShelfName] = useState("")
  const [dialogShelf, setDialogShelf] = useState(null)
  const [isShelfDialogOpen, setIsShelfDialogOpen] = useState(false)
  const [newShelfRenameName, setNewShelfRenameName] = useState("")

  // API Service - we'll implement this inline for now
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

  const [searchTerm, setSearchTerm] = useState("")
  const [filterOptions, setFilterOptions] = useState({
    status: "all", // all, read, unread, reading
    sortBy: "title", // title, author, dateAdded, rating
    sortOrder: "asc", // asc, desc
  })
  
  const filterBooks = (books) => {
    let filtered = books.filter(book => {
      // Search term filtering (null-safe)
      const search = (searchTerm || '').toLowerCase()
      const title = (book.title || '').toLowerCase()
      const author = (book.author || '').toLowerCase()
      const tags = Array.isArray(book.meta?.tags) ? book.meta.tags : []
      const matchesSearch = 
        !search || 
        title.includes(search) ||
        author.includes(search) ||
        tags.some(tag => (tag || '').toLowerCase().includes(search))
      
      // Status filtering
      let matchesStatus = true
      if (filterOptions.status !== "all") {
        if (filterOptions.status === "read") {
          matchesStatus = book.meta?.dateFinished !== null
        } else if (filterOptions.status === "unread") {
          matchesStatus = book.meta?.dateStarted === null && book.meta?.dateFinished === null
        } else if (filterOptions.status === "reading") {
          matchesStatus = book.meta?.dateStarted !== null && book.meta?.dateFinished === null
        }
      }
      
      return matchesSearch && matchesStatus
    })
    
    // Sorting
    filtered.sort((a, b) => {
      let valueA, valueB
      
      switch (filterOptions.sortBy) {
        case "title":
          valueA = (a.title || '').toLowerCase()
          valueB = (b.title || '').toLowerCase()
          break
        case "author":
          valueA = (a.author || '').toLowerCase()
          valueB = (b.author || '').toLowerCase()
          break
        case "dateAdded":
          valueA = new Date(a.meta?.dateAdded || 0)
          valueB = new Date(b.meta?.dateAdded || 0)
          break
        case "rating":
          valueA = a.rating || 0
          valueB = b.rating || 0
          break
        default:
          valueA = (a.title || '').toLowerCase()
          valueB = (b.title || '').toLowerCase()
      }
      
      if (filterOptions.sortOrder === "asc") {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0
      }
    })
    
    return filtered
  }

  const getDeviceId = () => {
    let deviceId = localStorage.getItem('deviceId')
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('deviceId', deviceId)
    }
    return deviceId
  }

  const apiRequest = async (endpoint, options = {}) => {
    if (!isOnline) {
      throw new Error('No internet connection')
    }

    const url = `${API_BASE}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'X-Device-ID': getDeviceId(),
      },
      ...options,
    }

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body)
    }

    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  // Transform data between frontend and backend formats
  const transformToBackendFormat = (frontendBook) => {
    return {
      title: frontendBook.title,
      author: frontendBook.author,
      series: frontendBook.series || null,
      volume: frontendBook.volume || null,
      publication_date: frontendBook.publicationDate || null,
      isbn: frontendBook.isbn || null,
      language: frontendBook.language || null,
      pages: frontendBook.pages ? parseInt(frontendBook.pages) : null,
      genre: frontendBook.genre || null,
      description: frontendBook.description || null,
      image_url: frontendBook.imageUrl || null,
      rating: frontendBook.rating ? parseFloat(frontendBook.rating) : null,
      published_year: frontendBook.publishedYear ? parseInt(frontendBook.publishedYear) : null,
      work_key: frontendBook.workKey || null,
      pages_read: frontendBook.meta?.pagesRead || 0,
      date_started: frontendBook.meta?.dateStarted || null,
      date_finished: frontendBook.meta?.dateFinished || null,
      due_date: frontendBook.meta?.dueDate || null,
      lend_to: frontendBook.meta?.lendTo || null,
      borrow_from: frontendBook.meta?.borrowFrom || null,
      date_added: frontendBook.meta?.dateAdded || new Date().toISOString(),
      shelves: frontendBook.meta?.shelves || [],
      tags: frontendBook.meta?.tags || [],
    }
  }

  const transformFromBackendFormat = (backendBook) => {
    return {
      id: backendBook.id,
      title: backendBook.title,
      author: backendBook.author,
      series: backendBook.series,
      volume: backendBook.volume,
      publicationDate: backendBook.publication_date,
      publishedYear: backendBook.published_year,
      isbn: backendBook.isbn,
      genre: backendBook.genre,
      description: backendBook.description,
      imageUrl: backendBook.image_url,
      language: backendBook.language,
      pages: backendBook.pages,
      rating: backendBook.rating,
      workKey: backendBook.work_key,
      meta: {
        pagesRead: backendBook.pages_read || 0,
        dateStarted: backendBook.date_started,
        dateFinished: backendBook.date_finished,
        dueDate: backendBook.due_date,
        lendTo: backendBook.lend_to,
        borrowFrom: backendBook.borrow_from,
        dateAdded: backendBook.date_added,
        shelves: extractShelfIds(backendBook.shelves),
        shelfName: extractShelfNames(backendBook.shelves),
        tags: Array.isArray(backendBook.tags) ? backendBook.tags : [],
      },
    }
  }

  const extractShelfIds = (shelves) => {
    if (!Array.isArray(shelves)) return []
    return shelves.map(shelf => typeof shelf === 'object' ? shelf.id : shelf).filter(Boolean)
  }

  const extractShelfNames = (shelves) => {
    if (!Array.isArray(shelves)) return ''
    const names = shelves
      .map(shelf => typeof shelf === 'object' ? shelf.name : '')
      .filter(Boolean)
    return names.join(', ')
  }

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      toast.success("Connexion rétablie", {
        description: "Synchronisation automatique..."
      })
      loadDataFromAPI()
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      toast.warning("Mode hors ligne", {
        description: "Les changements seront synchronisés à la reconnexion"
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Check for local data that needs migration
  useEffect(() => {
    const localBooks = JSON.parse(localStorage.getItem('userBooks') || '[]')
    const localShelves = JSON.parse(localStorage.getItem('userShelves') || '[]')
    setHasLocalData(localBooks.length > 0 || localShelves.length > 0)
  }, [])

  // Load data from API with fallback to localStorage
  const loadDataFromAPI = async () => {
    try {
      setIsLoading(true)
      
      if (!isOnline) {
        // Offline mode - use localStorage
        const localBooks = JSON.parse(localStorage.getItem('userBooks') || '[]')
        const localShelves = JSON.parse(localStorage.getItem('userShelves') || '[]')
        setUserBooks(localBooks)
        setShelves(localShelves.length > 0 ? localShelves : [{ id: "default", name: "Ma Bibliothèque" }])
        return
      }

      // Online mode - fetch from API
      const [apiBooks, apiShelves] = await Promise.all([
        apiRequest('/books'),
        apiRequest('/shelves')
      ])

      
      const transformedBooks = apiBooks.map(book => transformFromBackendFormat(book))
      setUserBooks(transformedBooks)
      setShelves(apiShelves.length > 0 ? apiShelves : [{ id: "default", name: "Ma Bibliothèque" }])
      
      // Update localStorage as cache
      localStorage.setItem('userBooks', JSON.stringify(transformedBooks))
      localStorage.setItem('userShelves', JSON.stringify(apiShelves))
      
      setLastSyncTime(new Date())

      // Check if migration is needed
      if (hasLocalData && transformedBooks.length === 0 && apiShelves.length <= 1) {
        setMigrationStatus('needed')
      }
      
    } catch (error) {
      console.error('Failed to load data from API:', error)
      
      // Fallback to localStorage
      const localBooks = JSON.parse(localStorage.getItem('userBooks') || '[]')
      const localShelves = JSON.parse(localStorage.getItem('userShelves') || '[]')
      setUserBooks(localBooks)
      setShelves(localShelves.length > 0 ? localShelves : [{ id: "default", name: "Ma Bibliothèque" }])
      
      toast.error("Erreur de connexion", {
        description: "Mode hors ligne activé"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Initial data loading
  useEffect(() => {
    loadDataFromAPI()
  }, [])

  // Migration function
  const handleMigration = async () => {
    if (!isOnline) {
      toast.error("Migration impossible hors ligne")
      return
    }

    try {
      setIsSyncing(true)
      setMigrationStatus('in_progress')
      
      const localBooks = JSON.parse(localStorage.getItem('userBooks') || '[]')
      const localShelves = JSON.parse(localStorage.getItem('userShelves') || '[]')
      
      let migratedBooks = 0
      let migratedShelves = 0
      let errors = []

      // Migrate shelves first
      for (const shelf of localShelves) {
        try {
          await apiRequest('/shelves', {
            method: 'POST',
            body: { name: shelf.name, description: shelf.description || null }
          })
          migratedShelves++
        } catch (error) {
          console.warn(`Failed to migrate shelf: ${shelf.name}`, error)
          errors.push(`Shelf "${shelf.name}": ${error.message}`)
        }
      }

      // Migrate books
      for (const book of localBooks) {
        try {
          const backendBook = transformToBackendFormat(book)
          await apiRequest('/books', {
            method: 'POST',
            body: backendBook
          })
          migratedBooks++
        } catch (error) {
          console.warn(`Failed to migrate book: ${book.title}`, error)
          errors.push(`Book "${book.title}": ${error.message}`)
        }
      }

      // Clear localStorage after successful migration
      if (migratedBooks > 0 || migratedShelves > 0) {
        const backup = {
          books: localBooks,
          shelves: localShelves,
          timestamp: new Date().toISOString()
        }
        localStorage.setItem('migrationBackup', JSON.stringify(backup))
        localStorage.removeItem('userBooks')
        localStorage.removeItem('userShelves')
        
        setMigrationStatus('completed')
        toast.success("Migration terminée", {
          description: `${migratedBooks} livres et ${migratedShelves} étagères migrés`
        })
        
        // Reload data
        await loadDataFromAPI()
        setHasLocalData(false)
      }

    } catch (error) {
      console.error('Migration failed:', error)
      setMigrationStatus('failed')
      toast.error("Échec de la migration", {
        description: "Vos données locales sont conservées"
      })
    } finally {
      setIsSyncing(false)
    }
  }

  // Save book (create or update)
  const handleSaveBook = async (bookData) => {
    try {
      let savedBook

      if (isOnline) {
        if (editingBook) {
          // Update existing book
          const backendBook = transformToBackendFormat(bookData)
          const updatedBook = await apiRequest(`/books/${editingBook.id}`, {
            method: 'PUT',
            body: backendBook
          })
          savedBook = transformFromBackendFormat(updatedBook)
          
          setUserBooks(prev => prev.map(b => b.id === savedBook.id ? savedBook : b))
        } else {
          // Create new book
          const backendBook = transformToBackendFormat(bookData)
          const newBook = await apiRequest('/books', {
            method: 'POST',
            body: backendBook
          })
          savedBook = transformFromBackendFormat(newBook)
          
          setUserBooks(prev => [savedBook, ...prev])
        }
        
        // Update localStorage cache
        const updatedBooks = editingBook 
          ? userBooks.map(b => b.id === savedBook.id ? savedBook : b)
          : [savedBook, ...userBooks]
        localStorage.setItem('userBooks', JSON.stringify(updatedBooks))
        
        toast.success(editingBook ? "Livre mis à jour" : "Livre créé")
        
      } else {
        // Offline mode - save to localStorage only
        if (editingBook) {
          savedBook = { ...bookData, id: editingBook.id }
          setUserBooks(prev => prev.map(b => b.id === savedBook.id ? savedBook : b))
        } else {
          savedBook = { ...bookData, id: `user-${Date.now()}` }
          setUserBooks(prev => [savedBook, ...prev])
        }
        
        // Save to localStorage
        const updatedBooks = editingBook 
          ? userBooks.map(b => b.id === savedBook.id ? savedBook : b)
          : [savedBook, ...userBooks]
        localStorage.setItem('userBooks', JSON.stringify(updatedBooks))
        
        toast.success(editingBook ? "Livre mis à jour (local)" : "Livre créé (local)", {
          description: "Sera synchronisé quand la connexion sera rétablie"
        })
      }

      setIsAddOpen(false)
      setEditingBook(null)
      bookFormRef.current?.reset()
      
    } catch (error) {
      console.error('Failed to save book:', error)
      toast.error("Erreur lors de la sauvegarde", {
        description: error.message || "Réessayez plus tard"
      })
    }
  }

  // Delete book
  const handleDeleteBook = async (book) => {
    if (!book) return

    toast(`Supprimer "${book.title}" ?`, {
      description: "Cette action ne peut pas être annulée.",
      action: {
        label: "Supprimer",
        onClick: async () => {
          try {
            if (isOnline) {
              await apiRequest(`/books/${book.id}`, { method: 'DELETE' })
            }
            
            // Update local state
            const updatedBooks = userBooks.filter(b => b.id !== book.id)
            setUserBooks(updatedBooks)
            localStorage.setItem('userBooks', JSON.stringify(updatedBooks))
            
            toast.success("Livre supprimé")
            
            if (onBack) setTimeout(() => onBack(), 1000)
            
          } catch (error) {
            console.error('Failed to delete book:', error)
            toast.error("Erreur lors de la suppression")
          }
        },
      },
      cancel: { label: "Annuler", onClick: () => toast.dismiss() },
      duration: 10000,
    })
  }

  // Create shelf
  const handleAddShelfConfirm = async () => {
    const name = (newShelfName || "").trim()
    if (!name) {
      toast.error("Veuillez saisir un nom d'étagère.")
      return
    }
    
    if (shelves.some(s => s.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Une étagère portant ce nom existe déjà.")
      return
    }

    try {
      let newShelf

      if (isOnline) {
        newShelf = await apiRequest('/shelves', {
          method: 'POST',
          body: { name, description: null }
        })
      } else {
        const id = `shelf-${Date.now()}`
        newShelf = { id, name }
      }

      setShelves(prev => [...prev, newShelf])
      
      const updatedShelves = [...shelves, newShelf]
      localStorage.setItem('userShelves', JSON.stringify(updatedShelves))
      
      toast.success(`Étagère "${name}" créée`)
      setNewShelfName("")
      setIsAddShelfDialogOpen(false)
      
    } catch (error) {
      console.error('Failed to create shelf:', error)
      toast.error("Erreur lors de la création")
    }
  }

  // Rename shelf
  const handleShelfRenameConfirm = async () => {
    if (!newShelfRenameName || newShelfRenameName === dialogShelf?.name) {
      toast.error("Renommage annulé")
      setIsShelfDialogOpen(false)
      return
    }
  
    const trimmedName = newShelfRenameName.trim()
    
    if (shelves.some(s => s.id !== dialogShelf?.id && s.name.toLowerCase() === trimmedName.toLowerCase())) {
      toast.error("Une étagère portant ce nom existe déjà.")
      return
    }

    try {
      if (isOnline) {
        await apiRequest(`/shelves/${dialogShelf.id}`, {
          method: 'PUT',
          body: { name: trimmedName }
        })
      }

      // Update local state
      setShelves(prev => prev.map(shelf => 
        shelf.id === dialogShelf?.id 
          ? { ...shelf, name: trimmedName }
          : shelf
      ))
      
      const updatedShelves = shelves.map(shelf => 
        shelf.id === dialogShelf?.id ? { ...shelf, name: trimmedName } : shelf
      )
      localStorage.setItem('userShelves', JSON.stringify(updatedShelves))
  
      toast.success(`Étagère renommée en "${trimmedName}"`)
      setIsShelfDialogOpen(false)
      
    } catch (error) {
      console.error('Failed to rename shelf:', error)
      toast.error("Erreur lors du renommage")
    }
  }

  // Delete shelf
  const handleDeleteShelf = async (shelf) => {
    if (shelves.length <= 1) {
      toast.error("Impossible de supprimer la dernière étagère")
      return
    }

    const booksInShelf = shelvesMap.get(shelf.id) || []
    
    toast(`Supprimer l'étagère "${shelf.name}" ?`, {
      description: booksInShelf.length > 0 
        ? `Cette étagère contient ${booksInShelf.length} livre(s).`
        : "Cette action ne peut pas être annulée.",
      action: {
        label: "Supprimer",
        onClick: async () => {
          try {
            if (isOnline) {
              await apiRequest(`/shelves/${shelf.id}`, { method: 'DELETE' })
            }

            setShelves(prev => prev.filter(s => s.id !== shelf.id))
            
            const updatedShelves = shelves.filter(s => s.id !== shelf.id)
            localStorage.setItem('userShelves', JSON.stringify(updatedShelves))
            
            toast.success(`Étagère "${shelf.name}" supprimée`)
            
            if (selectedShelf === shelf.id) {
              setSelectedShelf(null)
            }
            
          } catch (error) {
            console.error('Failed to delete shelf:', error)
            toast.error("Erreur lors de la suppression")
          }
        },
      },
      cancel: { label: "Annuler", onClick: () => toast.dismiss() },
      duration: 10000,
    })
  }

  // Tag management functions
  const handleRenameConfirm = () => {
    if (!newName || newName === dialogTag) {
      toast.error("Renommage annulé")
      setIsDialogOpen(false)
      return
    }
  
    const normalizedName = newName.startsWith("#") ? newName : `#${newName}`
    
    const updatedBooks = userBooks.map((b) => {
      const values = b.meta?.tags || []
      if (values.includes(dialogTag)) {
        return {
          ...b,
          meta: {
            ...b.meta,
            tags: values.map((t) => (t === dialogTag ? normalizedName : t)),
          },
        }
      }
      return b
    })

    setUserBooks(updatedBooks)
    localStorage.setItem('userBooks', JSON.stringify(updatedBooks))
    
    toast.success(`Tag renommé en "${normalizedName}"`)
    setIsDialogOpen(false)
  }
  
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
          localStorage.setItem('userBooks', JSON.stringify(updatedBooks))
          toast.success(`Tag "${tag}" supprimé`)
        }
      },
      cancel: { label: "Annuler", onClick: () => toast.dismiss() },
      duration: 8000
    })
  }

  const items = [
    { id: "myBooks", title: "My Books", titledescription: "Tous vos livres", icon: BookCopy },
    { id: "shelves", title: "Shelves", titledescription: "Vos étagères", icon: Layers },
    { id: "lendBorrow", title: "Lend/Borrow", titledescription: "Emprunter/Rendre", icon: ArrowRightLeft },
    { id: "tags", title: "Tags Personnels", titledescription: "Vos tags personnels", icon: Hash },
  ]

  // Computed values
  const shelvesMap = useMemo(() => {
    const map = new Map()
    
    for (const shelf of shelves) {
      map.set(shelf.id, [])
    }
    
    for (const book of userBooks) {
      const bookShelves = book.meta?.shelves || []
      const shelfIds = Array.isArray(bookShelves) ? bookShelves : [bookShelves].filter(Boolean)
      
      for (const shelfId of shelfIds) {
        if (shelfId) {
          if (!map.has(shelfId)) {
            map.set(shelfId, [])
          }
          map.get(shelfId).push(book)
        }
      }
    }
    
    return map
  }, [userBooks, shelves])

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

  // Apply search and filter options to books list for display
  const filteredBooks = useMemo(() => filterBooks(userBooks), [userBooks, searchTerm, filterOptions])

  // Filtered books for currently selected shelf and tag views
  const filteredShelfBooks = useMemo(() => {
    if (!selectedShelf) return []
    const booksInShelf = shelvesMap.get(selectedShelf) || []
    return filterBooks(booksInShelf)
  }, [selectedShelf, shelvesMap, searchTerm, filterOptions])

  const filteredTagBooks = useMemo(() => {
    if (!selectedTag) return []
    const booksWithTag = tagsMap.get(selectedTag) || []
    return filterBooks(booksWithTag)
  }, [selectedTag, tagsMap, searchTerm, filterOptions])

  const filteredlendlist =  useMemo(() => { return filterBooks(lendList) || [] }, [lendList, searchTerm, filterOptions])
  const filteredborrowList =  useMemo(() => { return filterBooks(borrowList) || [] }, [borrowList, searchTerm, filterOptions])


  const openEditBook = (book) => {
    setEditingBook(book)
    setIsAddOpen(true)
  }

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1">
            <BookOpen className="h-4 w-4" />
            <span className="text-sm font-semibold">Titre de logo</span>
            {/* Connection status indicator */}
            <div className="ml-auto flex items-center gap-2">
              {isSyncing ? (
                <RefreshCw className="h-4 w-4 animate-spin text-blue-400" title="Synchronisation..." />
              ) : isOnline ? (
                <Wifi className="h-4 w-4 text-green-400" title="En ligne" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-400" title="Hors ligne" />
              )}
              {lastSyncTime && (
                <span className="text-xs text-muted-foreground">
                  {lastSyncTime.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-lg font-semibold text-foreground mt-2">Side Menu</SidebarGroupLabel>
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
            
            <Sheet open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) setEditingBook(null) }}>
              <SheetTrigger asChild>
                <Button
                  variant="muted"
                  className="ml-auto"
                  onClick={() => {
                    setEditingBook(null)
                    setIsAddOpen(true)
                  }}
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4" />
                  Ajouter un livre
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-primary text-white sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>{editingBook ? 'Modifier le livre' : 'Créer un livre'}</SheetTitle>
                </SheetHeader>
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
                    <Button variant="muted" onClick={() => { setIsAddOpen(false); setEditingBook(null); bookFormRef.current?.reset() }}>
                      Annuler
                    </Button>
                    <Button 
                      variant="secondary"
                      onClick={async () => {
                        if (!bookFormRef.current) return
                        const { ok } = await bookFormRef.current.submit()
                        if (ok) {
                          toast.success(editingBook ? "Livre mis à jour" : "Livre créé")
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

          {/* Migration Alert */}
          {hasLocalData && isOnline && migrationStatus === 'needed' && (
            <Alert className="mb-4 border-yellow-400 bg-yellow-400/10">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              <AlertTitle className="text-yellow-400">Migration des données disponible</AlertTitle>
              <AlertDescription className="text-light-200">
                Vos données locales peuvent être sauvegardées dans le cloud.
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400/10"
                  onClick={handleMigration}
                  disabled={isSyncing}
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Migration...
                    </>
                  ) : (
                    'Migrer maintenant'
                  )}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Migration Success */}
          {migrationStatus === 'completed' && (
            <Alert className="mb-4 border-green-400 bg-green-400/10">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertTitle className="text-green-400">Migration réussie!</AlertTitle>
              <AlertDescription className="text-light-200">
                Vos données ont été sauvegardées dans le cloud avec succès.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-dark-100 rounded-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-light-200" />
              <Input
                placeholder="Rechercher un livre par titre, auteur, ou tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-light-200 border-light-100/20"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="muted" className="bg-dark-200 border-light-100/20">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrer & Trier
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-dark-100 border-light-100/20">
                <DropdownMenuLabel>Filtrer par statut</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup 
                  value={filterOptions.status} 
                  onValueChange={(value) => setFilterOptions(prev => ({...prev, status: value}))}
                >
                  <DropdownMenuRadioItem value="all">Tous les livres</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="read">Lus</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="unread">Non lus</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="reading">En cours</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Trier par</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup 
                  value={filterOptions.sortBy} 
                  onValueChange={(value) => setFilterOptions(prev => ({...prev, sortBy: value}))}
                >
                  <DropdownMenuRadioItem value="title">Titre</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="author">Auteur</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dateAdded">Date d'ajout</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="rating">Note</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Ordre</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup 
                  value={filterOptions.sortOrder} 
                  onValueChange={(value) => setFilterOptions(prev => ({...prev, sortOrder: value}))}
                >
                  <DropdownMenuRadioItem value="asc">Croissant (A-Z)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="desc">Décroissant (Z-A)</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {(searchTerm || filterOptions.status !== "all") && (
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSearchTerm("")
                  setFilterOptions({
                    status: "all",
                    sortBy: "title",
                    sortOrder: "asc"
                  })
                }}
                className="text-light-200 hover:text-white"
              >
                Réinitialiser
                <X className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>          

          <div className='text-amber-50'>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-white animate-pulse">Chargement de votre bibliothèque...</p>
                  {!isOnline && <p className="text-xs text-light-200">Mode hors ligne</p>}
                </div>
              </div>
            ) : (
              <>
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
                    ) : filteredBooks.length === 0 ? (
                      <header className="text-center max-w-md mx-auto space-y-3">
                        <img src="/src/assets/no-mybooks-no.png" className='max-w-xs mx-auto' alt="Book Banner" />
                        <h4 className="text-white font-semibold">Aucun livre ne correspond aux filtres</h4>
                        <p className="text-light-200 text-sm">Modifiez la recherche ou réinitialisez les filtres.</p>
                      </header>
                    ) : (
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                        {filteredBooks.map((book) =>(
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

                    <Breadcrumb className="mb-4">
                      <BreadcrumbList>
                        <BreadcrumbItem>
                          <BreadcrumbLink
                            className="flex items-center gap-1 text-light-200 hover:text-light-100 transition-colors cursor-pointer"
                            onClick={() => setSelectedShelf(null)}
                          >
                            <Layers className="h-4 w-4" /> Mes étagères
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="text-light-200" />
                        {selectedShelf && (
                          <BreadcrumbItem>
                            <BreadcrumbPage className="text-white font-semibold flex items-center gap-1">
                              <BookOpen className="h-4 w-4" /> {shelves.find(s => s.id === selectedShelf)?.name}
                            </BreadcrumbPage>
                          </BreadcrumbItem>
                        )}
                      </BreadcrumbList>
                    </Breadcrumb>

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
                      <div>
                        {(shelvesMap.get(selectedShelf)?.length || 0) === 0 ? (
                          <header className="text-center max-w-md mx-auto space-y-3">
                            <img src="/src/assets/no-mybooks-no.png" className='max-w-xs mx-auto' alt="Book Banner" />
                            <h4 className="text-white font-semibold">Aucun livre dans cette étagère.</h4>
                            <p className="text-light-200 text-l">Ajoutez des livres en les créant et en sélectionnant cette étagère.</p>
                          </header>
                        ) : filteredShelfBooks.length === 0 ? (
                          <header className="text-center max-w-md mx-auto space-y-3">
                            <img src="/src/assets/no-mybooks-no.png" className='max-w-xs mx-auto' alt="Book Banner" />
                            <h4 className="text-white font-semibold">Aucun livre ne correspond aux filtres pour cette étagère.</h4>
                            <p className="text-light-200 text-sm">Modifiez la recherche ou réinitialisez les filtres.</p>
                          </header>
                        ) : (
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredShelfBooks.map(book => (
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
                      <LendBorrowList
                        title="Prêté à"
                        books={filteredlendlist}
                        type="lend"
                        onSelect={onBookSelect}
                      />
                      <LendBorrowList
                        title="Emprunté par"
                        books={filteredborrowList}
                        type="borrow"
                        onSelect={onBookSelect}
                      />
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
                        
                        <BreadcrumbSeparator className="text-light-200" />
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

                    {selectedTag ? (
                      <>
                        {filteredTagBooks.length ? (
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                            {filteredTagBooks.map((book) => (
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
                            {(tagsMap.get(selectedTag)?.length || 0) > 0 && (
                              <p className="text-light-200 text-sm">Aucun résultat ne correspond aux filtres actuels.</p>
                            )}
                          </header>                      
                        )}
                      </>
                    ) : (
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
                              <div className="flex items-center justify-between px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-[#D6C7FF]/30 to-[#AB8BFF]/30 text-white cursor-pointer hover:from-[#D6C7FF]/50 hover:to-[#AB8BFF]/50 transition">
                                <div onClick={() => setSelectedTag(tag)} className="flex items-center gap-2">
                                  <TagsIcon className="h-4 w-4" />
                                  <span>{tag}</span>
                                  <span className="text-xs text-gray-100 font-semibold">{books.length} livre(s)</span>
                                </div>
                                <div className="text-light-200 hover:bg-light-100/10 focus:bg-light-100/10">
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
              </>
            )}
          </div>
        </div>
        
        {/* Floating Add Shelf FAB */}
        {activeSection === "shelves" && (
          <>
            <button
              aria-label="Ajouter une étagère"
              onClick={() => setIsAddShelfDialogOpen(true)}
              className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-xl bg-gradient-to-br from-[#AB8BFF] to-[#7C5CFF] flex items-center justify-center text-white"
              disabled={isLoading}
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