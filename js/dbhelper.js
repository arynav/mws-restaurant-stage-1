/**
 * Common database helper functions.
 */

class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    // const port = 8000 // Change this to your server port
    const port = 1337; // Change this to your server port

    // return `http://localhost:${port}/data/restaurants.json`;
    return `http://localhost:${port}/restaurants`;

  }

  static get DATABASE_URL_REVIEWS() {
    // const port = 8000 // Change this to your server port
    const port = 1337; // Change this to your server port

    // return `http://localhost:${port}/data/restaurants.json`;
    return `http://localhost:${port}/reviews/`;

  }
  // create indexDB
  static get dbPromise() {
		if (!navigator.serviceWorker) {
			return Promise.resolve();
		} else {
			return idb.open('restaurants', 1, function (upgradeDb) {
				upgradeDb.createObjectStore('restaurants', { keyPath: 'id' });
				
			});
		}
  }

  //store reviews on local storage
  static storeOffline(review){
    console.log("offline",review);
    
    let  offline_reviews = JSON.parse(localStorage.getItem("offline_reviews"));
    if (offline_reviews === null){
      offline_reviews = [];
    }
    offline_reviews.push(review);
    localStorage.setItem("offline_reviews", JSON.stringify(offline_reviews))
  }
  
  //check if online, then send reviews to submitRestaurantReviews, to store on the server
  static sendOfflineReviews(){
    console.log("hello from sendOfflineReviews")
    let  offline_reviews = JSON.parse(localStorage.getItem("offline_reviews"));
    if (offline_reviews === null){
      offline_reviews = [];
    }
    if (offline_reviews.length > 0){
      offline_reviews.forEach((review) => DBHelper.submitRestaurantReviews(review)); 
    }
    localStorage.removeItem("offline_reviews");
  }
  
  static submitRestaurantReviews(review){
    // add new review
    return fetch('http://localhost:1337/reviews/', {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(review)

    })
    .then(response => response.json())
    .catch(error => console.error("Failed to add review", review.id, review.name))
    .then(response => console.log(response));    
  }
  //update restaurant.is_favorite to true/false in idb 
  static updateFavStatus(restaurant_id, favStatus){
    fetch(`${DBHelper.DATABASE_URL}/${restaurant_id}/?is_favorite=${favStatus}`, {
      method: "PUT"
    })
    .then(() => {
      DBHelper.dbPromise
      .then(db => {
        const tx = db.transaction('restaurants', 'readwrite');
        const store = tx.objectStore('restaurants');
        store.get(restaurant_id)
        .then(restaurant => {
          restaurant.is_favorite = favStatus;
          store.put(restaurant);
        });
      })
    })
    console.log("server is updated with is_favorite to: ", favStatus);
  }

  /**
   * Fetch all restaurants and it's reviews.
   */
  static fetchRestaurants(callback) {
		DBHelper.dbPromise.then(db => {
			if (!db) return;
			// check restaurants in IDB
			const tx = db.transaction('restaurants');
      const store = tx.objectStore('restaurants');
			store.getAll().then(results => {
        if(!navigator.onLine){
          callback(null, results);
          return;
        }
        // console.log("getting all results: ",JSON.stringify(results))
				// if (results.length === 0) {
					// if no restaurants in IDB: fetch restaurants from network
          fetch(`${DBHelper.DATABASE_URL}`)
					.then(response => {
						return response.json();
					})
					.then(restaurants => {
          //update restaurants
            const all_r_info =  [];
            restaurants.forEach(restaurant => {
              //fetch restaurant reviews
              const r_info = fetch(`${DBHelper.DATABASE_URL_REVIEWS}?restaurant_id=${restaurant.id}` )
              .then(response => {
                return response.json();
              })
              .then(reviews =>  {
                restaurant.reviews = reviews;

                 //add restaurant and  reviews to db
                const tx = db.transaction('restaurants', 'readwrite');
                const store = tx.objectStore('restaurants');
                // console.log(restaurant)
                store.put(restaurant);
              })
              all_r_info.push(r_info);

            })
            Promise.all(all_r_info).then(()=> {
              callback(null, restaurants);
            })

					})
					.catch(error => {
            // return error if unable to fetch from network
            // console.log("unable to fetch from network");
						callback(error, null);
					});
				// } else {
          // getting restaurants from IDB
          // console.log("getting restaurants from IDB " , results);
					// callback(null, results);
				// }
			})
			
		});
	}

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {

      if (error) {
        console.log("can't get restaurant by id");
        callback(error, null);
      } else {
        // console.log("got all restaurants: ", restaurants);
        // console.log('dbHelper self.restaurant: ', JSON.stringify(restaurants[0]));

        const restaurant = restaurants.find(r => r.id == id);
        // console.log("found restaurant by id from fetchRestaurantById: ",id, restaurant);

        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    if (!restaurant.photograph ) {
      return(`/img/na.png`);
    }
    return (`/img/${restaurant.photograph}.jpg`);

  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP
    }
    );
    return marker;
  }

}
