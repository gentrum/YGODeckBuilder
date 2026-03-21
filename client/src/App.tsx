import {useState, useEffect, useCallback} from 'react'
import axios from 'axios'
import {YgoCard} from './components/YgoCard'

interface CardData {
  id: string;
  name: string;
  type: string;
  card_images: {image_url: string}[];
}

function App() {
  const [cards, setCards] = useState([]);
  const [searchTerm, setSearchTerm] = useState('Blue-Eyes White Dragon');
  
  const fetchCards = useCallback(async (nameToSearch: string) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/cards/search?name=${nameToSearch}`);
      setCards(response.data);
    } catch (error) {
      console.error('Error searching cards', error);
    }
  }, []);

  useEffect(() => {
    fetchCards(searchTerm);
  }, [fetchCards, searchTerm]);

  const handleSearchClick = () => {
    setSearchTerm(searchTerm);
  };

  const [deck, setDeck] = useState<CardData[]>([]);

  //adding a card to the deck
  const addToDeck = (card: CardData) => {
    if (deck.length >= 60){
      alert('60 cards allowed in Main Deck.');
      return;
    }
    //spread operator to create new array with existing cards + new card
    setDeck([...deck, card]);
  };

  const removeFromDeck = (index: number) => {
    const newDeck = [...deck];
    newDeck.splice(index, 1);
    setDeck(newDeck);
  };

  return (
    <div style={{
        flex: 3, 
        padding: '20px', 
        overflowY: 'auto', 
        borderRight: '1px solid #ccc'
      }}>
      {/*Left side: search bar and results*/}
      <h1>Deck Builder</h1>
      
      {/*Search bar container*/}
      <div style={{
        display: 'flex', 
        marginBottom: '10px',
        gap: '10px'
      }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
          placeholder='Search for a card'
          style={{
            padding:'10px', 
            flex: 1,
            border: '1px solid #ddd',
            borderRadius:'4px'
          }}/>
        <button onClick={handleSearchClick} style={{
          padding: '10px 20px',
          cursor: 'pointer',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '4px'
        }}>
          Search
        </button>
      </div>
      {/*Grid for Search results*/}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '10px'
      }}>
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => addToDeck(card)}
            style={{
              cursor:'pointer',
              border:'1px solid #eee', 
              borderRadius:'8px', 
              padding:'10x',
              textAlign:'center'}}
          >
            <YgoCard card={card} />
            <button style={{
              marginTop: '10px',
              width: '100%',
              cursor: 'pointer',
            }}>
              Add to Deck
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
