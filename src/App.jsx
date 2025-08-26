import React, { useState } from "react"
import Topbar from "./components/topbar"
import LibraryView from "./components/library-view"
import BookmarksView from "./components/bookmarks-view"
import HomeView from "./components/home-view"
import BookDetailView from "./components/book-detail-view"
import { Toaster } from "sonner"

function App() {
  const [currentView, setCurrentView] = useState("home")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedBookId, setSelectedBookId] = useState(null)
  
  const renderCurrentView = () => {
    if (selectedBookId) {
      return <BookDetailView bookId={selectedBookId} onBack={() => setSelectedBookId(null)} />
    }
    
    switch (currentView) {
      case "home":
        return <HomeView/>
      case "library":
        return (
          <LibraryView
            onBookSelect={setSelectedBookId}
          />
        )
      case "bookmarks":
        return (
          <BookmarksView
          />
        )
      default:
        return <HomeView />
    }
  }
  return (
    <div className="min-h-screen bg-primary">
        <Topbar
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          currentView={currentView}
          setCurrentView={(view) => {
            // Clear selected book when navigating to different sections
            if (selectedBookId) {
              setSelectedBookId(null)
            }
            setCurrentView(view)
          }}        
          />
        <main>
          {renderCurrentView()}    
        </main>
        <Toaster 
          position="top-right"
          richColors={false}
          closeButton={true}
          duration={4000}
        />
    </div>
  ) 

}


export default App