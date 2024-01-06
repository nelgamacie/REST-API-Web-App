"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const url = "http://localhost:5001";

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
    const [heroNames, setHeroNames] = useState({});
    const [expandedHeroDetails, setExpandedHeroDetails] = useState(null);

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
            const response = await fetch(`${url}/api/search?name=${searchCriteria.name}&race=${searchCriteria.race}&publisher=${searchCriteria.publisher}&power=${searchCriteria.power}`);
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

    // Fetch public lists information
    const fetchPublicLists = async () => {
        try {
            const response = await fetch(`${url}/api/publicListsInfo`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setPublicLists(data);
        } catch (error) {
            console.error('Error fetching public lists:', error);
        }
    };

    const toggleExpandListInfo = (listId) => {
        setExpandedListId(expandedListId === listId ? null : listId);
    };

    // New function to fetch hero names for a list
    const fetchHeroNames = async (listName) => {
        try {
            const response = await fetch(`${url}/api/heroNames/${listName}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setHeroNames(prevHeroNames => ({ ...prevHeroNames, [listName]: data.heroNames }));
        } catch (error) {
            console.error('Error fetching hero names:', error);
        }
    };
    const fetchHeroDetails = async (heroId) => {
        try {
            const response = await fetch(`${url}/api/superhero_info/${encodeURIComponent(heroId)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const heroDetails = await response.json();
            setExpandedHeroDetails(heroDetails);
        } catch (error) {
            console.error('Error fetching hero details:', error.message);
        }
    };
    
    
    const [showHeroNames, setShowHeroNames] = useState(false);


// Modify renderListDetails to include a button for expanding hero names
const renderListDetails = (list) => {
  const heroNamesList = heroNames[list.listName]; // Get the hero names for the list
  const isShowingHeroNames = heroNamesList && heroNamesList.length > 0;

  return (
      <div style={styles.listItem}>
          <p>Description: {list.description}</p>
          <p>Created by: {list.owner}</p>
          <button
              style={styles.button}
              onClick={() => {
                  if (isShowingHeroNames) {
                      setHeroNames({ ...heroNames, [list.listName]: [] }); // Clear the hero names
                  } else {
                      fetchHeroNames(list.listName); // Fetch hero names if not already fetched
                  }
              }}
          >
              {isShowingHeroNames ? 'Hide Heroes' : 'Show Heroes'}
          </button>
          {isShowingHeroNames && (
              <div style={styles.heroNamesSection}>
                  <ul>
                      {heroNamesList.map((name, id) => (
                          <li key={id} onClick={() => fetchHeroDetails(name)}>
                              {name}
                          </li>
                      ))}
                  </ul>
              </div>
          )}

          {/* Render the selected hero's details */}
          {expandedHeroDetails && (
              <div style={styles.expandedHeroDetails}>
                  <h3>{expandedHeroDetails.name}</h3>
                  <p>Gender: {expandedHeroDetails.Gender}</p>
                  <p>Eye color: {expandedHeroDetails['Eye color']}</p>
                  <p>Race: {expandedHeroDetails.Race}</p>
                  <p>Hair color: {expandedHeroDetails['Hair color']}</p>
                  {/* Add more hero information fields as needed */}
              </div>
          )}
      </div>
  );
};


// ... (other code)


    return (
        <div>
            {/* Navigation Bar */}
            <nav className="bg-grey dark:bg-zinc-800 shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                {/* Logo or Brand Name here */}
                            </div>
                            <a
                                href=""
                                className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800 hover:dark:bg-opacity-30"
                                rel="noopener noreferrer"
                            >
                                <h2 className={`mb-3 text-2xl font-semibold`}>
                                    HeroFinder{' '}
                                </h2>
                            </a>
                            <a
                                href="/Login"
                                className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800 hover:dark:bg-opacity-30"
                                rel="noopener noreferrer"
                            >
                                <h2 className={`mb-3 text-2xl font-semibold`}>
                                    Login{' '}
                                    <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                                        -&gt;
                                    </span>
                                </h2>
                            </a>
                            <a
                                href="/Register"
                                className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800 hover:dark:bg-opacity-30"
                                rel="noopener noreferrer"
                            >
                                <h2 className={`mb-3 text-2xl font-semibold`}>
                                    Sign Up{' '}
                                    <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                                        -&gt;
                                    </span>
                                </h2>
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* About Section */}
            <div style={styles.aboutSection}>
                <h2>About HeroFinder</h2>
                <p>HeroFinder is your ultimate destination for all things superhero-related. It's a platform where passionate superhero fans can immerse themselves in a vast archive of superhero information, curate personalized hero lists, and rate their beloved heroes. With Hero Finder, you can easily search for superheroes from various universes and connect with like-minded enthusiasts. Join us today and become a valued member of this thrilling superhero community! </p>
            </div>
<style>{
  `h2 {
    color: white; /* Bright blue color */
    font-weight: bold; /* Bolded text */
    font-size: 24px; /* Larger font size */
  }
` }

</style>
            
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
                {publicLists.map((list, index) => (
                    <div key={index} style={styles.listItem}>
                        <h3>{list.listName}</h3>
                        <button style={styles.button} onClick={() => toggleExpandListInfo(list.listName)}>
                            {expandedListId === list.listName ? 'Hide Details' : 'Show Details'}
                        </button>
                        {expandedListId === list.listName && renderListDetails(list)}
                    </div>
                ))}
            </div>

            {/* Render expanded hero details */}
            {expandedHeroDetails && (
                <div style={styles.expandedHeroDetails}>
                    <h3>{expandedHeroDetails.name}</h3>
                    <h3>{expandedHeroDetails.race}</h3>
                    <h3>{expandedHeroDetails.publisher}</h3>
                    <h3>{expandedHeroDetails.power}</h3>

                    {/* Display other hero details here */}
                </div>
            )}
        </div>
    );
};
// Updated Styles
const styles = {

  heroNamesSection: {
    color: 'black', // Change text color to black
    width: '100%', // Take up the full width of the container
    boxSizing: 'border-box', // Include padding in the width calculation
    overflowX: 'auto', // Enable horizontal scrolling
    whiteSpace: 'nowrap', // Prevent wrapping of names
    maxWidth: '100%', // Set a maximum width
  },

  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgb(116, 175, 253)',
    color: 'white',
    padding: '1em',
    marginBottom: '20px',
  },
  title: {
    margin: 0,
    fontSize: '60px',
  },
  button: {
    margin: '0 10px',
    padding: '15px 20px',
    backgroundColor: 'rgb(239, 47, 47)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '18px',
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
    width: '300px',
    fontSize: '16px',
    color: 'black',
  },
  searchButton: {
    padding: '15px 20px',
    backgroundColor: 'rgb(239, 47, 47)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '18px',
  },
  resultsSection: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  resultItem: {
    backgroundColor: '#f0f0f0',
    borderRadius: '8px',
    padding: '15px',
    margin: '10px 0',
    width: '100%', // Take up the full width of the container
    maxWidth: '500px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    color: 'black', // Change text color to black
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
    backgroundColor: 'rgb(116, 175, 253)',
    color: 'black', // Change text color to black
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
    width: '100%', // Take up the full width of the container
    boxSizing: 'border-box', // Include padding in the width calculation
  },
  // Use a different color for the Save List button
  saveListButton: {
    backgroundColor: 'rgb(47, 121, 239)',
    color: 'white',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '18px',
  },
};

export default MainPage;
