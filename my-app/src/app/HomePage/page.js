"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const MainPage = () => {
    const [searchCriteria, setSearchCriteria] = useState({
        name: '',
        race: '',
        publisher: '',
        power: ''
    });
    const [searchResults, setSearchResults] = useState([]);
    const [expandedHeroId, setExpandedHeroId] = useState(null);
    const router = useRouter();
    const [publicLists, setPublicLists] = useState([]);
    const [expandedListId, setExpandedListId] = useState(null);

    useEffect(() => {
        fetchPublicLists();
    }, []);


    // Function to handle navigation
    const navigateTo = (path) => {
        router.push(path);
    };

    // Function to handle input changes
    const handleInputChange = (e) => {
        setSearchCriteria({ ...searchCriteria, [e.target.name]: e.target.value });
    };

    // Function to handle search
    const handleSearch = async () => {
        try {
            const response = await fetch(`http://localhost:5001/api/search?name=${searchCriteria.name}&race=${searchCriteria.race}&publisher=${searchCriteria.publisher}&power=${searchCriteria.power}`);
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
    };

    // Function to toggle expanded info
    const toggleExpandInfo = (heroId) => {
        setExpandedHeroId(expandedHeroId === heroId ? null : heroId);
    };

    // Function to handle expand info
    const handleExpandInfo = (heroId) => {
        setExpandedHeroId(expandedHeroId === heroId ? null : heroId);
    };

    // Function to render expanded hero information
    const renderExpandedInfo = (hero) => {
      return (
          <div style={styles.expandedInfo}>
              {/* General Hero Information */}
              {Object.entries(hero).map(([key, value]) => {
                  if (key !== 'id' && key !== 'hero_names' && value !== 'True' && value !== 'False') {
                      return <p style={styles.detail} key={key}>{`${key}: ${value}`}</p>;
                  }
              })}
              {/* Display only powers set to true */}
              <div style={styles.powersSection}>
                  <p style={styles.powersTitle}>Powers:</p>
                  {Object.entries(hero).map(([key, value]) => {
                      if (value === 'True') {
                          return <p style={styles.power} key={key}>{key}</p>;
                      }
                  })}
              </div>
          </div>
      );
  };

    // Function to open a search on DuckDuckGo
    const searchOnDuckDuckGo = (heroName) => {
        const url = `https://duckduckgo.com/?q=${encodeURIComponent(heroName)}`;
        window.open(url, '_blank');
    };

    const fetchPublicLists = async () => {
        try {
            // Fetching public lists from the server
            const response = await fetch('http://localhost:5001/api/publicLists');
   
            // Check if the response is successful
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
   
            // Parsing the response data
            const data = await response.json();
   
            // Check if the data is an array (as expected)
            if (!Array.isArray(data)) {
                throw new Error('Received data is not an array');
            }
   
            // Update state with the fetched public lists
            setPublicLists(data);
        } catch (error) {
            // Log any errors to the console
            console.error('Error fetching public lists:', error);
        }
    };
    const toggleExpandListInfo = (listId) => {
        setExpandedListId(expandedListId === listId ? null : listId);
    };

    const renderListDetails = (list) => {
        // Placeholder for list details rendering
        return (
            <div>
                <p>Description: {list.description}</p>
                <p>Created by: {list.owner}</p>
                {/* Additional details can be rendered here */}
            </div>
        );
    };

    return (
        <div>
            {/* Navigation Bar */}
            <nav style={styles.navbar}>
                <h1 style={styles.title}>Hero Hub</h1>
                <div>
                    <button style={styles.button} onClick={() => navigateTo('/login')}>Login</button>
                    <button style={styles.button} onClick={() => navigateTo('/registration')}>Sign Up</button>
                </div>
            </nav>
   
            {/* About Section */}
            <div style={styles.aboutSection}>
                <h2>About Hero Hub</h2>
                <p>Hero Hub is a place where superhero enthusiasts can explore, create lists, and rate their favorite heroes. Dive into a vast collection of superhero data, search for heroes across different universes, and personalize your own hero lists. Join us and be a part of this exciting community!</p>
            </div>
   
            {/* Search Section */}
            <div style={styles.searchSection}>
                <input type="text" name="name" placeholder="Name" value={searchCriteria.name} onChange={handleInputChange} style={styles.input} />
                <input type="text" name="race" placeholder="Race" value={searchCriteria.race} onChange={handleInputChange} style={styles.input} />
                <input type="text" name="publisher" placeholder="Publisher" value={searchCriteria.publisher} onChange={handleInputChange} style={styles.input} />
                <input type="text" name="power" placeholder="Power" value={searchCriteria.power} onChange={handleInputChange} style={styles.input} />
                <button onClick={handleSearch} style={styles.searchButton}>Search</button>
            </div>
   
            {/* Search Results Section */}
            <div style={styles.resultsSection}>
                {searchResults.map((hero, index) => (
                    <div key={index} style={styles.resultItem}>
                        <p>Name: {hero.name}</p>
                        <p>Publisher: {hero.Publisher}</p>
                        <button style={styles.button} onClick={() => toggleExpandInfo(hero.id)}>
                            {expandedHeroId === hero.id ? 'Hide Info' : 'Expand Info'}
                        </button>
                        <button style={styles.button} onClick={() => searchOnDuckDuckGo(hero.name)}>Search on DDG</button>
                        {expandedHeroId === hero.id && renderExpandedInfo(hero)}
                    </div>
                ))}
            </div>
   
            {/* Public Lists Section */}
            <div style={styles.publicListsSection}>
                <h2>Top 10 Public Lists</h2>
                {Array.isArray(publicLists) && publicLists.map((list, index) => (
                    <div key={index} style={styles.listItem}>
                        <h3>{list.listName}</h3>
                        <button style={styles.button} onClick={() => toggleExpandListInfo(list.listName)}>
                            {expandedListId === list.listName ? 'Hide Details' : 'Show Details'}
                        </button>
                        {expandedListId === list.listName && renderListDetails(list)}
                    </div>
                ))}
            </div>
        </div>
    );
};    

// Styles
const styles = {
    navbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#333',
        color: 'white',
        padding: '10px 20px',
    },
    title: {
        margin: 0,
    },
    button: {
        margin: '0 10px',
        padding: '10px 20px',
        backgroundColor: '#0070f3',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    aboutSection: {
        padding: '20px',
        textAlign: 'center',
    },
    searchSection: {
      display: 'flex',
      justifyContent: 'center',
      padding: '20px',
  },
  input: {
      margin: '0 10px',
      padding: '10px',
  },
  searchButton: {
      padding: '10px 20px',
      backgroundColor: '#0070f3',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
  },
  // Styles for the search results section
  resultsSection: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
},

// Style for each result item
resultItem: {
    backgroundColor: '#f0f0f0',
    borderRadius: '8px',
    padding: '15px',
    margin: '10px 0',
    width: '80%',
    maxWidth: '500px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
},

// Style for buttons (Expand Info and Search on DDG)
button: {
    margin: '0 10px',
    padding: '8px 16px',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
},

expandedInfo: {
  marginTop: '15px',
  backgroundColor: '#e6e6e6',
  borderRadius: '8px',
  padding: '10px',
  textAlign: 'left',
},
detail: {
  margin: '5px 0',
},
powersSection: {
  marginTop: '10px',
},
powersTitle: {
  fontWeight: 'bold',
},
power: {
  margin: '3px 0',
  fontStyle: 'italic',
},
container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#f4f4f4',
},
publicListsSection: {
    padding: '20px',
    width: '100%',
    maxWidth: '600px',
},
listItem: {
    backgroundColor: '#e6e6e6',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '4px',
},
button: {
    backgroundColor: '#0070f3',
    color: 'white',
    padding: '5px 10px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
}
};


export default MainPage;
