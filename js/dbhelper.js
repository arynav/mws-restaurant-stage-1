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
  static putData(data) {

    let open = indexedDB.open("mws_db", 2);
    open.onsuccess = function () {
      // Start a new transaction
      var db = open.result;
      var tx = db.transaction("MyObjectStore", "readwrite");
      var store = tx.objectStore("MyObjectStore");
      var index = store.index("NameIndex");
      // store.put({ id: 12345, name: { first: "John", last: "Doe" }, age: 42 });
      // store.put({id: 0, data});
      // store.put({ id: 0, restaurant: { data}});
      data.forEach(function(e) {
        var request = store.add(e);
        request.onsuccess = function(event) {
        console.log("added to indexDB: ", e);
      };

    });

      tx.oncomplete = function () {
        db.close();
      };
    };
  }


  static getData() {

    let open = indexedDB.open("mws_db", 2);
    open.onsuccess = function () {
      // Start a new transaction
      var db = open.result;
      var tx = db.transaction("MyObjectStore", "readwrite");
      var store = tx.objectStore("MyObjectStore");

      var restaurants = [];

      store.openCursor().onsuccess = function(event) {
      var cursor = event.target.result;
      if (cursor) {
        restaurants.push(cursor.value);
        cursor.continue();
      }
      else {
        console.log("Gor all restaurants from dB: ", restaurants);
        }
      };

      tx.oncomplete = function () {
        db.close();
      };
      return restaurants;
    };
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {

    let fetchURL = DBHelper.DATABASE_URL;
    console.log(fetchURL);
    // fetch(fetchURL, {method: 'GET'})
    //   .then(response => {
    //     response.json()
    //     .then(restaurants => {
    //       console.log(`restaurants JSON ${restaurants}`);
    //       callback(null, restaurants);
    //     });
    //   })
    //   .catch(error => {
    //     callback(`request failed to get restaurant url from db. getting: ${error}`, null);
    //   });
    console.log("We are online: ", navigator.onLine);

    if(navigator.onLine) { 
      fetch(fetchURL, { method: 'GET' })
      .then(response => response.json())
      .then(restaurants => {
        // console.log('restaurants JSON', restaurants);
        DBHelper.putData(restaurants);
        console.log("Data pushed to indexDB.");
        callback(null, restaurants);
      })
      .catch(error => {
        callback(`request failed to get restaurant url from db. getting: ${error}`, null);
      });
    } else {
      console.log("We are OFFLINE.............");
      const offlineData = DBHelper.getData();
      callback(null, offlineData);
    }

    // const offlineData = DBHelper.getData();
    // console.log("offlineData: ", offlineData);

  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
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
    // return (`/img/${restaurant.photograph}`);
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
