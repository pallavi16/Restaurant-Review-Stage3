let restaurant;
var map;
let restaurantID;
let currentRestaurant;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 *  eventListener for a offline and offline mode.
    When it is the updateOnlineStatus method send an offline reviews to the server.
 */
window.addEventListener('load', () => {

  updateOnlineStatus = (event) => {
    DBHelper.updateOnlineStatus();
  }

  window.addEventListener('online',  updateOnlineStatus);
  //location.reload();
});

/**
 *  Create an element.
 */
 function createNode(el){
   return document.createElement(el);
 }
/**
 *  Append an element to the parent.
 */
 function append(parent, el) {
   return parent.appendChild(el);
 }


/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    // assign the restaurantID value.
    restaurantID = id;
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.alt = restaurant.name;
  image.src = DBHelper.imageUrlForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = createNode('tr');

    const day = createNode('td');
    day.innerHTML = key;
    append(row, day);

    const time = createNode('td');
    time.innerHTML = operatingHours[key];
    append(row, time);

    append(hours,row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = createNode('h2');
  title.id ='reviewsTitle';
  title.innerHTML = 'Reviews';
  title.setAttribute('style', 'text-align: center;');
  append(container, title);

 
  const id = parseInt(getParameterByName('id'));

  const ul = document.getElementById('reviews-list');
  let getReviews = DBHelper.fetchReviewsById(id);
  // send offline reviews to the server.
  DBHelper.updateOnlineStatus();


  let offlineReviews= DBHelper.getLocalDataByID('reviews', 'restaurant', id);
  console.log('Looking for local storedReviews: ', offlineReviews);
                      offlineReviews.then((storedReviews) => {
                      console.log('Looking for local data in offlineReviews: ',storedReviews);
                      storedReviews.reverse().forEach(review => {
                        append(ul, createReviewHTML(review));
                      });
                      append(container, ul);
                      //return Promise.resolve(storedReviews);
  }).catch((error) => {
          console.log('No reviews yet! ', error.message);
          const noReviews = createNode('p');
          noReviews.innerHTML = 'No reviews yet!';
          append(container, noReviews);
          
    });
}

/**
 * Create review HTML and add it to the webpage.

 */
createReviewHTML = (review) => {
  const li = createNode('li');
  // Create Temporary offline label.
  // navigator.onLine
  //!window.navigator.onLine

  if (!navigator.onLine){
     const offLineStatus = createNode('p');
    offLineStatus.classList.add('offline-label');
    offLineStatus.innerHTML = "Offline";
    li.classList.add('offline-views');
    offLineStatus.setAttribute('style', 'text-align: center;');
    append(li, offLineStatus);   
  }

  const name = createNode('p');
  name.innerHTML = `Name: ${review.name}`;
  append(li, name);

  const date = createNode('p');

  let dateObject = new Date(review.createdAt);
  date.innerHTML =`Date: ${dateObject.toDateString()}`;
  append(li, date);
  

  const rating = createNode('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  append(li, rating);
  

  const comments = createNode('p');
  comments.innerHTML = review.comments;
  append(li, comments);
 
  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = createNode('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}


    
   
  const formEl = document.getElementById("formcomment");

 
// Get the form data
  getFormData = () => {
     // get form data Name, comment , a rate.
     const commentorName = document.getElementById("username").value;
     const aComment = document.querySelector("textarea").value;
     const starList = document.getElementsByName("star");

     let aRate =1
     for (let i = 0; i < starList.length; i++) {
         if (starList[i].checked) {
             aRate = starList[i].value;
         }
     }
     
     const formData = {
         restaurant_id: parseInt(restaurantID),
         name: commentorName,
         rating: parseInt(aRate),
         comments: aComment,
         createdAt: (new Date()).getTime()
     };
     return formData;
  }
    

  postReview = () => {
    event.preventDefault();
    let reviewData = getFormData();
    const container = document.getElementById('reviews-container');
    const ul = document.getElementById('reviews-list');

    if (!navigator.onLine){
      const offlineReviews = DBHelper.setLocalStorage(JSON.stringify(reviewData));
      console.log("offline reviews saved", reviewData);


    }else {

      DBHelper.addReviews(reviewData);
      console.log("update UI offLineStatus", reviewData); 
    }
    
    const ulNewNode = createNode('ul');
     ulNewNode.classList.add('reviewsUpdate');
    
    append(ulNewNode, createReviewHTML(reviewData));
    
   
    const titleReviews = document.getElementById('reviewsTitle');
    container.insertBefore(ulNewNode, titleReviews.nextSibling);
    document.forms["formcomment"].reset(); 
    
    
 } 
 