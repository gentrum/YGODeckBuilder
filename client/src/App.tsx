import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { YgoCard } from "./components/YgoCard";

interface CardData {
  id: string;
  name: string;
  type: string;
  card_images: { image_url: string }[];
}

interface DeckItem extends CardData {
  quantity: number;
}

interface SavedDeck {
  _id: string;
  name: string;
}

function App() {
  const [cards, setCards] = useState([]);
  {
    /*Deck is an array of DeckItem objects which are CardData objects
    with an added quantity to track copies and handle deckbuilding
    rules (i.e. to cap at 3 copies per card, maybe I"ll include 
    limited/semi-limited later, for now its just assuming everything 
    can be at 3)*/
  }
  const [mainDeck, setMainDeck] = useState<DeckItem[]>([]);
  const [extraDeck, setExtraDeck] = useState<DeckItem[]>([]);
  const [sideDeck, setSideDeck] = useState<DeckItem[]>([]);

  const [searchInput, setSearchInput] = useState("Blue-Eyes White Dragon");
  const [searchTerm, setSearchTerm] = useState("Blue-Eyes White Dragon");

  const [deckName, setDeckName] = useState("");
  const [loadedDeckName, setLoadedDeckName] = useState("");
  const [savedDecks, setSavedDecks] = useState<SavedDeck[]>([]);

  const [activeTab, setActiveTab] = useState<"main" | "extra" | "side">("main");

  const fetchCards = useCallback(async (nameToSearch: string) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/cards/search?name=${nameToSearch}`,
      );
      setCards(response.data);
    } catch (error) {
      console.error("Error searching cards", error);
    }
  }, []);


  useEffect(() => {
    const loadCards = async () => {
      try{
        await fetchCards(searchTerm);
      }catch(error){
        console.error("Error loading cards.", error);
      }
    };
    loadCards();
  }, [fetchCards, searchTerm]);

  useEffect(() => {
    const loadSavedDecks = async () => {
      try{
        const response = await axios.get("http://localhost:5000/api/decks");
        setSavedDecks(response.data);
      }catch(error){
        console.error("Error fetching saved Decks", error);
      }
    };
    loadSavedDecks();
  }, []);

  const handleSearchClick = () => {
    setSearchTerm(searchInput);
  };

  //helpers for card counts
  const totalMain = mainDeck.reduce((sum, item) => sum + item.quantity, 0);
  const totalExtra = extraDeck.reduce((sum, item) => sum + item.quantity, 0);
  const totalSide = sideDeck.reduce((sum, item) => sum + item.quantity, 0);

  //helpers for adding cards to certain decks
  const addToMain = (card: CardData) => {
    //spread operator to create new array with existing cards + new card
    setMainDeck((prevDeck) => {
      const existingCardIndex = prevDeck.findIndex(
        (item) => item.id === card.id,
      );
      if (existingCardIndex !== -1 ) {
        //increment copy count
        const newDeck = [...prevDeck];
        newDeck[existingCardIndex] = {
        ...newDeck[existingCardIndex],
        quantity: newDeck[existingCardIndex].quantity + 1,
        };
        return newDeck;
      } else {
        //card not in deck, add it with quantity 1
        return [...prevDeck, { ...card, quantity: 1 }];
      }
    });
  };
  const addToExtra = (card: CardData) => {
    //spread operator to create new array with existing cards + new card
    setExtraDeck((prevDeck) => {
      const existingCardIndex = prevDeck.findIndex(
        (item) => item.id === card.id,
      );
      if (existingCardIndex !== -1 ) {
        //increment copy count
        const newDeck = [...prevDeck];
        newDeck[existingCardIndex] = {
        ...newDeck[existingCardIndex],
        quantity: newDeck[existingCardIndex].quantity + 1,
        };
        return newDeck;
      } else {
        //card not in deck, add it with quantity 1
        return [...prevDeck, { ...card, quantity: 1 }];
      }
    });
  };
  const addToSide = (card: CardData) => {
    //spread operator to create new array with existing cards + new card
    setSideDeck((prevDeck) => {
      const existingCardIndex = prevDeck.findIndex(
        (item) => item.id === card.id,
      );
      if (existingCardIndex !== -1 ) {
        //increment copy count
        const newDeck = [...prevDeck];
        newDeck[existingCardIndex] = {
        ...newDeck[existingCardIndex],
        quantity: newDeck[existingCardIndex].quantity + 1,
        };
        return newDeck;
      } else {
        //card not in deck, add it with quantity 1
        return [...prevDeck, { ...card, quantity: 1 }];
      }
    });
  };

  //check if there are already 3 copies of this card across the entire deck (main + extra + side)
  const checkTotalCopies = (card: CardData) => {
    const mainCount = mainDeck.find(c => c.id === card.id)?.quantity || 0;
    const extraCount = extraDeck.find(c => c.id === card.id)?.quantity || 0;
    const sideCount = sideDeck.find(c => c.id === card.id)?.quantity || 0;
    const totalCopies = mainCount + extraCount + sideCount;
    if (totalCopies >= 3) {
      alert("You can only have 3 copies of a card.");
      return false;
    }
    return true;
  };

  const addToDeck = (card: CardData, target: 'main' | 'extra' | 'side') => {
    //check if adding the card would exceed the 3 copy limit across the entire deck
    if (!checkTotalCopies(card)) {
      alert("You can only have 3 copies of a card across your entire deck (Main + Extra + Side).");
      return;
    }

    //check deck sizes
    if (totalMain >= 60 && target === 'main') {
      alert("60 cards allowed in Main Deck.");
      return;
    }
    if (totalExtra >= 15 && target === 'extra') {
      alert("15 cards allowed in Extra Deck.");
      return;
    }
    if (totalSide >= 15 && target === 'side') {
      alert("15 cards allowed in Side Deck.");
      return;
    }
   if(target === 'main'){
    addToMain(card);
   } else if(target === 'extra'){
    addToExtra(card);
   } else if(target === 'side'){
    addToSide(card);
   }
  };

  //helpers for removing a card from a certain deck
  const removeFromMain = (id: string) => {
    setMainDeck((prevDeck) => {
      const existingCardIndex = prevDeck.findIndex((item) => item.id === id);
      if (existingCardIndex === -1) {
        alert("Card not found in deck.");
        return prevDeck;
      } else {
        const newDeck = [...prevDeck];
        if (newDeck[existingCardIndex].quantity > 1) {
          //2 or 3 copies, just decrement quantity
          newDeck[existingCardIndex] = {
            ...newDeck[existingCardIndex],
            quantity: newDeck[existingCardIndex].quantity - 1,
          };
        } else {
          //only 1 copy, remove the card entirely
          newDeck.splice(existingCardIndex, 1);
        }
        return newDeck;
      }
    });
  }
  const removeFromExtra = (id: string) => {
    setExtraDeck((prevDeck) => {
      const existingCardIndex = prevDeck.findIndex((item) => item.id === id);
      if (existingCardIndex === -1) {
        alert("Card not found in deck.");
        return prevDeck;
      } else {
        const newDeck = [...prevDeck];
        if (newDeck[existingCardIndex].quantity > 1) {
          //2 or 3 copies, just decrement quantity
          newDeck[existingCardIndex] = {
            ...newDeck[existingCardIndex],
            quantity: newDeck[existingCardIndex].quantity - 1,
          };
        } else {
          //only 1 copy, remove the card entirely
          newDeck.splice(existingCardIndex, 1);
        }
        return newDeck;
      }
    });
  };
  const removeFromSide = (id: string) => {
    setSideDeck((prevDeck) => {
      const existingCardIndex = prevDeck.findIndex((item) => item.id === id);
      if (existingCardIndex === -1) {
        alert("Card not found in deck.");
        return prevDeck;
      } else {
        const newDeck = [...prevDeck];
        if (newDeck[existingCardIndex].quantity > 1) {
          //2 or 3 copies, just decrement quantity
          newDeck[existingCardIndex] = {
            ...newDeck[existingCardIndex],
            quantity: newDeck[existingCardIndex].quantity - 1,
          };
        } else {
          //only 1 copy, remove the card entirely
          newDeck.splice(existingCardIndex, 1);
        }
        return newDeck;
      }
    });
  };
  
  const removeFromDeck = (id: string, target: 'main' | 'extra' | 'side') => {
    if(target === 'main'){
      removeFromMain(id);
    } else if(target === 'extra'){
      removeFromExtra(id);
    } else if(target === 'side'){
      removeFromSide(id);
    }
  };

  const saveDeck = async () => {
    const trimmedName = deckName.trim();
    if(!trimmedName){
      alert("Please enter a deck name.");
      return;
    }

    const matchingDeck = savedDecks.find(
      (deck) => deck.name.toLowerCase() === trimmedName.toLowerCase()
    );

    const isSameAsLoaded = loadedDeckName?.toLowerCase() === trimmedName.toLowerCase();

    if(matchingDeck && !isSameAsLoaded){
      alert("A deck with this name already exists. Please choose a different name or load the existing deck to overwrite it.");
      return;
    }

    const deckData = {
      name: deckName,
      mainDeck: mainDeck.map((item) => ({cardId: item.id, quantity: item.quantity})),
      extraDeck: extraDeck.map((item) => ({cardId: item.id, quantity: item.quantity})),
      sideDeck: sideDeck.map((item) => ({cardId: item.id, quantity: item.quantity}))
    };
    
    try {
      await axios.post("http://localhost:5000/api/decks", deckData);
      alert("Deck saved successfully.");
      loadSavedDecks();
    } catch (error) {
      alert("Error saving deck. Please try again.");
      console.error("Error saving deck:", error);
    }
  }

  const loadSavedDecks = async () => {
    const response = await axios.get("http://localhost:5000/api/decks");
    setSavedDecks(response.data);
  }

  const handleLoadDeck = async (selectedName: string) => {
    if(!selectedName || selectedName.startsWith("--")){
      return;
    }
    try {
      const response = await axios.get(`http://localhost:5000/api/decks/${selectedName}`);
      setDeckName(response.data.name);
      setMainDeck(response.data.mainDeck);
      setExtraDeck(response.data.extraDeck);
      setSideDeck(response.data.sideDeck);
      setLoadedDeckName(response.data.name);
      console.log("Deck loaded:", response.data);
    }catch(error){
      console.error("Error loading deck:", error);
      alert("Failed loading deck. Please check server status and try again.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        boxSizing: "border-box"
    }}>
      {/*Left side: search bar and results*/}
      <div style={{
        width: "75%",
        display: "flex",
        flexDirection: "column",
        padding: "20px",
        borderRight: "1px solid #ddd",
        boxSizing: "border-box",
      }}>
        <h1>Deck Builder</h1>

        {/* Search bar */}
        <div style={{
          display: "flex",
          width: "100%",
          gap: "10px",
          marginBottom: "20px"
        }}>
          <input 
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchClick()}
            placeholder="Search for a card"
            style={{
              flex: 1,
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "4px"}}
          />
          <button onClick={handleSearchClick} style={{
            padding: "0 25px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}>
            Search
          </button>
        </div>

        {/* Search results */}
        <div style={{flex: 1, overflowY:"auto"}}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: "20px"
          }}>
            {cards.map((card:CardData) => (
              <div key={card.id} style={{
                border: "1px solid #eee",
                padding: "10px",
                borderRadius: "4px",
                textAlign: "center"
              }}>
                <YgoCard card={card} />
                <button onClick={() => addToDeck(card, activeTab)} style={{
                  marginTop: "10px", 
                  width: "100%", 
                  padding: "5px", 
                  cursor: "pointer"
                }}>
                  Add to {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side: deck sidebar */}
      <div style={{
        width: "25%",
        backgroundColor: "#f9f9f9",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box"
      }}>
        {/* Save Deck section */}
        <input 
          value={deckName}
          onChange={(e) => setDeckName(e.target.value)}
          placeholder="Deck Name"
          style={{width: '100%', marginBottom: '10px', padding: '5px'}}
        />
        <button onClick={saveDeck} style={{
          width: "100%",
          backgroundColor: "#28a745",
          color: "#fff",
          border: "none",
          padding: "10px",
          cursor: "pointer",
        }}>
          Save Deck
        </button> 
        {/* Load deck section */}
        <div style={{ marginBottom:'10px'}}>
          <select 
            onChange ={(e) => handleLoadDeck(e.target.value)} style={{width:'100%'}}>
              <option value="">Load Saved Deck</option>
              {savedDecks.map((deck) => (
                <option key={deck._id} value={deck.name}>
                  {deck.name}
                </option>
              ))}
            </select>
        </div>
        <h2 style={{margin: "0 0 10px 0"}}>
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Deck
          {activeTab === "main" ? totalMain : activeTab === "extra" ? totalExtra : totalSide}/
          {activeTab === "main" ? 60 : activeTab === "extra" ? 15 : 15}
        </h2>
        <div style={{display: "flex", gap: "5px", marginBottom: "10px"}}>
          {['main', 'extra', 'side'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as "main" | "extra" | "side")}
              style={{
                flex: 1,
                padding: "5px",
                backgroundColor: activeTab === tab ? "#007bff" : "#ddd",
                color: activeTab === tab ? "#fff" : "#000",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "12px",
                cursor: "pointer"
              }}>
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
        {/* deck list */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "8px"
        }}>
          {(activeTab === 'main' ? mainDeck : activeTab === 'extra' ? extraDeck : sideDeck).map((card) => (
            <div key={card.id} style={{
              display: "flex",
              alignItems: "center",
              background: "white",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              gap: "8px"
            }}>
              <img src={card.card_images[0].image_url} alt={card.name} style={{width:"30px"}}/>
              <span style={{fontSize:"11px", flex:1, fontWeight:"bold"}}>{card.name}</span>
              <div style={{display: "flex", gap: "4px", alignItems: "center"}}>
                <button onClick={() => removeFromDeck(card.id, activeTab)} style={{padding: "0 4px"}}>-</button>
                <span style={{fontSize:"12px"}}>x{card.quantity}</span>
                <button onClick={() => addToDeck(card, activeTab)} style={{padding: "0 4px"}}>+</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;