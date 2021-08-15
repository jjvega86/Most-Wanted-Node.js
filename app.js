const prompt = require("prompt-sync")();

/*
Build all of your functions for displaying and gathering information below (GUI).
*/

// TODO
// TODO: Port over to Node.js
// TODO: Install Jest and write 10 unit tests
// TODO: Finish validation functions
// DONE - Search by Name - get the individual person based on search
// DONE - Search by Traits - use a do/while loop to reprompt for multiple traits
// DONE - Reduce search results to single person
// DONE - Get Person's Info
// DONE - Get Person's Family
//    DONE: spouse, parents, siblings
// DONE - Display Person's Family
// DONE - Get Person's Descendants (using recursion)
// DONE - Write validation functions for all user input (look for VALIDATE throughout comments)

// HIGHER ORDER ARRAY METHODS TO USE
// .map
// .filter
// .reduce

// <<<<<<<<<<<<<<<< TOP LEVEL APPLICATION FUNCTIONS >>>>>>>>>>>>>>>>>>>>>

// app is the function called to start the entire application
function app(people) {
  let searchType = promptFor(
    "Do you know the name of the person you are looking for? Enter 'yes' or 'no'",
    yesNo
  ).toLowerCase();
  let searchResults;
  switch (searchType) {
    case "yes":
      searchResults = searchByName(people);
      break;
    case "no":
      searchResults = searchByTrait(people);
      break;
    default:
      app(people); // restart app
      break;
  }

  let person = reduceToSinglePerson(people, searchResults);
  mainMenu(person, people);
}

// Menu function to call once you find who you are looking for
function mainMenu(person, people) {
  /* Here we pass in the entire person object that we found in our search, as well as the entire original dataset of people. We need people in order to find descendants and other information that the user may want. */

  if (!person) {
    console.log("Could not find that individual.");
    return app(people); // restart
  }

  let displayOption = promptFor(
    "Found " +
      person.firstName +
      " " +
      person.lastName +
      " . Do you want to know their 'info', 'family', or 'descendants'? Type the option you want or 'restart' or 'quit'",
    menuValidate
  );

  switch (displayOption) {
    case "info":
      displayPerson(person);
      break;
    case "family":
      findAndDisplayImmediateFamily(person, people);
      break;
    case "descendants":
      displayPeople(getDescendants(person, people));
      break;
    case "restart":
      app(people); // restart
      break;
    case "quit":
      return; // stop execution
    default:
      return mainMenu(person, people); // ask again
  }
}

// <<<<<<<<<< PERSON SEARCH FUNCTIONS >>>>>>>>>>>>>>>>

function searchByName(people) {
  let firstName = promptFor("What is the person's first name?", capitalize);
  let lastName = promptFor("What is the person's last name?", capitalize);

  let foundPerson = people.filter(function (person) {
    if (person.firstName === firstName && person.lastName === lastName) {
      return true;
    } else {
      return false;
    }
  });
  checkForEmptyArray(foundPerson, searchByName, people); // If no people found, re-prompt for another name search
  return objectifyArray(foundPerson);
}

const searchByTrait = (people) => {
  let searchComplete = false;
  let searchResults = people;

  do {
    let trait = promptFor(
      "Which trait would you like to search by? <gender, eye color, date of birth, height, weight, occupation> or chose <DONE>",
      traitValidate
    );
    let traitValue = pickTraitValue(trait);
    searchResults = searchResults.filter((person) => {
      return person[`${trait}`] === traitValue;
    });
    searchComplete = promptComplete("Are you done searching?", yesNo);
  } while (!searchComplete);

  return searchResults;
};

const pickTraitValue = (trait) => {
  let selection = promptFor(
    `Enter the ${trait} you would like to find.`,
    chars
  ); //TODO: VALIDATE
  return selection;
};

const reduceToSinglePerson = (people, results) => {
  if (results.length > 1) {
    displayPeople(results);
    let finalResult = searchByName(people);
    return finalResult;
  } else {
    return results;
  }
};

// <<<<<<<<<<<<< SEE FAMILY FUNCTIONS >>>>>>>>>>>>>

const findAndDisplayImmediateFamily = (person, people) => {
  let spouse = findSpouse(person, people); // will return a single person or null
  let parents = findParents(person, people); // can return a single person, two people, or null
  let siblings = findSiblings(parents, people); // can return multiple people, single person, or null

  displayFamily(spouse, parents, siblings);
};

const findSpouse = (person, people) => {
  let spouse = people.filter((target) => {
    if (target.currentSpouse === person.id) {
      return true;
    } else {
      return false;
    }
  });

  return objectifyArray(spouse);
};

const findParents = (person, people) => {
  let parents = [];

  person.parents.forEach((element) => {
    // enumerate through parents property on person object
    let parent = people.filter((target) => {
      // compare element id to id property of all objects in people
      if (element === target.id) {
        return true;
      } else {
        return false;
      }
    });
    parents.push(objectifyArray(parent)); // add parent to parents array. Now no matter how many parents there are, we can add them.
  });

  return parents;
};

const findSiblings = (parents, people) => {
  let siblings = [];

  parents.forEach((element) => {
    let sibling = people.filter((target) => {
      if (target.parents.includes(element["id"])) {
        return true;
      } else {
        return false;
      }
    });
    siblings.push(sibling);
  });
  return removeSiblingDuplicates(siblings);
};

const removeSiblingDuplicates = (siblings) => {
  let finalSiblingsArray = [];

  if (siblings.length > 1) {
    // if siblings is longer than 1 element, then both parents came back with siblings
    // we need to combine both arrays of objects, remove duplicates, and send back a de-duped array
    let combinedSiblings = [...siblings[0], ...siblings[1]]; // combine two arrays in siblings
    let finalSiblingsSet = new Set(combinedSiblings); // remove duplicates by converting array into a Set
    finalSiblingsArray = [...finalSiblingsSet]; // convert Set back to an array
  } else {
    //otherwise, just send back the single array of siblings we originally got
    finalSiblingsArray = siblings;
  }

  return finalSiblingsArray;
};

// <<<<<<<<<<<<< DESCENDANT FUNCTIONS >>>>>>>>>>>>>

const getDescendants = (person, people, descendants = []) => {
  // test with Joy Madden

  people.forEach((el) => {
    //finds children of the passed in person. The looks to see if that child has children. Does this for entire data set.
    if (el.parents.includes(person.id)) {
      descendants.push(el);
      getDescendants(el, people, descendants);
    }
  });

  return descendants;
};

// <<<<<<<<<<<<< DISPLAY FUNCTIONS >>>>>>>>>>>>>

// console logs a list of people
function displayPeople(people) {
  console.log(
    people
      .map(function (person) {
        return person.firstName + " " + person.lastName;
      })
      .join("\n")
  ); // .join with the line break separator breaks each person into their own line
}

function displayFamily(spouse, parents, siblings) {
  let spouseInfo = addSpouseInfo(spouse);
  let infoWithParents = addParentInfo(parents, spouseInfo);
  let finalInfo = addSiblingInfo(siblings, infoWithParents);

  console.log(finalInfo);
}

function addSpouseInfo(spouse) {
  let familyInfo = "";
  console.log(Object.keys(spouse).length);
  if (Object.keys(spouse).length > 0) {
    familyInfo += `Spouse: ${spouse.firstName} ${spouse.lastName}\n`;
  } else {
    familyInfo += `No spouse information available!\n`;
  }

  return familyInfo;
}

function addParentInfo(parents, spouseInfo) {
  if (parents !== null) {
    for (let i = 0; i < parents.length; i++) {
      if (parents[i].gender === "male") {
        spouseInfo +=
          "Father: " + parents[i].firstName + " " + parents[i].lastName + "\n";
      } else {
        spouseInfo +=
          "Mother: " + parents[i].firstName + " " + parents[i].lastName + "\n";
      }
    }
  } else {
    spouseInfo += "No parents on record!" + "\n";
  }
  return spouseInfo;
}

function addSiblingInfo(siblings, infoWithParents) {
  if (siblings !== null) {
    for (let i = 0; i < siblings.length; i++) {
      if (siblings[i].gender === "male") {
        infoWithParents +=
          "Brother: " +
          siblings[i].firstName +
          " " +
          siblings[i].lastName +
          "\n";
      } else {
        infoWithParents +=
          "Sister: " +
          siblings[i].firstName +
          " " +
          siblings[i].lastName +
          "\n";
      }
    }
  } else {
    infoWithParents += "No siblings on record!" + "\n";
  }
  return infoWithParents;
}

function displayPerson(person) {
  let personInfo = "First Name: " + person.firstName + "\n";
  personInfo += "Last Name: " + person.lastName + "\n";
  personInfo += "Height: " + person.height + "\n";
  personInfo += "Weight: " + person.weight + "\n";
  personInfo += "Age: " + convertDobToAge(person.dob) + "\n";
  personInfo += "Occupation: " + person.occupation + "\n";
  personInfo += "Eye Color: " + person.eyeColor + "\n";

  console.log(personInfo);
}

const convertDobToAge = (dob) => {
  let dateParts = dob.split("/"); // split the date of birth into an array to separate month, day, year
  let [month, day, year] = dateParts; // destructure array into individual variables for each date component

  let dateOfBirth = new Date(year, month, day); // create new Date object using destructured variables
  let thisYear = new Date().getFullYear(); // get the current year
  let yearOfBirth = dateOfBirth.getFullYear(); // get the year from person's date of birth

  return thisYear - yearOfBirth; // return the difference between current year and person's year of birth
};

// <<<<<<<<<<<<< UTILITY FUNCTIONS >>>>>>>>>>>>>

const objectifyArray = (arrayToObjectify) =>
  Object.assign({}, ...arrayToObjectify);

// <<<<<<<<<<<<< INPUT VALIDATION FUNCTIONS >>>>>>>>>>>>>

// function that prompts and validates user input
function promptFor(question, valid) {
  do {
    var response = prompt(question).trim();
  } while (!response || !valid(response));
  return response;
}

const menuValidate = (response) => {
  response.toLowerCase();

  switch (response) {
    case "info":
      return true;
    case "menu":
      return true;
    case "quit":
      return true;
    case "restart":
      return true;
    case "family":
      return true;
    case "descendants":
      return true;
    default:
      return false;
  }
};

const traitValidate = (response) => {
  response.toLowerCase();

  switch (response) {
    case "gender":
      return true;
    case "eye color":
      return "eyeColor";
    case "date of birth":
      return "dob";
    case "height":
      return true;
    case "weight":
      return true;
    case "occupation":
      return true;
    case "DONE":
      return true;
    default:
      return false;
  }
};

const promptComplete = (question, valid) => {
  let complete = false;
  do {
    var response = prompt(question).trim();
  } while (!response || !valid(response));

  if (response === "no") {
    return complete;
  } else {
    complete = true;
    return complete;
  }
};

const capitalize = (input) => input.charAt(0).toUpperCase();

const checkForEmptyArray = (input, action, params) => {
  // allows callback and parameters to be passed in from multiple functions that return arrays
  if (input.length === 0) {
    console.log("Please try again!");
    action(params);
  }
};

// helper function to pass into promptFor to validate yes/no answers
function yesNo(input) {
  return input.toLowerCase() == "yes" || input.toLowerCase() == "no";
}

// helper function to pass in as default promptFor validation
function chars(input) {
  return true; // default validation only
}

module.exports = app;
