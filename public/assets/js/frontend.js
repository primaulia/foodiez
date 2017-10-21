// UPDATE 20 Oct
// Your ol' jquery flow

// PSEUDOCODE
// - target the search input field
// - listen to the keyUp event
// - based on what was typed, send a POST request to `/search` a JSON file
//  - send json in this format { keyword: <what's typed in the input field> }
// - expect the server to return back a json too, a list of all the restaurants
// - also expects error just in case

$(function () {
  const $searchInput = $('#searchInput')
  const $searchResults = $('#searchResults')

  $searchInput.on('keyup', e => { // e is the event object of the keyup event
    var keyword = e.target.value
    var json = JSON.stringify({
      keyword
    })

    // console.log e to make it clear
    // https://developer.mozilla.org/en-US/docs/Web/Events/keyup

    // PITSTOP: SPLIT RIGHT WITH INDEX.JS `/search` for better understanding
    fetch('/search', {
      method: 'POST',
      body: json,
      headers: {
        "Content-Type" : "application/json"
      }
    })
    .then(response => response.json()) // convert the json file into js object
    .then(showResults) // at this point we got the data
    .catch(err => console.log(err))
  })

  // UPDATE AFTER CLASS 20 OCT
  // separate the function, so it's less cluttered
  // PSEUDOCODE
  // - retrieved the data => expecting an array of 10 restaurants
  // - clear the search results area
  // - map them to array of 10 `<li>` object
  // - append them to the `<ul id="searchResults">`
  function showResults(data) {
    let allRestaurants = data.map(restaurant => {
      var $newLi = $('<li>')

      // UPDATE AFTER 20 Oct
      // add link to the list, so you can click on the restaurant name
      var $newA = $('<a>')
      $newA.attr('href', `/restaurants/${restaurant._id}`)
      $newA.text(restaurant.name)

      $newLi.append($newA)
      return $newLi
    })

    $searchResults.html('')
    $searchResults.append(allRestaurants)
  }
})
