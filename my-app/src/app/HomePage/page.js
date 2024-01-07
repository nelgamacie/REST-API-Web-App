"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const MainPage = () => {
    // Define state variables for search criteria, search results, expanded hero ID, public lists, and expanded list ID
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

    // Use useEffect to fetch public lists when the component mounts
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

    // Function to toggle expanded hero information
    const toggleExpandInfo = (heroId) => {
        setExpandedHeroId(expandedHeroId === heroId ? null : heroId);
    };

    // Function to handle expanding hero information
    const handleExpandInfo = (heroId) => {
        setExpandedHeroId(expandedHeroId === heroId ? null : heroId);
    };

    // Function to render expanded hero information
    // Update the renderExpandedInfo function
const renderExpandedInfo = (hero) => {
    return (
        <div style={{ ...styles.expandedInfo, color: 'black' }}>
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

    // Function to fetch public lists
    const fetchPublicLists = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/publicLists');

            // Check if the response is successful
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Parse the response data
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

    // Function to toggle expanded list information
    const toggleExpandListInfo = (listId) => {
        setExpandedListId(expandedListId === listId ? null : listId);
    };

    // Function to render list details
    const renderListDetails = (list) => {
        // Placeholder for list details rendering
        const heroCount = list.heroes ? list.heroes.length : 0;

  return (
    <div style={styles.listItem}>
      <p>Description: {list.description}</p>
      <p>Created by: {list.owner}</p>
      <p>Number of Heroes: {heroCount}</p>
      {/* Iterate through the heroes to display their ratings */}
      {list.heroes && list.heroes.map((hero, index) => (
        <p key={index}>
          {hero.name}: Rating - {hero.rating || "NA"}
        </p>
      ))}
    </div>
  );
};
    // JSX for the main component
    return (
        <div>
            {/* Navigation Bar */}
            <nav style={styles.navbar}>
                <h1 style={styles.title}>Hero Hub</h1>
                <div>
                    <button style={styles.button} onClick={() => navigateTo('/Login')}>Login</button>
                    <button style={styles.button} onClick={() => navigateTo('/Register')}>Sign Up</button>
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
            <div key={index} style={styles.resultItem}>
    <p style={styles.resultItemText}>Name: {hero.name}</p>
    <p style={styles.resultItemText}>Publisher: {hero.Publisher}</p>
    <button style={styles.button} onClick={() => toggleExpandInfo(hero.id)}>
        {expandedHeroId === hero.id ? 'Hide Info' : 'Expand Info'}
    </button>
    <button style={styles.button} onClick={() => searchOnDuckDuckGo(hero.name)}>Search on DDG</button>
    {expandedHeroId === hero.id && renderExpandedInfo(hero)}
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
<div style={{ ...styles.publicListsSection, color: 'black' }}>
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

const styles = {
     // Style for expanded hero information
     expandedInfo: {
        marginTop: '15px',
        backgroundColor: '#c0c0c0', // Darker shade of gray
        borderRadius: '8px',
        padding: '10px',
        textAlign: 'left',
        color: 'black', // Explicitly set text color to black
    },

    // Style for the public lists section
    publicListsSection: {
        padding: '20px',
        width: '100%',
        maxWidth: '600px',
        backgroundColor: '#c0c0c0', // Darker shade of gray
        color: 'black', // Explicitly set text color to black
    },

    // Style for the navigation bar
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
    // Style for the search section
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
        color: '#000000', // Added this style for black text color
    },
    // Style for each result item
    resultItem: {
        backgroundColor: '#f0f0f0',
        color: 'black', // Set the text color to black
        borderRadius: '8px',
        padding: '15px',
        margin: '10px 0',
        width: '80%',
        maxWidth: '500px',
        boxShadow: '0 2px 4px rgba(0,0,0,1)',
    },
    
  
    // Style for specific elements within each result item
resultItemText: {
    color: 'black', // Text color for specific elements within the result item
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
    // Style for expanded hero information
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
    // Style for the powers section
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
    // Style for the public lists section
    publicListsSection: {
        padding: '20px',
        width: '100%',
        maxWidth: '600px',
    },
    // Style for each list item
    listItem: {
        backgroundColor: '#e6e6e6',
        padding: '10px',
        margin: '10px 0',
        borderRadius: '4px',
    },
};


export default MainPage;
