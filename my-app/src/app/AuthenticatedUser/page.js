"use client";

import React, { useState, useEffect } from 'react';

const App = () => {
  const [lists, setLists] = useState([]);
  const [newList, setNewList] = useState({ name: '', description: '', visibility: 'private', heroes: [] });
  const [editList, setEditList] = useState({ name: '', description: '', heroes: [] });
  const [selectedListForEdit, setSelectedListForEdit] = useState('');
  const [superheroes, setSuperheroes] = useState([]);
  const [isCreatingNewList, setIsCreatingNewList] = useState(false);
  const [expandedList, setExpandedList] = useState(null);
  const [selectedHeroesForNewList, setSelectedHeroesForNewList] = useState([]);
  const [expandedHeroDetails, setExpandedHeroDetails] = useState({});
  const [heroNamesInList, setHeroNamesInList] = useState({});
  const [additionalHeroes, setAdditionalHeroes] = useState([]);
  const [publicLists, setPublicLists] = useState([]);
    const [review, setReview] = useState({
        listName: '',
        rating: '',
        comment: ''
    });
  const [editingList, setEditingList] = useState(null); // For the list being edited
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    heroes: [], // This will hold hero IDs
  });


    // Existing useEffect for fetching lists and superheroes
    useEffect(() => {
      fetchLists();
      fetchSuperheroes();
      fetchPublicLists();
  }, []);

  // New function to fetch public lists
  const fetchPublicLists = async () => {
      // Fetch public lists logic here
      // Example:
      const response = await fetch('http://localhost:5001/api/publicLists');
      if (response.ok) {
          const data = await response.json();
          setPublicLists(data);
      }
  };
  const fetchLists = async () => {
    const token = localStorage.getItem('jwtToken');
    const response = await fetch('http://localhost:5001/api/secure/savedLists', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (response.ok) {
      setLists(data);
    } else {
      console.error(data.message);
    }
  };

  const fetchSuperheroes = async () => {
    const response = await fetch('http://localhost:5001/api/superhero_info');
    const data = await response.json();
    if (response.ok) {
      setSuperheroes(data);
    } else {
      console.error('Failed to fetch superheroes');
    }
  };

  const handleCreateListToggle = () => {
    setIsCreatingNewList(!isCreatingNewList);
  };

  const handleCreateList = async () => {
    if (!newList.name.trim() || selectedHeroesForNewList.length === 0) {
      console.error("Invalid list name or no heroes selected.");
      alert("Please provide a valid list name and select at least one superhero.");
      return;
    }
 
    try {
      const token = localStorage.getItem('jwtToken');
      const superheroIDs = selectedHeroesForNewList.map(hero => hero.id); // Map selected heroes to their IDs
 
      const response = await fetch('http://localhost:5001/api/secure/savedLists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          listName: newList.name.trim(),
          description: newList.description,
          superheroIDs, // Send the mapped IDs
          isPublic: newList.visibility === 'public'
        })
      });
 
      const data = await response.json();
      if (response.ok) {
        // Update state with the new list
        setLists(prevLists => [...prevLists, data]);
        setNewList({ name: '', description: '', visibility: 'private', heroes: [] });
        setSelectedHeroesForNewList([]); // Reset the selected heroes for new list
        setIsCreatingNewList(false);
      } else if (response.status === 409) {
        alert("List name already exists. Please choose a different name.");
      } else {
        console.error(data.message);
        alert("An error occurred while creating the list. Please try again.");
      }
    } catch (error) {
      console.error('Error:', error);
      alert("An error occurred while creating the list. Please check your network and try again.");
    }
  };
 

  const handleListFormChange = (e) => {
    setNewList({ ...newList, [e.target.name]: e.target.value });
  };

  const handleSuperheroSelectionChange = (e) => {
    const selectedOptions = Array.from(e.target.options)
                                .filter(option => option.selected)
                                .map(option => ({ id: option.value, name: option.label }));
    setSelectedHeroesForNewList(selectedOptions);
  };
 
 const handleExpandInfo = async (listName) => {
  if (expandedList === listName) {
    setExpandedList(null);
    setHeroNamesInList({});
  } else {
    setExpandedList(listName);
    const token = localStorage.getItem('jwtToken');
    try {
      const response = await fetch(`http://localhost:5001/api/secure/names/${listName}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const heroNames = await response.json();
        const heroNamesMap = heroNames.reduce((acc, hero) => {
          acc[hero.id] = hero.name;
          return acc;
        }, {});
        setHeroNamesInList(heroNamesMap);
      } else {
        throw new Error('Failed to fetch hero names');
      }
    } catch (error) {
      console.error('Error fetching hero names:', error);
    }
  }
};


const renderHeroDetails = (heroId) => {
  const heroDetails = expandedHeroDetails[heroId];
  if (!heroDetails) return null;

  return (
      <div style={styles.heroDetails}>
        <div style={styles.detailHeader}>
        <h3>{heroDetails.name}</h3>
      </div>
          <p>Name: {heroDetails.name}</p>
          <p>Gender: {heroDetails.Gender}</p>
          <p>Eye Color: {heroDetails["Eye color"]}</p>
          <p>Race: {heroDetails.Race}</p>
          <p>Hair Color: {heroDetails["Hair color"]}</p>
          <p>Height: {heroDetails.Height}</p>
          <p>Publisher: {heroDetails.Publisher}</p>
          <p>Skin Color: {heroDetails["Skin color"]}</p>
          <p>Alignment: {heroDetails.Alignment}</p>
          <p>Weight: {heroDetails.Weight}</p>
          <p>Powers:</p>
          <ul>
              {Object.keys(heroDetails.powers || {}).map(power => (
                  <li key={power}>{power}</li>
              ))}
          </ul>
      </div>
  );

};
const handleCollapseDetails = (heroId) => {
  setExpandedHeroDetails(prevDetails => ({
    ...prevDetails,
    [heroId]: null
  }));
};

const handleChangeVisibility = async (listName, isPublic) => {
  const token = localStorage.getItem('jwtToken');
  try {
    const response = await fetch(`http://localhost:5001/api/secure/savedLists/${listName}/visibility`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isPublic })
    });

    if (response.ok) {
      // Update the state to reflect the change
      setLists(lists.map(list => list.listName === listName ? { ...list, isPublic } : list));
    } else {
      // Handle error
      console.error('Failed to change visibility');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};



const renderListHeroes = (list) => {
  return list.superheroIDs.map(heroId => {
    const heroName = heroNamesInList[heroId];
    const heroDetails = expandedHeroDetails[heroId];
    const showDetails = !!heroDetails;

    return (
      <div key={heroId} style={styles.heroItem}>
        {heroName}
        <button onClick={() => showDetails ? handleCollapseDetails(heroId) : handleShowMore(heroId)}>
          {showDetails ? 'Show Less' : 'Show More'}
        </button>
        {showDetails && renderHeroDetails(heroId)}
      </div>
    );
  });
};

const handleEditChange = (e) => {
  const { name, value } = e.target;
  setEditList(prev => ({ ...prev, [name]: value }));
};

const handleEditList = async () => {
  const token = localStorage.getItem('jwtToken');

  // Get IDs of existing heroes in the list
  const existingHeroIDs = editList.heroes.map(hero => hero.id);

  // Filter additionalHeroes to include only those not already in the list
  const newHeroIDs = additionalHeroes
    .filter(hero => !existingHeroIDs.includes(hero.id))
    .map(hero => hero.id);

  // Combine existing heroes with the newly added heroes
  const updatedHeroIDs = [...existingHeroIDs, ...newHeroIDs];

  // Construct the body for the update request
  const updateBody = {
    newName: editList.name, // Updated list name
    description: editList.description, // Updated description
    superheroIDs: updatedHeroIDs // Combined hero IDs
  };

  try {
    let response = await fetch(`http://localhost:5001/api/secure/savedLists/${selectedListForEdit}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateBody)
    });

    if (!response.ok) throw new Error('Failed to update list');

    // Fetch the updated lists
    fetchLists();

    // Reset states
    setSelectedListForEdit('');
    setEditList({ name: '', description: '', heroes: [] });
    setAdditionalHeroes([]);
    alert("List updated successfully");
  } catch (error) {
    console.error('Error:', error);
    alert("An error occurred while updating the list.");
  }
};

    // Handle change in review form
    const handleReviewChange = (e) => {
      const { name, value } = e.target;
      setReview(prevReview => ({
          ...prevReview,
          [name]: value
      }));
  };

  // Handle review form submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch(`http://localhost:5001/api/secure/savedLists/${review.listName}/review`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                rating: review.rating,
                comment: review.comment
            })
        });

        if (response.ok) {
            alert('Review submitted successfully');
            setReview({ listName: '', rating: '', comment: '' }); // Reset form
            fetchPublicLists(); // Refresh lists to show new review
        } else {
            alert('Failed to submit review');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error submitting review');
    }
};




const handleListSelect = (e) => {
  const selectedListName = e.target.value;
  setSelectedListForEdit(selectedListName);
  const listToEdit = lists.find(list => list.listName === selectedListName);
  if (listToEdit) {
    const heroesInList = listToEdit.superheroIDs
      .map(id => superheroes.find(hero => hero.id === id))
      .filter(hero => hero !== undefined); // Exclude any undefined heroes

    setEditList({
      name: listToEdit.listName,
      description: listToEdit.description,
      heroes: heroesInList,
    });
  }
};


const renderEditListForm = () => (
  <div style={styles.formContainer}>
    <h2>Edit List</h2>
    <select value={selectedListForEdit} onChange={handleListSelect} style={styles.input}>
      <option value="">Select a List to Edit</option>
      {lists.map((list) => (
        <option key={list.listName} value={list.listName}>{list.listName}</option>
      ))}
    </select>

    {selectedListForEdit && (
      <>
        <input
          name="name"
          value={editList.name}
          onChange={handleEditChange}
          placeholder="List Name"
          style={styles.input}
        />
        <textarea
          name="description"
          value={editList.description}
          onChange={handleEditChange}
          placeholder="Description"
          style={styles.input}
        />
        <select 
          multiple 
          style={styles.multiSelect}
          onChange={handleAdditionalHeroSelection}
        >
          {superheroes.map(hero => (
            <option key={hero.id} value={hero.id}>{hero.name}</option>
          ))}
        </select>
        <button onClick={handleEditList} style={styles.button}>Update List</button>
      </>
    )}
  </div>
);


// Function to handle the selection of additional heroes
const handleAdditionalHeroSelection = (e) => {
  const selectedOptions = Array.from(e.target.options)
                                .filter(option => option.selected)
                                .map(option => ({ id: option.value, name: option.label }));
  setAdditionalHeroes(selectedOptions);
};


// Function to add heroes to the list
const addHeroesToList = async (listName, heroes) => {
  const token = localStorage.getItem('jwtToken');
  for (const hero of heroes) {
    await fetch(`http://localhost:5001/api/secure/savedLists/addHero`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        listName: listName,
        superheroId: hero.id
      })
    });
  }
};




const handleDeleteList = async (listName) => {
  // Show confirmation dialog
  const isConfirmed = window.confirm(`Are you sure you want to delete the list "${listName}"?`);

  // Proceed with deletion only if confirmed
  if (isConfirmed) {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch(`http://localhost:5001/api/secure/savedLists/${listName}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Update the state to remove the deleted list
        setLists(lists.filter(list => list.listName !== listName));
      } else {
        const data = await response.json();
        console.error(data.message);
        alert(`Failed to delete the list: ${data.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`An error occurred while deleting the list: ${error.message}`);
    }
  }
};


  const renderCreateListForm = () => (
    <div style={styles.formContainer}>
      <input name="name" value={newList.name} onChange={handleListFormChange} placeholder="List Name" style={styles.input} />
      <textarea name="description" value={newList.description} onChange={handleListFormChange} placeholder="Description" style={styles.input} />

      <select 
        multiple 
        style={styles.multiSelect}
        onChange={handleSuperheroSelectionChange}
      >
        {superheroes.map(hero => (
          <option key={hero.id} value={hero.id}>{hero.name}</option>
        ))}
      </select>

      <button onClick={handleCreateList} style={styles.button}>Create List</button>
    </div>
  );

  const handleShowMore = async (heroId) => {
    const token = localStorage.getItem('jwtToken');

    try {
        const response = await fetch(`http://localhost:5001/api/secure/fullHeroInfo/${heroId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const heroDetails = await response.json();

            setExpandedHeroDetails(prevDetails => ({
                ...prevDetails,
                [heroId]: heroDetails
            }));
        } else {
            throw new Error('Failed to fetch hero details');
        }
    } catch (error) {
        console.error('Error fetching hero details:', error);
    }
};
const ToggleSwitch = ({ checked, onChange }) => {
  return (
    <label style={styles.switch}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={styles.switchInput} // Make sure this style is defined if needed
      />
      <span style={checked ? {...styles.slider, ...styles.sliderChecked} : styles.slider}>
        <span style={checked ? styles.sliderAfter : styles.sliderBefore}></span>
      </span>
    </label>
  );
};


  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date) ? 'Invalid Date' : date.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const renderLists = () => (
    lists.map((list, index) => (
      <div key={`${list.listName}-${index}`} style={styles.listItem}>
        <div style={styles.listHeader}>
          <h3 style={styles.listItemTitle}>{list.listName}</h3>
          <div style={styles.switchContainer}>
            <span style={styles.switchLabel}>{list.isPublic ? 'Public' : 'Private'}</span>
            <ToggleSwitch
              checked={list.isPublic}
              onChange={() => handleChangeVisibility(list.listName, !list.isPublic)}
            />
          </div>
        </div>
        <p>{list.description}</p>
        <p>Created: {formatDate(list.createdAt)}</p>
        <p>Last Modified: {formatDate(list.updatedAt)}</p>
        <div style={styles.actions}>
          <button style={styles.expandButton} onClick={() => handleExpandInfo(list.listName)}>Expand Info</button>
          <button style={styles.deleteButton} onClick={() => handleDeleteList(list.listName)}>Delete</button>
        </div>
        {expandedList === list.listName && (
          <div style={styles.expandedInfo}>
            {renderListHeroes(list)}
          </div>
        )}
        {list.isPublic && (
          <div>
            <h4 style={styles.reviewTitle}>Reviews:</h4>
            {Array.isArray(list.reviews) && list.reviews.length > 0 ? (
              list.reviews.map((review, reviewIndex) => (
                <div key={reviewIndex} style={styles.review}>
                  <p><strong>Rating:</strong> {review.rating}</p>
                  <p><strong>Comment:</strong> {review.comment || 'No comment'}</p>
                  <p><strong>By:</strong> {review.username} on {new Date(review.date).toLocaleDateString()}</p>
                </div>
              ))
            ) : (
              <p>No reviews yet.</p>
            )}
          </div>
        )}
      </div>
    ))
  );
 
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Superhero List Manager</h1>
      {isCreatingNewList ? renderCreateListForm() : (
        <button onClick={handleCreateListToggle} style={styles.button}>New List</button>
      )}
      <div style={styles.listContainer}>
        {renderLists()}
      </div>
      {renderEditListForm()}
              {/* Review Form */}
              <div style={styles.reviewForm}>
            <h2>Add a Review to a Public List</h2>
            <form onSubmit={handleReviewSubmit}>
                <select
                    name="listName"
                    value={review.listName}
                    onChange={handleReviewChange}
                    style={styles.input}
                    required
                >
                    <option value="">Select a Public List</option>
                    {publicLists.map(list => (
                        <option key={list.listName} value={list.listName}>{list.listName}</option>
                    ))}
                </select>
                <input
                    type="number"
                    name="rating"
                    value={review.rating}
                    onChange={handleReviewChange}
                    placeholder="Rating (1-5)"
                    min="1"
                    max="5"
                    style={styles.input}
                    required
                />
                <textarea
                    name="comment"
                    value={review.comment}
                    onChange={handleReviewChange}
                    placeholder="Comment"
                    style={styles.input}
                ></textarea>
                <button type="submit" style={styles.button}>Submit Review</button>
            </form>
        </div>
    </div>
  );
};


const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#f4f4f4',
    minHeight: '100vh',
  },
  formContainer: {
    maxWidth: '600px',
    width: '100%',
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px',
  },
  listContainer: {
    maxWidth: '600px',
    width: '100%',
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '20px',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  multiSelect: {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    height: '150px',
  },
  button: {
    width: '100%',
    padding: '10px 20px',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginBottom: '10px',
  },
  listItem: {
    backgroundColor: '#e6e6e6',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '4px',
  },
  listItemTitle: {
    fontWeight: 'bold',
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '10px',
  },
  expandButton: {
    backgroundColor: '#ffc107',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    padding: '5px 10px',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    padding: '5px 10px',
  },
  expandedInfo: {
    marginTop: '10px',
    backgroundColor: '#f0f0f0',
    padding: '10px',
    borderRadius: '4px',
  },
  heroDetails: {
    backgroundColor: '#f8f8f8',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '5px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  heroItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '5px 10px',
    borderBottom: '1px solid #eaeaea',
    fontSize: '16px',
    color: '#333',
  },
  showMoreButton: {
    padding: '5px 15px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
  },
  listHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switch: {
    position: 'relative',
    display: 'inline-block',
    width: '60px',
    height: '34px',
    margin: '0 10px',
  },
  // Slider container (track of the switch)
  slider: {
    position: 'absolute',
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ccc',
    transition: '.4s',
    borderRadius: '34px',
  },
  // Slider knob before being checked
  sliderBefore: {
    position: 'absolute',
    content: '',
    height: '26px',
    width: '26px',
    left: '4px',
    bottom: '4px',
    backgroundColor: 'white',
    transition: '.4s',
    borderRadius: '50%',
  },
  // Slider knob after being checked
  sliderAfter: {
    position: 'absolute',
    content: '',
    height: '26px',
    width: '26px',
    left: '30px',
    bottom: '4px',
    backgroundColor: 'white',
    transition: '.4s',
    borderRadius: '50%',
  },
  // Background of the switch when checked
  sliderChecked: {
    backgroundColor: '#2196F3',
  },
  switchContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  switchLabel: {
    marginRight: '10px',
    fontSize: '16px',
  },
  reviewForm: {
    maxWidth: '600px',
    width: '100%',
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px',
},
review: {
  backgroundColor: '#f0f0f0',
  padding: '10px',
  margin: '10px 0',
  borderRadius: '4px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
}
};


export default App;
export const config = { runtime: 'client' };