// Initialize an array to store saved hero lists
let savedHeroLists = [];
let currentSearchResults = []; // Global variable to store current search results


// Event listener for the 'Enter' key in the search input
document.getElementById('searchInput').addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        searchSuperheroes();
    }
});


// Event listener for when the DOM content is loaded
document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('searchButton').addEventListener('click', searchSuperheroes);
    updateDropdownMenu();
    document.getElementById('createListBtn').addEventListener('click', function () {
        document.getElementById('newListDiv').style.display = 'block';
    });
    document.getElementById('saveListBtn').addEventListener('click', function () {
        const listName = document.getElementById('listNameInput').value;
        createFavoriteList(listName);
        document.getElementById('newListDiv').style.display = 'none';
    });
    document.getElementById('viewListBtn').addEventListener('click', function () {
        const selectedListName = document.getElementById('favoriteListsDropdown').value;
        displayFavoriteList(selectedListName);
    });
    document.getElementById('sortListBtn').addEventListener('click', function () {
        const selectedListName = document.getElementById('favoriteListsDropdown').value;

        if (selectedListName) {
            // If a list is selected, fetch its details and sort it
            fetch(`/api/fullInfo/${encodeURIComponent(selectedListName)}`)
                .then(response => response.json())
                .then(heroes => {
                    const sortedHeroes = sortResults(heroes, 'favorites');
                    displayFavoriteList(selectedListName, sortedHeroes);
                })
                .catch(error => console.error('Error:', error));
        } else if (currentSearchResults && currentSearchResults.length > 0) {
            // If there are search results, sort them
            const sortedSearchResults = sortResults(currentSearchResults, 'search');
            displayResults(sortedSearchResults);
        } else {
            // No list selected and no search results available
            alert("No data to sort. Please perform a search or select a list.");
        }
    });

});

document.getElementById('deleteListBtn').addEventListener('click', function () {
    const selectedListName = document.getElementById('favoriteListsDropdown').value;
    deleteFavoriteList(selectedListName);
});


// Modified Event listener for the 'sortListBtn' button
document.getElementById('sortListBtn').addEventListener('click', function () {
    if (currentSearchResults && currentSearchResults.length > 0) {
        const sortedResults = sortResults(currentSearchResults, 'search');
        displayResults(sortedResults);
    } else {
        alert("No search results to sort.");
    }
});


// Function to search for superheroes based on user input
function searchSuperheroes() {
    // Retrieve the type of search and the search input value from the DOM
    const searchType = document.getElementById('searchType').value;
    const searchInput = document.getElementById('searchInput').value.trim();


    // Regex pattern to allow only letters, numbers, hyphens, and spaces
    const validPattern = /^[a-zA-Z0-9\- ]*$/;


    // Check if the search input matches the valid pattern
    if (!validPattern.test(searchInput)) {
        alert('Your search contains invalid characters. Only letters, numbers, hyphens, and spaces are allowed.');
        return;
    }

    // Check if the search input is empty
    if (searchInput.length === 0) {
        alert('Please enter a search term.');
        return;
    }
    // Get the number of results to limit from the corresponding input field
    const limitResults = document.getElementById('limitResults').value;


    // Construct the query string for the API call
    let query = `/api/search?${searchType}=${encodeURIComponent(searchInput)}`;
    if (limitResults) {
        query += `&limit=${encodeURIComponent(limitResults)}`;
    }


    // Fetch data from the server using the constructed query
    fetch(query)
        .then(response => {
            // Check if the server response is okay
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Store the fetched data for potential sorting
            currentSearchResults = data;
            // Sort the data based on the selected criteria and display it
            const sortedData = sortResults(data, 'search');
            displayResults(sortedData);
        })
        .catch(error => {
            // Log any errors that occur during the fetch operation
            console.error('Error:', error);
        });
}

// Function to sort a favorite list
function sortFavoriteList() {
    // Get the name of the list to be sorted
    const listName = document.getElementById('displayedList').getAttribute('data-list-name');


    // Fetch the full information of the list from the server
    fetch(`/api/fullInfo/${encodeURIComponent(listName)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(heroes => {
            // Sort the heroes based on the selected criteria and display the list
            const sortedHeroes = sortResults(heroes, 'favorites');
            displayFavoriteList(listName, sortedHeroes);
        })
        .catch(error => {
            // Log any errors and alert the user
            console.error('Error:', error);
            alert(`An error occurred while trying to sort the list "${listName}".`);
        });
}

// Function to sort and display a favorite list
function sortAndDisplayFavoriteList(listName) {
    fetch(`/api/getList/${encodeURIComponent(listName)}`)
        .then(response => response.json())
        .then(heroes => {
            const sortedHeroes = sortResults(heroes, 'list');
            displayFavoriteList(listName, sortedHeroes);
        })
        .catch(error => console.error('Error:', error));
}

// Function to sort data based on a given criterion
function sortResults(data, context) {
    // Get the selected sorting criterion from the dropdown
    const sortBy = document.getElementById('sortInput').value;
    switch (sortBy) {
        case 'name':
            // Sort by name in alphabetical order
            return data.sort((a, b) => a.name.localeCompare(b.name));
        case 'race':
            // Sort by race in alphabetical order
            return data.sort((a, b) => (a.Race || '').localeCompare(b.Race || ''));
        case 'publisher':
            // Sort by publisher in alphabetical order
            return data.sort((a, b) => (a.Publisher || '').localeCompare(b.Publisher || ''));
        case 'power':
            // Sort by the number of powers in ascending order
            return data.sort((a, b) => countPowers(a) - countPowers(b));
        default:
            // Return data without sorting if no valid sorting criterion is selected
            return data;
    }
}


// Function to count the number of powers a hero has
function countPowers(hero) {
    let count = 0;
    for (let power in hero) {
        if (hero[power] === "True") {
            // Increment the count for each power the hero has
            count++;
        }
    }
    return count;
}

// Function to display search results
function displayResults(heroes) {
    // Get the results div element
    const resultsDiv = document.getElementById('results');
    // Clear previous results
    while (resultsDiv.firstChild) {
        resultsDiv.removeChild(resultsDiv.firstChild);
    }


    if (!heroes || heroes.length === 0) {
        const noResultsText = document.createTextNode("No superheroes found!");
        resultsDiv.appendChild(noResultsText);
        return;
    }


    // Iterate through each hero and display information
    heroes.forEach(hero => {
        const heroDiv = document.createElement('div');


        // Create elements for hero information
        // Adds list of powers that are true for each hero
        const powers = [];
        for (let power in hero) {
            if (hero[power] === "True") {
                powers.push(power);
            }
        }
        // Adds name of Hero
        const heroName = document.createElement('h2');
        heroName.textContent = hero.name;
        heroDiv.appendChild(heroName);

        //Adds race of hero
        const heroRace = document.createElement('p');
        const raceText = document.createTextNode(`Race: ${hero.Race || 'N/A'}`);
        heroRace.appendChild(raceText);
        heroDiv.appendChild(heroRace);

        // Publisher of hero
        const heroPublisher = document.createElement('p');
        const publisherText = document.createTextNode(`Publisher: ${hero.Publisher || 'N/A'}`);
        heroPublisher.appendChild(publisherText);
        heroDiv.appendChild(heroPublisher);

        // adds true hero Powers to list
        const heroPowers = document.createElement('p');
        heroPowers.appendChild(document.createTextNode('Powers:'));
        heroDiv.appendChild(heroPowers);

        const ul = document.createElement('ul');
        powers.forEach(power => {
            const li = document.createElement('li');
            li.textContent = power;
            ul.appendChild(li);
        });
        heroDiv.appendChild(ul);

        // Dropdown
        const dropdown = document.createElement('select');
        dropdown.className = 'heroDropdown';
        heroDiv.appendChild(dropdown);

        // Button
        const button = document.createElement('button');
        button.textContent = 'Add to List';
        button.onclick = function () {
            addToFavorite(hero, dropdown.value);
        };
        heroDiv.appendChild(button);

        resultsDiv.appendChild(heroDiv);
    });

    updateDropdownMenu();
}


// Function to update the dropdown menu with saved hero lists
function updateDropdownMenu() {
    fetch('/api/savedHeroLists')
        .then(response => response.json())
        .then(listNames => {
            const favoriteListsDropdown = document.getElementById('favoriteListsDropdown');
            // Clear existing options by setting the length of the options collection to 0
            favoriteListsDropdown.options.length = 0;

            const heroDropdowns = document.querySelectorAll('.heroDropdown');
            // Clear existing options for each hero dropdown
            heroDropdowns.forEach(dropdown => dropdown.options.length = 0);

            listNames.forEach(name => {
                // Create a new option element for the 'favoriteListsDropdown'
                const optionForFavoriteList = document.createElement('option');
                optionForFavoriteList.value = name;
                optionForFavoriteList.textContent = name; // Safer than innerHTML
                favoriteListsDropdown.appendChild(optionForFavoriteList);

                // Create new option elements for each hero dropdown
                heroDropdowns.forEach(dropdown => {
                    const optionForHero = document.createElement('option');
                    optionForHero.value = name;
                    optionForHero.textContent = name; // Safer than innerHTML
                    dropdown.appendChild(optionForHero);
                });
            });

            // Toggle the display of the 'deleteListBtn' based on the saved lists
            const deleteListBtn = document.getElementById('deleteListBtn');
            deleteListBtn.style.display = listNames.length > 0 ? 'block' : 'none';
        })
        .catch(error => console.error('Error:', error));
}
// Call the function to populate the dropdowns when the page loads or when a new list is created
updateDropdownMenu();

let nextListId = 1; // Initialize with 1 or load from persistent storage if needed

function createFavoriteList(name) {
    const newList = { id: nextListId++, name: name, heroes: [] };
    savedHeroLists.push(newList);
    updateDropdownMenu();
}

function sanitizeString(str) {
    // Allow letters (including those with diacritics), numbers, periods, hyphens, and spaces
    return str.replace(/[^\w.\-\s\u00C0-\u024F\u1E00-\u1EFF]/gi, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
}

function addToFavorite(hero, listName) {
    const list = savedHeroLists.find(l => l.name === listName);
    if (list) {
        if (list.heroes.some(h => h.name === hero.name)) {
            // The hero is already in the list, so alert the user.
            alert(`Hero "${hero.name}" is already in the list "${listName}".`);
        } else {
            // The hero is not in the list, so add them.
            list.heroes.push(hero);

            // Send the request to the server to add the superhero to the list
            fetch('/api/savedHeroLists/addHero', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ listName, superhero: hero }),
            })
                .then(response => response.json())
                .then(data => {
                    if (data.message) {
                        alert(data.message); // Alert the message from the server
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        }
    } else {
        // The list was not found; alert the user.
        alert(`List "${listName}" not found.`);
    }
}
function displayFavoriteList(listName) {
    fetch(`/api/fullInfo/${encodeURIComponent(listName)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(heroes => {
            const resultsDiv = document.getElementById('favoriteLists');
            // Clear previous content
            while (resultsDiv.firstChild) {
                resultsDiv.removeChild(resultsDiv.firstChild);
            }
            // Add data-list-name attribute to track the displayed list
            resultsDiv.setAttribute('data-list-name', listName);

            // Sort the heroes in the list alphabetically by their names
            const sortedHeroes = heroes.sort((a, b) => a.name.localeCompare(b.name));

            sortedHeroes.forEach(hero => {
                const heroDiv = document.createElement('div');

                // Name
                const heroName = document.createElement('h2');
                heroName.textContent = hero.name;
                heroDiv.appendChild(heroName);

                // Other properties
                const properties = ['Gender', 'Eye color', 'Race', 'Hair color', 'Height', 'Publisher', 'Skin color', 'Alignment', 'Weight'];
                properties.forEach(property => {
                    const p = document.createElement('p');
                    const strong = document.createElement('strong');
                    strong.textContent = `${property}: `;
                    p.appendChild(strong);
                    p.appendChild(document.createTextNode(`${hero[property] || 'N/A'}`));
                    heroDiv.appendChild(p);
                });

                // Powers
                const powersTitle = document.createElement('p');
                powersTitle.appendChild(document.createTextNode('Powers:'));
                heroDiv.appendChild(powersTitle);

                const powersList = document.createElement('ul');
                Object.keys(hero.powers).forEach(power => {
                    const li = document.createElement('li');
                    li.textContent = power;
                    powersList.appendChild(li);
                });
                heroDiv.appendChild(powersList);

                resultsDiv.appendChild(heroDiv);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            alert(`An error occurred while trying to display the list "${listName}".`);
        });
}

const createListBtn = document.getElementById('saveListBtn');
const listNameInput = document.getElementById('listNameInput');

createListBtn.addEventListener('click', () => {
    const listName = listNameInput.value.trim();

    if (!listName) {
        alert('Please enter a list name.');
        return;
    }

    // Prepare the data to be sent in the POST request
    const data = {
        listName: listName,
        superheroIDs: [] // Assuming new lists start empty
    };

    // Send the POST request to the server
    fetch('/api/savedHeroLists', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(response => {
            if (!response.ok) {
                // This is where you would check if the issue is specifically that the list already exists.
                // For instance, if your server returns a 409 Conflict when a list already exists:
                if (response.status === 409) {
                    alert(`List "${listName}" already exists. Please choose a different name.`);
                } else {
                    throw new Error('Network response was not ok: ' + response.statusText);
                }
            } else {
                return response.json();
            }
        })
        .then(result => {
            if (result) { // Make sure result is not undefined due to throwing an error above
                console.log('Success:', result);
                alert(`List "${listName}" created successfully!`);
                // Reset the input field after successful creation
                listNameInput.value = '';
                // You may want to update the UI here, e.g., refresh the list of available lists
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert(`Error creating list: ${error.message}`);
        });
});

function deleteFavoriteList(listName) {
    // Confirm before deleting
    if (!confirm(`Are you sure you want to delete the list "${listName}"?`)) {
        return;
    }

    fetch(`/api/savedHeroLists/${encodeURIComponent(listName)}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            alert(data.message || `The list "${listName}" has been deleted.`);

            // Check if the deleted list is the one currently displayed
            const displayedListElement = document.getElementById('displayedList');
            if (displayedListElement && displayedListElement.getAttribute('data-list-name') === listName) {
                displayedListElement.innerHTML = ''; // Clear the display
                displayedListElement.removeAttribute('data-list-name'); // Remove the attribute
            }

            // Refresh the dropdown to reflect the list deletion
            updateDropdownMenu();
        })
        .catch(error => {
            console.error('Error:', error);
            alert(`An error occurred while trying to delete the list "${listName}".`);
        });
}
