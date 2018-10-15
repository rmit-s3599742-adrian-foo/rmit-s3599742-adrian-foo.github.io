/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

FriendlyEats.prototype.addRestaurant = function(data) { //this function adds a new document the known as restaurant collection. This first get a reference to a cloud firestore collection restaurants then add the data to Restaurants collection
  var collection = firebase.firestore().collection('restaurants');
  return collection.add(data);
};

FriendlyEats.prototype.getAllRestaurants = function(render) { //retrieve all from Cloud Firestore and display it in the app.
    var query = firebase.firestore() //listener will be notified of all existing data that matches the query and will update in real time
        .collection('restaurants')
        .orderBy('avgRating', 'desc')
        .limit(50); //only receive up to 50 restaurants from top level colelction named restaurants
    this.getDocumentsInQuery(query, render); //pass it here to the method which is responsible for loading and rendering the data
};

FriendlyEats.prototype.getDocumentsInQuery = function(query, render) {
  query.onSnapshot(function(snapshot) { // trigger a callback every time there's a change to the result of the query
   if (!snapshot.size) return render(); //query a size change from 50 to new size

   snapshot.docChanges().forEach(function(change) {
     if (change.type === 'added') { //query a type change for filter
       render(change.doc);
     }
   });
 });
}


FriendlyEats.prototype.getRestaurant = function(id) { //fetch the specific restaurant to view page and leave review
  return firebase.firestore().collection('restaurants').doc(id).get(); //triggers when user clicks on a specific restaurant
};

FriendlyEats.prototype.getFilteredRestaurants = function(filters, render) { //allows to filter restaurants based on multiple criteria. Now the query will only return restaurants that match the user's requirements.
  var query = firebase.firestore().collection('restaurants'); //collection of restaurants on firestore

 if (filters.category !== 'Any') { //if "any" is not chosen
   query = query.where('category', '==', filters.category); //show the category chosen
 }

 if (filters.city !== 'Any') { //if city is not chosen
   query = query.where('city', '==', filters.city); //show the specific city
 }

 if (filters.price !== 'Any') { //if price is not chosen to "any"
   query = query.where('price', '==', filters.price.length); //show specific price range
 }

 if (filters.sort === 'Rating') { //if rating is not chosen to rating
   query = query.orderBy('avgRating', 'desc'); //order it by avg rating descending order
 } else if (filters.sort === 'Reviews') { //if review is chosen
   query = query.orderBy('numRatings', 'desc'); //order it by number rating by descending order
 }

 this.getDocumentsInQuery(query, render); //get the query when its selected
}

FriendlyEats.prototype.addRating = function(restaurantID, rating) {
  var collection = firebase.firestore().collection('restaurants');
 var document = collection.doc(restaurantID);
 var newRatingDocument = document.collection('ratings').doc();

 return firebase.firestore().runTransaction(function(transaction) {
   return transaction.get(document).then(function(doc) {
     var data = doc.data();

     var newAverage =
         (data.numRatings * data.avgRating + rating.rating) /
         (data.numRatings + 1);

     transaction.update(document, {
       numRatings: data.numRatings + 1,
       avgRating: newAverage
     });
     return transaction.set(newRatingDocument, rating);
   });
 });
};
