const express = require('express')
const recordRoutes = express.Router()
const dbo = require('../db/conn')
//Used to read in file
const fs = require('fs') // Use the promises API
const wordsFilePath = 'words.csv'

// Set max for incorrect guesses
const maxIncorrectGuesses = 6

// This is the backend for the game screen. The majority of the game logic will happen here
recordRoutes.get('/hangman', (req, res) => {
  try {
    
    if(!req.session.username){
      console.log("Username session is not set!")
      return res.status(501).json({error: "Username Session is not set"})
    }

    let wordList;
    const dbConnect = dbo.getDb();
    console.log("Entered Hangman Route");
    console.log("The filepath is set to: " + wordsFilePath);

    fs.readFile(wordsFilePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error fetching message:', err);
        return res.status(500).json({ error: 'Failed to fetch message' });
      }

      wordList = data.split('\n').map(word => word.trim());
      console.log('Successfully loaded CSV File:' )

      const randomIndex = Math.floor(Math.random() * 1000) + 1; // Randomly picks a number between 1 and 1000
      const chosenWord = wordList[randomIndex]; // Set the word based off of the index
      console.log("The choosen word is: " + chosenWord)

      let maskedWord = '_ '.repeat(chosenWord.length).trim() // Mask all letters with underscores

      req.session.word = chosenWord;
      req.session.maskedWord = maskedWord;
      req.session.incorrectGuesses = [];
      req.session.allGuesses = [];
      req.session.totalGuesses = 0;

      res.json({ maskedWord });
    });
  } catch (err) {
    console.error('Error fetching message:', err);
    res.status(500).json({ error: 'Failed to fetch message' });
  }
});


recordRoutes.post("/guess" , async (req, res) => {
  console.log("Entered the guess route");

  if(!req.session.username){
    console.log("Username session is not set!");
    return res.status(501).json({error: "Username Session is not set"});
  }

  try {
    let { word, maskedWord, incorrectGuesses, allGuesses } = req.session; //Set the session
    let {guess} = req.body;
    let message = '';
    let gameOver = false;
    let won = false;
  
    guess = guess.toLowerCase(); //set to lowercase because words in DB contains uppercased words
    word = word.toLowerCase();
  
    console.log("The guessed letter was: " + guess);
    console.log("The choosen word is: " + req.session.word);
    console.log("The maskedWord is: " + req.session.maskedWord);
  
    if (!guess || !/^[a-zA-Z]$/.test(guess)) { //Check if null or not a letter
      return res.status(400).json({ error: 'Invalid letter' });
    } 
  
    // Check if guess is already in  incorrectGuesses
    if (allGuesses.includes(guess)) {
      return res.status(401).json({ error: 'Letter already guessed' });
    }
  
    // Check if the guess is in word
    if (word.includes(guess)) {
      // Update the masked word with the correct guess
      maskedWord = maskedWord.split(' ').map((char, index) => {
        return word[index] === guess ? guess : char; // Replace underscore with correct guess, keeping spacing
      }).join(' ');
      req.session.maskedWord = maskedWord; // Store updated masked word in session
      message = 'Correct guess!';
    } 
    else {
      // Add the incorrect guess to list
      incorrectGuesses.push(guess);
      req.session.incorrectGuesses = incorrectGuesses;
      message = 'Incorrect guess!';
    }
  
    allGuesses.push(guess);
    req.session.allGuesses = allGuesses;
    req.session.totalGuesses += 1;
  
    // Removes spaces added
    const fixedMaskedWord = maskedWord.replace(/ /g, '');
    
    // Checks for win
    if (fixedMaskedWord === word) {
      won = true;
      gameOver = true;
    }

    // Checks for loss
    if (incorrectGuesses.length >= maxIncorrectGuesses) {
      gameOver = true;
    }   
  
    if (gameOver) {
      // Save score to the database
      const scoresCollection = dbo.getDb().collection('scores');
      const score = {
        username: req.session.username,
        guesses: req.session.totalGuesses,
        wordLength: word.length,
      }
      await scoresCollection.insertOne(score);
  
      return res.json({ maskedWord, incorrectGuesses, gameOver, word, won, message: won ? 'You won!' : `Game over! The word was ${word}`  });
    }
  
    res.json({ maskedWord, incorrectGuesses, won, gameOver, word, message });
  }

  catch (err) {
    console.error('Error making guess:', err);
    res.status(500).json({ error: 'Failed to process guess' });
  }
})


//This will display the score screen
recordRoutes.get('/scores', async (req, res) => {
  try {
    const dbConnect = dbo.getDb()
    const scoresCollection = dbConnect.collection('scores')
    const { length } = req.query
    const scores = await scoresCollection
      // find the word length
      .find({ wordLength: parseInt(length) })
      // display the amount of guesses
      .sort({ guesses: 1 })
      // limit to 10 values of guesses
      .limit(10)
      .toArray()
    res.json(scores)
  } catch (err) {
    console.error('Error fetching scores: ', err)
    res.status(500).json({ error: 'Falied to fecth scores' })
  }
})

//We may want to set the word the player has to guess here.
recordRoutes.route('/login').post(async (req, res) => {
  try {
    const { username } = req.body
    console.log('Entered Login Route')
    console.log('the form had: ' + req.body.username)
    req.session.username = req.body.username
    console.log('The session username has been set to: ' + req.session.username)
    res.status(200).json({ message: 'Username set successfully' })
  } catch (err) {
    console.error('Error fetching message:', err)
    res.status(500).json({ error: 'Failed to fetch message' })
  }
})


module.exports = recordRoutes
