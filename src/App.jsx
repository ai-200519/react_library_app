import React, { useState } from "react"
import Topbar from "./components/topbar"
import LibraryView from "./components/library-view"
import BookmarksView from "./components/bookmarks-view"
import HomeView from "./components/home-view"

function App() {
  const [currentView, setCurrentView] = useState("home")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const renderCurrentView = () => {
    switch (currentView) {
      case "home":
        return <HomeView/>
      case "library":
        return (
          <LibraryView
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
          setCurrentView={setCurrentView}
        />
        <main>
          {renderCurrentView()}    
        </main>
    </div>
  ) 

}


export default App