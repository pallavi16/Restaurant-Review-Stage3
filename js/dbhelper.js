/**
 * Common database helper functions.
 */

 class DBHelper {
  
 
  static get dbName(){
    return "dbRestaurant-static";
  }
  static get dbVersion(){
    return 1;
  }
  static get dbStoreName(){
    return "restaurants";
  }

  static get dbStoreReviews(){
    return "reviews";
  }
  

 
 // create DB function createIndexedDB()
static createIndexedDB() {
  if (!navigator.serviceWorker) {
    return Promise.resolve();
   }
 
  if (!('indexedDB' in window)) {return null;}
  
  return idb.open(DBHelper.dbName, 2, (upgradeDb) =>  {
      switch(upgradeDb.oldVersion) {
        case 0:
          const store = upgradeDb.createObjectStore('restaurants', {
            keyPath: 'id'});
         
        case 1:
        const reviewsStore = upgradeDb.createObjectStore('reviews', {
          keyPath: 'id'});
        reviewsStore.createIndex('restaurant','restaurant_id');
        //reviewsStore.createIndex('restaurant','restaurant_id', {unique: true});
        }

  }); 
}

 
  /**
   * python3 -m http.server 3500
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
  
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  static getObjectStore(dbs, storeName, mode) {
            let tx = dbs.transaction(storeName, mode);
        return tx.objectStore(storeName);
              
  }

// save data from network to local indexDB
 static saveData(restaurantsJSON) {
    
    let restaurants = restaurantsJSON;
    console.log('restaurantsJSON ', restaurantsJSON);
    const dbPromise = this.createIndexedDB();

     dbPromise.then(db => {
     const store = this.getObjectStore(db, this.dbStoreName, 'readwrite');

       restaurants.forEach((restaurant) => {
        store.put(restaurant);
       })
     });
  }
  /**
 *  offline storage.
  *
 */
  static setLocalStorage(offlineData) {
    const offlineReviews = localStorage.setItem('offlineData', offlineData);
     console.log("offline reviews saved", offlineReviews);
    return offlineReviews;
    
  }

  static getLocalStorage() {
      const fromOffLineToOnline = localStorage.getItem('offlineData');
      console.log("offline reviews saved", fromOffLineToOnline);
  return fromOffLineToOnline;
  }

  static clearLocalStorage() {
    localStorage.removeItem('offlineData');
  }
  static lengthLocalStorage() {
    return localStorage.length;
  }
  static getLocalData(db_promise) {
    
    return db_promise.then((db) => {
          if (!db) return;
          const store = this.getObjectStore(db, DBHelper.dbStoreName, 'readonly');
          return store.getAll();
        });
  }



  /**
 *  Add  or update data to the server
  *
 */
  static serverPostGetPut(url,options) {
      return fetch(url, options).then(response => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response.json();
      });
  }


  static postUpdateServer(networkData){
    const urls = 'http://localhost:1337/reviews/';
    let localData = getOfflinePost();
    const headers = new Headers({'Content-Type': 'application/json'});
        const body = JSON.stringify(jsonData);
        let opts = {
          method: 'POST',
          mode: 'no-cors',
          cache: "no-cache",
          credentials: 'same-origin',
          headers: headers,
          body: localData
        }; 
     let localData = this.getOfflinePost();
     if(localData) {
           this.serverPostGetPut(urls,opts);
      }
  }

  static getLocalDataByID(objectStoreName, indexName, indexID){
    const dbPromise = this.createIndexedDB();
    let id = parseInt(indexID);
    return dbPromise.then((db) => {
          if (!db) return;
          const store = this.getObjectStore(db, objectStoreName, 'readonly');
          const storeIndex = store.index(indexName);
          //storeIndex.getAll(id);
          
          return Promise.resolve(storeIndex.getAll(id));
        });

  }

  static updateFavoriteStatus(restaurantID, isFavorite){
    const localHostUrl = this.DATABASE_URL;
    console.log('updated favorite id', restaurantID);
    const URL = `${localHostUrl}/${restaurantID}`;
   
    const isFavoriteData = {
        is_favorite: isFavorite
     };
     
    const headers = new Headers({'Content-Type': 'application/json'});
    const body = JSON.stringify(isFavoriteData);
    let opts = {
      method: 'PUT',
      mode: 'cors',
      cache: "no-cache",
      credentials: 'same-origin',
      headers: headers,
      body: body
   
    };
    //const dbPromise = this.createIndexedDB();
    this.serverPostGetPut(URL, opts)
      .then(() => { 
         console.log("Favorite updated: ")
      })
      .catch(error => console.log('Erro', error.message));

  }
   /**
   * Add reviews to local storage
   * Store reviews in indexdDB.
   */
  static addReviewsToIndexDB(reviewsAdded){
    const reviews = reviewsAdded;
    console.log("reviews to be added: ", reviews);
    
    let dbPromise = this.createIndexedDB();
         dbPromise
               .then((db) => {
                   if (!db) return;
                   var tx = db.transaction('reviews', 'readwrite');
                   var storeReviews = tx.objectStore('reviews');


                   if (Array.isArray(reviews)){
                      reviews.forEach(review => {
                        storeReviews.put(review);
                      console.log('Restaurant review added: ', review);
                   });

                   }else {
                    console.log("reviews to be stored: ", reviews);
                     storeReviews.put(reviews);
                    console.log('Restaurant reviews added: ', reviews);
                   }
                    return Promise.resolve(reviews);
               }); 
    
  }
  /**
   * Fetch a review by its ID from Server.
   * Store reviews in indexdDB.
   */
  static fetchReviewsById(id){
    //this.updateOnlineStatus();
    
    const option = {
      credentials: 'include'
      };
    const url = `http://localhost:1337/reviews/?restaurant_id=${id}`;
    //const idx = parseInt(id);
    let dbPromise = this.createIndexedDB();
  
    this.serverPostGetPut(url,option)
      .then(reviews => {
            dbPromise
               .then((db) => {
                   if (!db) return;

                   const store = this.getObjectStore(db, 'reviews', 'readwrite');

                   if (Array.isArray(reviews)){
                      reviews.forEach(review => {
                        store.put(review);
                      });

                   }else {
                    store.put(reviews);
                   }
                    console.log('Restaurant reviews added: ', reviews);
                    return Promise.resolve(reviews);
               }); 
      })
      .catch((error) => {
        return this.getLocalDataByID('reviews', 'restaurant', id)
                      .then((storedReviews) => {
                      console.log('Looking for local data in indexedDB: ');
                      return Promise.resolve(storedReviews);
                    });
          
           
      });
    
  }

/**
   * Add reviews to the server.
   * invoke fetchReviewsById().
   */
   static addReviews(review){

   
    
    const option = {
      credentials: 'include'
      };
    const headers = new Headers({'Content-Type': 'application/json'});
    const body = JSON.stringify(review);
    let opts = {
      method: 'POST',
      mode: 'cors',
      cache: "no-cache",
      credentials: 'same-origin',
      headers: headers,
      body: body
   
    };

    // DBHelper.serverPostGetPut(urlsReviews, opts)
    const urlsReviews = `http://localhost:1337/reviews/`;
    this.serverPostGetPut(urlsReviews, opts)
      .then((data) => {

        console.log("Review added by addReviews: ", data.restaurant_id);
         this.fetchReviewsById(data.restaurant_id);

      })
      .catch(error => console.log('Fail to add a review: ', error.message));
        
  }

  /**
   * Add off reviews to the server .
   * invoke getlocalStorage().
   */
  static updateOnlineStatus(){
      const  offlineData = JSON.parse(DBHelper.getLocalStorage());
      /*
      console.log('offline data: ',offlineData);
      const offlineReviews = querySelectorAll('.offline-views');
      offlineReviews.forEach(el =>{
        el.classList.remove("offline-views");
        el.querySelector('.offline-label').remove();
      });

        if (this.lengthLocalStorage().length) {
        this.addReviews(offlineData);
        console.log('LocalState: data sent to api: ');
      } 
      */
      if (localStorage.length) {
        this.addReviews(offlineData);
        console.log('LocalState: data sent to api: ', offlineData);
        localStorage.clear();
      } 
     
  }

  /**
   * Add off reviews to the server .
   * invoke getlocalStorage().
   */
  static postOfflineReviews(offlineData){
       //const  offlineReviews = JSON.parse(this.getOfflinePost());
       
       //const  offlineReviews = JSON.stringify(this.setLocalStorage(offlineData);
       let postOnlineStatus = this.updateOnlineStatus();
      const offlineReviews = JSON.stringify(this.setLocalStorage(offlineData));


    console.log('offline data: ',offlineData);
    window.addEventListener('online',  postOnlineStatus);
   // window.addEventListener('offline', updateOnlineStatus);

  }
  // Fetch all restaurants.
 
  static fetchRestaurants(callback) {
   const db_promise = this.createIndexedDB();
    const URL = this.DATABASE_URL;
    const opt = {
    credentials: 'include'
    } 
     this.serverPostGetPut(URL, opt)
        .then(json => {
          const restaurants = json;
          this.saveData(restaurants);
          console.log('Request succeeded with JSON response', json);
          callback(null, restaurants);
        })
        .catch((error) => {
          //const db_promise = this.createIndexedDB();
          const restaurantsDB = this.getLocalData(db_promise);
            restaurantsDB.then((restaurants) => {
              callback(null, restaurants);
            });
          console.log('There has been a problem with your fetch operation: ', error.message);
          
        });


  }

  
   
  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    this.fetchRestaurants((error, restaurants) => {
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
    this.fetchRestaurants((error, restaurants) => {
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
    this.fetchRestaurants((error, restaurants) => {
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
    this.fetchRestaurants((error, restaurants) => {
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
    this.fetchRestaurants((error, restaurants) => {
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
    this.fetchRestaurants((error, restaurants) => {
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
    // restaurant.photograph is missing on the last object
    // I have to use id instead if it.
    let urlForImage =restaurant.id + '.jpg';
     return (`/img/${urlForImage}`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: this.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}
