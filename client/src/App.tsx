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

function App() {
  const [cards, setCards] = useState([]);
  {
    /*Deck is an array of DeckItem objects which are CardData objects
    with an added quantity to track copies and handle deckbuilding
    rules (i.e. to cap at 3 copies per card, maybe I"ll include 
    limited/semi-limited later, for now its just assuming everything 
    can be at 3)*/
  }
  const [deck, setDeck] = useState<DeckItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("Blue-Eyes White Dragon");

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
    fetchCards(searchTerm);
  }, [fetchCards, searchTerm]);

  const handleSearchClick = () => {
    setSearchTerm(searchTerm);
  };

  //adding a card to the deck
  const totalCards = deck.reduce((sum, item) => sum + item.quantity, 0);
  const addToDeck = (card: CardData) => {
    if (totalCards >= 60) {
      alert("60 cards allowed in Main Deck.");
      return;
    }
    //spread operator to create new array with existing cards + new card
    setDeck((prevDeck) => {
      const existingCardIndex = prevDeck.findIndex(
        (item) => item.id === card.id,
      );
      if (existingCardIndex !== -1) {
        //card already exists in deck, check quantity
        if (prevDeck[existingCardIndex].quantity >= 3) {
          alert("You can only have 3 copies of a card in your deck.");
          return prevDeck;
        } else {
          //increment copy count
          const newDeck = [...prevDeck];
          newDeck[existingCardIndex] = {
            ...newDeck[existingCardIndex],
            quantity: newDeck[existingCardIndex].quantity + 1,
          };
          return newDeck;
        }
      } else {
        //card not in deck, add it with quantity 1
        return [...prevDeck, { ...card, quantity: 1 }];
      }
    });
  };

  const removeFromDeck = (id: string) => {
    setDeck((prevDeck) => {
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
                <button onClick={() => addToDeck(card)} style={{
                  marginTop: "10px", 
                  width: "100%", 
                  padding: "5px", 
                  cursor: "pointer"
                }}>
                  Add to Deck
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
        <h2 style={{margin: "0 0 10px 0"}}>
          Your Deck ({deck.reduce((s, i) => s + i.quantity, 0)}/60)
        </h2>
        {/* deck list */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "8px"
        }}>
          {deck.map((card) => (
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
                <button onClick={() => removeFromDeck(card.id)} style={{padding: "0 4px"}}>-</button>
                <span style={{fontSize:"12px"}}>x{card.quantity}</span>
                <button onClick={() => addToDeck(card)} style={{padding: "0 4px"}}>+</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
