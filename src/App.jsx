import React from "react"
import { Button } from "./components/ui/button"

function App() {
  
  return (
    <main>
      <div className="pattern"/>
        
      <div className="wrapper">
          <header>
            <h1 className="mb-8 text-5xl leading-tight font-serif italic"><span className="text-gradient">Lire</span>, c'est <span className="text-gradient">grandir</span>... <br/></h1>          
            <img src="\src\assets\hero.png" alt="Book Banner" />
            <h1 className="mt-8">Les <span className="text-gradient">Livres</span> vous attendent. Entrez, explorez, découvrez… et <span className="text-gradient">publiez</span>!</h1>
          </header>
          <Button> Working.......? </Button>

      </div>
      <div>
      </div>
    </main>
  ) 

}


export default App