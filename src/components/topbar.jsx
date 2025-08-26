"use client"
import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bookmark, Menu, Compass, Library, LibraryBig } from "lucide-react"

export default function Topbar({ mobileMenuOpen, setMobileMenuOpen, currentView, setCurrentView }) {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false)
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const menuItems = [
    { id: "home", label: "Accueil", icon: Compass },
    { id: "library", label: "Bibliothèque", icon: LibraryBig },
    { id: "bookmarks", label: "Wishlist", icon: Bookmark },
  ]

  return (
    <>
      <div 
        className={`bg-dark-100 border-b border-light-100/10 sticky top-0 z-50 transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">TITRE DE LOGO </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant={currentView === item.id ? "secondary" : "ghost"}
                    className={`flex items-center px-3 py-2 text-white transition-all duration-200 hover:bg-light-100/20 hover:scale-105 hover:shadow-md ${
                      currentView === item.id ? "bg-light-100/20" : ""
                    }`}
                    onClick={() => setCurrentView(item.id)}
                  >
                    <Icon className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                    {item.label}
                  </Button>
                )
              })}
            </nav>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white transition-all duration-200 hover:bg-light-100/20 hover:scale-105"
            >
              <Menu className="h-5 w-5 transition-transform duration-200 hover:rotate-90" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-light-100/10 bg-dark-100">
            <nav className="px-4 py-2 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className={`w-full justify-start text-white transition-all duration-200 hover:bg-light-100/20 hover:translate-x-2 ${
                      currentView === item.id ? "bg-light-100/20" : ""
                    }`}
                    onClick={() => {
                      setCurrentView(item.id)
                      setMobileMenuOpen(false)
                    }}
                  >
                    <Icon className="mr-3 h-4 w-4 transition-transform duration-200 hover:scale-110" />
                    {item.label}
                  </Button>
                )
              })}
            </nav>
          </div>
        )}
      </div>
    </>
  )
}
