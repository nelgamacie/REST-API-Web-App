const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'nelgamacie@gmail.com',
        pass: 'jqzq cclr yalw ixxo'
    }
});

const app = express();
const port =5001;
const Storage = require('node-storage');
app.use(cors());

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Authorization: Bearer <token>
 
 
    if (!token) {
        return res.status(401).json({ message: 'A token is required for authentication' });
    }
    try {
        const decoded = jwt.verify(token, 'jwtToken');
        req.user = decoded;
    } catch (err) {
        return res.status(403).json({ message: 'Invalid Token' });
    }
    return next();
 };
 


const store = new Storage(path.join(__dirname, 'superheroes_lists.json'));

const registeredUsersPath = path.join(__dirname, 'registeredUsers.json');

// Check if the file exists, and if not, create it with an empty array for users
if (!fs.existsSync(registeredUsersPath)) {
    try {
      fs.writeFileSync(registeredUsersPath, JSON.stringify({ users: [] }), 'utf8');
    } catch (err) {
      console.error('Error creating registeredUsers.json:', err);
    }
}

const registeredUsers = new Storage(registeredUsersPath);
let users = registeredUsers.get('users') || [];



// Helper function to read superhero data from a specific JSON file
function readJSONFile(filename) {
    const filePath = path.join(__dirname, filename);
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

let savedLists = store.get('savedLists') || [];




const superheroInfo = readJSONFile('superhero_info.json');
const superheroPowers = readJSONFile('superhero_powers.json');


// Middleware configurations
app.use(express.static(path.join(__dirname, '../client')))
app.use(express.json());
app.use((req, res, next) => {
    console.log(`${req.method} request for ${req.url}`);
    next();
});

// Retrieve specific superhero information by ID
app.get('/api/superhero_info/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const hero = superheroInfo.find(h => h.id === id);
    if (hero) {
        res.send(hero);
    } else {
        res.status(404).send('Superhero not found');
    }
});

// Retrieve all superhero information
app.get('/api/superhero_info', (req, res) => {
    res.send(superheroInfo);
});

// Retrieve a list of unique publisher names
app.get('/api/publishers', (req, res) => {
    const publishers = [...new Set(superheroInfo.map(hero => hero.Publisher))];
    res.send(publishers);
});

// Endpoint to match superheroes based on a given field and pattern
app.get('/api/match', (req, res) => {
    const { field, pattern, n } = req.query;
    if (!field || !pattern) {
        return res.status(400).send('Field or pattern missing.');
    }
    const matchedSuperheroes = superheroInfo.filter(hero => String(hero[field]) === pattern);
    res.send(matchedSuperheroes.slice(0, n || matchedSuperheroes.length).map(hero => hero.id));
});

// Retrieve superhero powers by ID
app.get('/api/superhero_powers/:id', (req, res) => {
    const heroId = parseInt(req.params.id);
    const heroInfo = superheroInfo.find(hero => hero.id === heroId);
    if (!heroInfo) {
        return res.status(404).send('Superhero not found');
    }
    const heroPowers = superheroPowers.find(hero => hero.hero_names === heroInfo.name);
    if (!heroPowers) {
        return res.status(404).send('Superhero powers not found');
    }
    const activePowers = Object.keys(heroPowers)
                        .filter(power => heroPowers[power] === "True" && power !== "hero_names");
    res.send(activePowers);
});

app.post('/api/savedLists', (req, res) => {
    const { listName, superheroIDs } = req.body;

    if (!listName || !Array.isArray(superheroIDs)) {
        // Send a JSON response with a 400 status code
        return res.status(400).json({ message: 'Invalid list name or superhero IDs.' });
    }

    if (savedLists.some(list => list.listName === listName)) {
        // Send a JSON response with a 409 status code
        return res.status(409).json({ message: 'List name already exists.' });
    }

    // Add the new list and save it
    savedLists.push({ listName, superheroIDs });
    store.put('savedLists', savedLists);

    // Send a JSON response with a 201 status code
    return res.status(201).json({ message: `List "${listName}" created successfully.` });
});



// Update an existing list with new superhero IDs
app.put('/api/savedLists/:listName', (req, res) => {
    const listName = req.params.listName;
    const { superheroIDs } = req.body;

    if (!superheroIDs || !Array.isArray(superheroIDs)) {
        return res.status(400).send('Superhero IDs missing or incorrect format');
    }

    const listIndex = savedLists.findIndex(l => l.listName === listName);
    if (listIndex === -1) {
        return res.status(404).send('List name does not exist');
    }

    savedLists[listIndex].superheroIDs = superheroIDs;
    store.put('savedLists', savedLists);  // Persist the new state of savedLists

    res.send(`List "${listName}" updated successfully.`);
});


// Route to retrieve the list of superhero IDs for a given list
app.get('/api/savedLists/:listName', (req, res) => {
    const listName = req.params.listName;
    const list = savedLists.find(l => l.listName === listName);

    if (list) {
        if (list.superheroIDs.length === 0) {
            res.send('The list is empty.');
        } else {
            res.send(list.superheroIDs);
        }
    } else {
        res.status(404).send('List not found');
    }
});

// Route to delete a list of superheroes with a given name

app.delete('/api/savedLists/:listName', (req, res) => {
    const listName = req.params.listName;
    const listIndex = savedLists.findIndex(l => l.listName === listName);

    if (listIndex === -1) {
        return res.status(404).json({ message: 'List not found' });
    }

    savedLists.splice(listIndex, 1);
    store.put('savedLists', savedLists);  // Persist the new state of savedLists

    res.json({ message: `List "${listName}" deleted successfully.` });
});


app.get('/api/secure/fullInfo/:listName', verifyToken, (req, res) => {
    const listName = req.params.listName;
    const list = savedLists.find(l => l.listName === listName && l.owner === req.user.userId);

    if (!list) {
        return res.status(404).json({ message: 'List not found or you do not have access to this list.' });
    }

    try {
        const superheroesDetails = list.superheroIDs.map(id => {
            const superheroData = superheroInfo.find(hero => hero.id === id);
            if (!superheroData) {
                throw new Error(`Superhero with ID ${id} not found.`);
            }

            const powersData = superheroPowers.find(power => power.hero_names === superheroData.name);
            if (!powersData) {
                throw new Error(`Powers for superhero with ID ${id} not found.`);
            }

            const activePowers = Object.keys(powersData)
                .filter(power => powersData[power] === "True" && power !== "hero_names")
                .reduce((acc, power) => {
                    acc[power] = true;
                    return acc;
                }, {});

            return {
                ...superheroData,
                powers: activePowers
            };
        });

        res.json(superheroesDetails);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching superhero details.' });
    }
});


// This integrates both datasets
const integratedData = superheroInfo.map(hero => {
    const heroPowers = superheroPowers.find(power => power.hero_names === hero.name) || {};
    return {
        ...hero,
        ...heroPowers
    };
});

app.get('/api/savedLists', (req, res) => {
    const listNames = savedLists.map(list => list.listName);
    res.json(listNames);
});

app.get('/api/search', (req, res) => {
    const { name, race, publisher, power } = req.query;
    let results = integratedData;

    // Soft match for each search criteria
    if (name) {
        results = results.filter(hero => isSoftMatch(hero.name, name));
    }
    if (race) {
        results = results.filter(hero => hero.Race && isSoftMatch(hero.Race, race));
    }
    if (publisher) {
        results = results.filter(hero => hero.Publisher && isSoftMatch(hero.Publisher, publisher));
    }
    if (power) {
        results = results.filter(hero => {
            return Object.keys(hero).some(key => 
                key.toLowerCase() === power.toLowerCase() && 
                hero[key] === "True" &&
                isSoftMatch(key, power)
            );
        });
    }

    res.send(results);
});


// Levenshtein Distance function to calculate character difference
function levenshtein(a, b) {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) == a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                                        Math.min(matrix[i][j - 1] + 1, // insertion
                                                 matrix[i - 1][j] + 1)); // deletion
            }
        }
    }

    return matrix[b.length][a.length];
}

// Function to check for soft match
function isSoftMatch(dataString, searchString) {
    const normalizedData = dataString.toLowerCase().trim();
    const normalizedSearch = searchString.toLowerCase().trim();

    // Check for exact match or within two characters difference
    return normalizedData === normalizedSearch || levenshtein(normalizedData, normalizedSearch) <= 2;
}
app.post('/api/savedLists/addHero', (req, res) => {
    const { listName, superhero } = req.body;

    if (!listName || !superhero) {
        return res.status(400).json({ message: 'List name or superhero missing' });
    }

    const list = savedLists.find(list => list.listName === listName);
    if (!list) {
        return res.status(404).json({ message: 'List not found' });
    }

    if (list.superheroIDs.includes(superhero.id)) {
        return res.status(400).json({ message: 'Superhero already in list' });
    }

    list.superheroIDs.push(superhero.id);
    store.put('savedLists', savedLists);  // Persist the new state of savedLists

    res.json({ 
        message: `Superhero "${superhero.name}" added to list "${listName}" successfully.`,
        superheroIDs: list.superheroIDs  // Return the updated list of superhero IDs
    });
});

app.post('/api/register', async (req, res) => {
    try {
        const { email, username, password } = req.body;

        if (!email || !username || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Check if email already exists
        if (users.some(user => user.email === email)) {
            return res.status(409).json({ message: 'There is already an account with that email.' });
        }

        // Check if username already exists
        if (users.some(user => user.username === username)) {
            return res.status(409).json({ message: 'That username already exists, please try another one.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate a verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date();
        tokenExpires.setHours(tokenExpires.getHours() + 1); // Token expires in 1 hour

        // Create new user object
        const newUser = {
            email,
            username,
            password: hashedPassword,
            verificationToken,
            tokenExpires,
            isVerified: false,
            isAdmin:false,
            isDeactivated: false
        };

        // Prepare email
        const mailOptions = {
            from: 'nelgamacie@gmail.com',
            to: email,
            subject: 'Email Verification',
            html: `<p>Please click on the following link to verify your email: <a href="http://localhost:5001/api/verify_email/${verificationToken}">Verify Email</a></p>`
        };

        // Send email
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error);
                res.status(500).json({ message: 'Error sending email' });
            } else {
                console.log('Email sent: ' + info.response);
                // Save the new user
                users.push(newUser);
                registeredUsers.put('users', users);
                res.status(201).json({ message: 'User registered successfully. Verification email sent.' });
            }
        });

    } catch (error) {
        console.error('Error in /api/register:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.get('/api/verify_email/:token', async (req, res) => {
    const { token } = req.params;

    // Find user with the given token and that has not been verified yet
    let userIndex = users.findIndex(user => user.verificationToken === token && !user.isVerified);
    if (userIndex === -1) {
        return res.status(404).json({ message: 'Invalid or expired token' });
    }

    // Update user's isVerified status and clear the token
    users[userIndex].isVerified = true;
    users[userIndex].verificationToken = null; // Invalidate the token
    users[userIndex].tokenExpires = null; // Clear the token expiry

    // Persist the updated users array
    registeredUsers.put('users', users);

    res.json({ message: 'Email verified successfully' });
});



// Update this in your existing server-side code (index.js)

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (user.isDeactivated) {
        return res.status(403).json({ message: 'Account is deactivated. Please contact support at support@example.com.' });
    }

    if (await bcrypt.compare(password, user.password)) {
        // Generate a JWT token
        const token = jwt.sign(
            { userId: user.username, isAdmin: user.isAdmin },
            'jwtToken', // Ensure you use an environment variable for the JWT secret in production
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login successful!',
            token, // Send the token to the client
            isAdmin: user.isAdmin,
            username: user.username,
            email: user.email
        
        });
    } else {
        res.status(401).json({ message: 'Invalid credentials.' });
    }
});
 

app.post('/api/changePassword', async (req, res) => {
    try {
        const { username, oldPassword, newPassword } = req.body;

        // Find user by username
        const user = users.find(user => user.username === username);

        // Check if user exists and old password is correct
        if (user && await bcrypt.compare(oldPassword, user.password)) {
            // Check if new password is different from old password
            if (oldPassword === newPassword) {
                return res.status(400).json({ message: 'New password must be different from old password.' });
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            const hashedNewPassword = await bcrypt.hash(newPassword, salt);

            // Update user's password
            user.password = hashedNewPassword;

            // Persist the updated users array
            registeredUsers.put('users', users);

            res.json({ message: 'Password updated successfully.' });
        } else {
            res.status(400).json({ message: 'Invalid username or old password.' });
        }
    } catch (error) {
        console.error('Error in /api/change-password:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/api/secure/savedLists', verifyToken, async (req, res) => {
    const { listName, description, superheroIDs, isPublic } = req.body;
    const username = req.user.userId; // Extracted from the token
  
    if (!listName || !Array.isArray(superheroIDs)) {
      return res.status(400).json({ message: 'Invalid list name or superhero IDs.' });
    }
  
    if (savedLists.some(list => list.listName === listName && list.owner === username)) {
      return res.status(409).json({ message: 'List name already exists.' });
    }
  
    const newList = {
      listName,
      description,
      superheroIDs,
      isPublic,
      owner: username, // Link the list to the user who created it
      reviews:[],
      createdAt: new Date(), // Add the date here
      updatedAt: new Date()  // And here
    };
    savedLists.push(newList);
    store.put('savedLists', savedLists);
  
    return res.status(201).json(newList); // Return the new list object
});
  

app.put('/api/secure/savedLists/:listName', verifyToken, (req, res) => {
    const oldListName = req.params.listName;
    const { newName, superheroIDs, description, isPublic } = req.body;
    const username = req.user.userId;

    const listIndex = savedLists.findIndex(list => list.listName === oldListName && list.owner === username);

    if (listIndex === -1) {
        return res.status(404).json({ message: 'List not found or unauthorized access' });
    }

    if (newName && newName !== oldListName) {
        if (savedLists.some(list => list.listName === newName && list.owner === username)) {
            return res.status(409).json({ message: 'A list with the new name already exists.' });
        }
        savedLists[listIndex].listName = newName;
    }

    // Merge existing superhero IDs with new ones, eliminating duplicates
    const mergedSuperheroIDs = Array.from(new Set([...savedLists[listIndex].superheroIDs, ...superheroIDs]));

    // Update other list details
    savedLists[listIndex] = { 
        ...savedLists[listIndex], 
        superheroIDs: mergedSuperheroIDs, 
        description, 
        isPublic, 
        updatedAt: new Date() 
    };
    store.put('savedLists', savedLists);

    res.json({ message: `List "${oldListName}" updated successfully.` });
});



app.delete('/api/secure/savedLists/:listName', verifyToken, (req, res) => {
    const listName = req.params.listName;
    const username = req.user.userId;

    const listIndex = savedLists.findIndex(list => list.listName === listName && list.owner === username);

    if (listIndex === -1) {
        return res.status(404).json({ message: 'List not found or unauthorized access' });
    }

    savedLists.splice(listIndex, 1);
    store.put('savedLists', savedLists);

    res.json({ message: `List "${listName}" deleted successfully.` });
});

app.get('/api/secure/savedLists', verifyToken, (req, res) => {
    const username = req.user.userId;

    // Filter the lists to include only those that belong to the authenticated user
    const userLists = savedLists.filter(list => list.owner === username);

    res.json(userLists);
});

// POST endpoint to add a superhero to a list
app.post('/api/secure/savedLists/addHero', verifyToken, (req, res) => {
    const { listName, superheroId } = req.body;
    const username = req.user.userId;

    const list = savedLists.find(list => list.listName === listName && list.owner === username);
    if (!list) {
        return res.status(404).json({ message: 'List not found or unauthorized access' });
    }

    if (list.superheroIDs.includes(superheroId)) {
        return res.status(400).json({ message: 'Superhero already in list' });
    }

    list.superheroIDs.push(superheroId);
    store.put('savedLists', savedLists);

    res.json({ 
        message: `Superhero added to list "${listName}" successfully.`,
        list: list // Return the updated list
    });
});


app.get('/api/secure/simpleFullInfo/:listName', verifyToken, (req, res) => {
    const listName = req.params.listName;
    const list = savedLists.find(l => l.listName === listName && l.owner === req.user.userId);

    if (!list) {
        return res.status(404).json({ message: 'List not found or you do not have access to this list.' });
    }

    try {
        const superheroesDetails = list.superheroIDs.map(id => {
            const superheroData = superheroInfo.find(hero => hero.id === id);
            if (!superheroData) {
                return { id, error: 'Superhero not found.' };
            }
            return superheroData;
        });

        res.json(superheroesDetails);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching superhero details.' });
    }
});

app.get('/api/secure/names/:listName', verifyToken, (req, res) => {
    const listName = req.params.listName;
    const list = savedLists.find(l => l.listName === listName && l.owner === req.user.userId);

    if (!list) {
        console.log(`List not found: ${listName}`);
        return res.status(404).json({ message: 'List not found or unauthorized access' });
    }

    const heroNames = list.superheroIDs.map(id => {
        const heroData = superheroInfo.find(hero => hero.id === parseInt(id, 10));
        if (!heroData) {
            console.log(`Superhero with ID ${id} not found.`);
            return null;
        }
        return { id: heroData.id, name: heroData.name };
    }).filter(hero => hero !== null);

   

    res.json(heroNames);
});

app.get('/api/secure/fullHeroInfo/:heroId', verifyToken, (req, res) => {
    const heroId = parseInt(req.params.heroId);

    try {
        const superheroData = superheroInfo.find(hero => hero.id === heroId);
        if (!superheroData) {
            return res.status(404).json({ message: `Superhero with ID ${heroId} not found.` });
        }

        const powersData = superheroPowers.find(power => power.hero_names === superheroData.name);
        const activePowers = powersData ? Object.keys(powersData)
            .filter(power => powersData[power] === "True" && power !== "hero_names")
            .reduce((acc, power) => {
                acc[power] = true;
                return acc;
            }, {}) : {};

        res.json({
            ...superheroData,
            powers: activePowers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching superhero details.' });
    }
});

app.patch('/api/secure/savedLists/:listName/visibility', verifyToken, (req, res) => {
    const listName = req.params.listName;
    const { isPublic } = req.body;
    const username = req.user.userId;
  
    const listIndex = savedLists.findIndex(list => list.listName === listName && list.owner === username);
  
    if (listIndex === -1) {
        return res.status(404).json({ message: 'List not found or unauthorized access' });
    }
  
    savedLists[listIndex].isPublic = isPublic;
    store.put('savedLists', savedLists);
  
    res.json({ message: `List "${listName}" visibility changed to ${isPublic ? 'public' : 'private'}.` });
  });
  
  app.post('/api/secure/savedLists/:listName/addHero', verifyToken, (req, res) => {
    const { listName } = req.params;
    const { heroId } = req.body;
    const username = req.user.userId;

    const listIndex = savedLists.findIndex(list => list.listName === listName && list.owner === username);
    if (listIndex === -1) {
        return res.status(404).json({ message: 'List not found or unauthorized access' });
    }

    if (savedLists[listIndex].superheroIDs.includes(heroId)) {
        return res.status(400).json({ message: 'Superhero already in list' });
    }

    savedLists[listIndex].superheroIDs.push(heroId);
    store.put('savedLists', savedLists);

    res.json({ message: `Superhero added to list "${listName}" successfully.` });
});

app.get('/api/publicLists', (req, res) => {
    const publicLists = savedLists
        .filter(list => list.isPublic)
        .map(list => {
            // Include review data in the response
            return {
                ...list,
                reviews: list.reviews || [] // Ensure there's a default empty array if no reviews
            };
        })
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) // Sort by most recently updated
        .slice(0, 10); // Get top 10 lists

    res.json(publicLists);
});

app.post('/api/secure/savedLists/:listName/review', verifyToken, (req, res) => {
    const { listName } = req.params;
    const { rating, comment } = req.body;
    const username = req.user.userId; // Username from token

    const list = savedLists.find(list => list.listName === listName && list.isPublic);
    if (!list) {
        return res.status(404).json({ message: 'List not found or not public' });
    }

    // Create a unique ID based on the current timestamp and a random number
    const uniqueId = `review-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

    const newReview = {
        id: uniqueId,
        rating,
        comment,
        username,
        date: new Date().toISOString(),
        hidden: false
    };

    list.reviews.push(newReview);
    list.updatedAt = new Date().toISOString(); // Update the last updated date
    store.put('savedLists', savedLists); // Save changes

    res.status(201).json({ message: 'Review added successfully', review: newReview });
});


app.patch('/api/admin/grantAdmin', verifyToken, async (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Unauthorized access' });
    }
 
 
    const { username, grant } = req.body; // `grant` is a boolean indicating whether to grant or revoke admin privileges
 
 
    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
    }
 
 
    users[userIndex].isAdmin = grant;
    registeredUsers.put('users', users);
 
 
    res.json({ message: `Admin privileges ${grant ? 'granted' : 'revoked'} for user ${username}` });
 });
 
 
 app.get('/api/users', verifyToken, (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Unauthorized access' });
    }
    // Assuming `users` is an array of user objects
    res.json(users.map(user => ({ username: user.username, email: user.email, isAdmin: user.isAdmin })));
 });
 
 
 app.get('/api/nonAdminUsers', verifyToken, (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Unauthorized access' });
    }
 
 
    const nonAdminUsers = users.filter(user => !user.isAdmin)
                               .map(user => ({
                                   username: user.username,
                                   email: user.email,
                                   isAdmin: user.isAdmin
                               }));
 
 
    res.json(nonAdminUsers);
 });
 
 app.patch('/api/secure/savedLists/:listName/review/:reviewId/visibility', verifyToken, (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Unauthorized access' });
    }

    const { listName, reviewId } = req.params;
    const list = savedLists.find(list => list.listName === listName);
    if (!list) {
        return res.status(404).json({ message: 'List not found' });
    }

    const review = list.reviews.find(r => r.id === reviewId);
    if (!review) {
        return res.status(404).json({ message: 'Review not found' });
    }

    // Toggle the hidden status
    review.hidden = !review.hidden;

    store.put('savedLists', savedLists); // Persist the updated list
    res.json({ message: `Review visibility updated`, review });
});



app.patch('/api/users/:username/deactivate', verifyToken, (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Unauthorized access' });
    }

    const { username } = req.params;
    const { deactivate } = req.body; // true to deactivate, false to reactivate

    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
    }

    users[userIndex].isDeactivated = deactivate;
    registeredUsers.put('users', users); // Assuming this updates your JSON file

    console.log(`User ${username} deactivated status: ${deactivate}`); // Temporary log for debugging

    res.json({ message: `User ${username} ${deactivate ? 'deactivated' : 'reactivated'} successfully.` });
});

app.get('/api/publicListsInfo', (req, res) => {
    const publicLists = savedLists
        .filter(list => list.isPublic)
        .map(list => {
            const averageRating = list.reviews.reduce((acc, review) => acc + review.rating, 0) / list.reviews.length || 0;
            return {
                ...list,
                numberOfHeroes: list.superheroIDs.length,
                averageRating: averageRating.toFixed(1), // Assuming rating is a numeric value
                reviews: undefined // Exclude detailed reviews for privacy
            };
        })
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) // Sort by most recently updated
        .slice(0, 10); // Get top 10 lists

    res.json(publicLists);
});

app.get('/api/heroNames/:listName', (req, res) => {
    const listName = req.params.listName;
    const list = savedLists.find(l => l.listName === listName && l.isPublic);

    if (!list) {
        return res.status(404).json({ message: 'Public list not found' });
    }

    const heroNames = list.superheroIDs.map(id => {
        const heroData = superheroInfo.find(hero => hero.id === parseInt(id, 10));
        if (!heroData) {
            return null;
        }
        return heroData.name;
    }).filter(name => name !== null);

    res.json({ listName, heroNames });
});

// Catch-all route for handling 404 errors
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});