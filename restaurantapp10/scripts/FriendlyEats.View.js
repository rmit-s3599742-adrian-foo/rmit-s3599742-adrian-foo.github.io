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
FriendlyEats.prototype.initTemplates = function() {
  this.templates = {};

  var that = this;
  document.querySelectorAll('.template').forEach(function(el) {
    that.templates[el.getAttribute('id')] = el;
  });
};

var restaurantsArray = [];


FriendlyEats.prototype.viewHome = function() {
  this.getAllRestaurants();
  
};

FriendlyEats.prototype.viewList = function(filters, filter_description) {
  if (!filter_description) {
    filter_description = 'any type of food with any price in any city.';
  }

  if (Notification.permission !== "granted")
        Notification.requestPermission();

  var mainEl = this.renderTemplate('main-adjusted');
  var headerEl = this.renderTemplate('header-base', {
    hasSectionHeader: true
  });

  this.replaceElement(
    headerEl.querySelector('#section-header'),
    this.renderTemplate('filter-display', {
      filter_description:filter_description
    })
  );
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      if(localStorage.getItem('username')){ // already signed in
        headerEl.querySelector('#loginBtn').innerText = 'Hello '+ localStorage.getItem('username');
        headerEl.querySelector('#loginBtn').disabled = true; 
      }else{        
        headerEl.querySelector('#loginBtn').disabled = true;
      }
       
    } else {
      // No user is signed in.
    }
  });

  this.replaceElement(document.querySelector('.header'), headerEl,function(){
    console.log('helo');   
    
    if(firebase.auth().currentUser.displayName){
      headerEl.querySelector('#loginBtn').innerText = 'Hello ' + firebase.auth().currentUser.displayName;
      headerEl.querySelector('#loginBtn').disabled = true;   
     }
  });
  this.replaceElement(document.querySelector('main'), mainEl);

  var that = this;
  headerEl.querySelector('#show-filters').addEventListener('click', function() {
   //to see if the user was already logged in or not  
    that.dialogs.filter.show();
  });
  headerEl.querySelector('#chartsBtn').addEventListener('click', function() {
    //to see if the user was already logged in or not  
    google.charts.load('current', {'packages':['corechart']});

    // Set a callback to run when the Google Visualization API is loaded.
    google.charts.setOnLoadCallback(drawChart);
    google.charts.setOnLoadCallback(drawChart1);
    // Callback that creates and populates a data table,
    // instantiates the pie chart, passes in the data and
    // draws it.
    function drawChart() { // chart for top users
      // Create the data table.
      var data = new google.visualization.DataTable();
      firebase
      .firestore()
      .collection('users')        
      .get().then((querySnapshot) => {
         let array = []
          querySnapshot.forEach((doc) => {
              console.log(doc.id, doc.data());
              array.push(doc.data())
          });
          array=array.filter(a=>{
            return a.review
          }).sort((a,b)=>{
            if(a.review>b.review) return -1
            if(a.review<b.review) return 1
            return 0
          })
          
          data.addColumn('string', 'Topping');
          data.addColumn('number', 'Slices');
          if(array.length===1)
          data.addRows([             
            [`${array[0].name}`, array[0].review],             
          ]);
          else if(array.length===2)
          data.addRows([             
            [`${array[0].name}`, array[0].review],          
            [`${array[1].name}`, array[1].review]   
          ]);
          else if(array.length>2)            
          data.addRows([             
            [`${array[0].name}`, array[0].review],          
            [`${array[1].name}`, array[1].review],
            [`${array[2].name}`, array[2].review]    
          ]);

          var options = {'title':'Top 3 users who left the most reviews',
          'width':400,
          'height':300};

          // Instantiate and draw our chart, passing in some options.
          var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
          chart.draw(data, options);
      });
    }
    function drawChart1() { // chart for highest restaurants
      // Create the data table.
      var data = new google.visualization.DataTable();
      firebase
      .firestore()
      .collection('restaurants')        
      .get().then((querySnapshot) => {
         let array = []
          querySnapshot.forEach((doc) => {
              console.log(doc.id, doc.data());
              array.push(doc.data())
          });
          array=array.filter(a=>{
            return a.review
          })
          .sort((a,b)=>{              
            if(a.review>b.review) return -1
            if(a.review<b.review) return 1
            return 0
          })
          console.log('array restaurant',array)
          data.addColumn('string', 'Topping');
          data.addColumn('number', 'Slices');                       
          data.addRows([             
            [`${array[0].name}`, array[0].review],          
            [`${array[1].name}`, array[1].review],
            [`${array[2].name}`, array[2].review]    
          ]);

          var options = {'title':'Top 3 highest reviewed restaurants',
          'width':400,
          'height':300};

          // Instantiate and draw our chart, passing in some options.
          var chart = new google.visualization.PieChart(document.getElementById('chart_div1'));
          chart.draw(data, options);
      });
    }
   
    
     
    
        that.dialogs.chart.show()
   });
  headerEl.querySelector('#loginBtn').addEventListener('click', function() {
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
    firebase.auth().signInWithPopup(provider).then(function(result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;           
      firebase.firestore().collection('users').doc(user.uid).set({
        email: user.email,
        name: user.displayName,       
      }).then(()=>{
        localStorage.setItem('username',user.displayName)
        if (Notification.permission !== "granted")
            Notification.requestPermission(); // notification permission       
          var notification = new Notification('Welcome', { // notification part
            icon: './images/favico.ico',
            body: `Hi, ${user.displayName}`,
          });    
      
        
      }).catch(function(error){
        console.log('error',error)
      })
      headerEl.querySelector('#loginBtn').innerText = 'Hello ' + user.displayName;
      headerEl.querySelector('#loginBtn').disabled = true;     
      
      // ...
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });
  });

  var renderResults = function(doc) {
    if (!doc) {
      var headerEl = that.renderTemplate('header-base', {
        hasSectionHeader: true
      });

      var noResultsEl = that.renderTemplate('no-results');

      that.replaceElement(
        headerEl.querySelector('#section-header'),
        that.renderTemplate('filter-display', {
          filter_description: filter_description
        })
      );

      headerEl.querySelector('#show-filters').addEventListener('click', function() {
        that.dialogs.filter.show();
      });

      that.replaceElement(document.querySelector('.header'), headerEl);
      that.replaceElement(document.querySelector('main'), noResultsEl);
      return;
    }
    var data = doc.data();
    data['.id'] = doc.id;
    data['go_to_restaurant'] = function() {
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
         
        var sfDocRef = firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid)
            firebase.firestore().runTransaction(function(transaction) {
              return transaction.get(sfDocRef).then(function(sfDoc) {
                  if (!sfDoc.exists) {
                      throw "Document does not exist!";
                  }          
                  console.log(sfDoc.data().review)
                  var newPopulation = 0
                  if(sfDoc.data().review===undefined) newPopulation = 1
                  else newPopulation = sfDoc.data().review + 1;
                  if (newPopulation <= 1000000) {
                      transaction.update(sfDocRef, { review: newPopulation });
                      return newPopulation;
                  } else {
                      return Promise.reject("Sorry! Population is too big.");
                  }
              });
          }).then(function(newPopulation) {
              console.log("Review increased to ", newPopulation);
          }).catch(function(err) {
              // This will be an "population is too big" error.
              console.error(err);
          });
              var sfDocRef1 = firebase.firestore().collection('restaurants').doc(doc.id)
              firebase.firestore().runTransaction(function(transaction) {
                return transaction.get(sfDocRef1).then(function(sfDoc) {
                    if (!sfDoc.exists) {
                        throw "Document does not exist!";
                    }          
                    console.log(sfDoc.data().review)
                    var newPopulation = 0
                    if(sfDoc.data().review===undefined) newPopulation = 1
                    else newPopulation = sfDoc.data().review + 1;
                    if (newPopulation <= 1000000) {
                        transaction.update(sfDocRef1, { review: newPopulation });
                        return newPopulation;
                    } else {
                        return Promise.reject("Sorry! Population is too big.");
                    }
          });
      }).then(function(newPopulation) {
          console.log("Review increased to ", newPopulation);
      }).catch(function(err) {
          // This will be an "population is too big" error.
          console.error(err);
      });
      that.router.navigate('/restaurants/' + doc.id);

        } else {
          // No user is signed in.
        }
      });
      
    };

    var el = that.renderTemplate('restaurant-card', data);
    el.querySelector('.rating').append(that.renderRating(data.avgRating));
    el.querySelector('.price').append(that.renderPrice(data.price));

    mainEl.querySelector('#cards').append(el);
  };

  if (filters.city || filters.category || filters.price || filters.sort !== 'Rating' ) {
    this.getFilteredRestaurants({
      city: filters.city || 'Any',
      category: filters.category || 'Any',
      price: filters.price || 'Any',
      sort: filters.sort
    }, renderResults);
  } else {
    this.getAllRestaurants(renderResults);
  }

  var toolbar = mdc.toolbar.MDCToolbar.attachTo(document.querySelector('.mdc-toolbar'));
  toolbar.fixedAdjustElement = document.querySelector('.mdc-toolbar-fixed-adjust');

  mdc.autoInit();
};

FriendlyEats.prototype.viewSetup = function() {
  var headerEl = this.renderTemplate('header-base', {
    hasSectionHeader: false
  });

  var config = this.getFirebaseConfig();
  var noRestaurantsEl = this.renderTemplate('no-restaurants', config);

  var button = noRestaurantsEl.querySelector('#add_mock_data');
  var button = noRestaurantsEl.querySelector('#loginBtn');
  var addingMockData = false;

  var that = this;
  button.addEventListener('click', function(event) {
    if (addingMockData) {
      return;
    }
    addingMockData = true;

    event.target.style.opacity = '0.4';
    event.target.innerText = 'Please wait...';

    that.addMockRestaurants().then(function() {
      that.rerender();
    });
  });

  this.replaceElement(document.querySelector('.header'), headerEl);
  this.replaceElement(document.querySelector('main'), noRestaurantsEl);

  firebase
    .firestore()
    .collection('restaurants')
    .limit(1)
    .onSnapshot(function(snapshot) {
      if (snapshot.size && !addingMockData) {
        that.router.navigate('/');
      }
    });
};


FriendlyEats.prototype.initReviewDialog = function() {
  var dialog = document.querySelector('#dialog-add-review');
  this.dialogs.add_review = new mdc.dialog.MDCDialog(dialog);

  var that = this;
  this.dialogs.add_review.listen('MDCDialog:accept', function() {
    var pathname = that.getCleanPath(document.location.pathname);
    var id = pathname.split('/')[2];

    that.addRating(id, {
      rating: rating,
      text: dialog.querySelector('#text').value,
      userName:  firebase.auth().currentUser.displayName,
      timestamp: new Date(),
      userId: firebase.auth().currentUser.uid
    }).then(function() {
      that.rerender();
    });
  });

  this.dialogs.add_review.listen('login', function() {
   alert('Hellop')
  });

  var rating = 0;

  dialog.querySelectorAll('.star-input i').forEach(function(el) {
    var rate = function() {
      var after = false;
      rating = 0;
      [].slice.call(el.parentNode.children).forEach(function(child) {
        if (!after) {
          rating++;
          child.innerText = 'star';
        } else {
          child.innerText = 'star_border';
        }
        after = after || child.isSameNode(el);
      });
    };
    el.addEventListener('mouseover', rate);
  });
};

FriendlyEats.prototype.initChartDialog = function() {
  var dialog = document.querySelector('#dialog-chart');
  this.dialogs.chart = new mdc.dialog.MDCDialog(dialog);

  var that = this;
 
  this.dialogs.chart.listen('MDCDialog:accept', function() {
    
   
  });

  

  var rating = 0;

  dialog.querySelectorAll('.star-input i').forEach(function(el) {
    var rate = function() {
      var after = false;
      rating = 0;
      [].slice.call(el.parentNode.children).forEach(function(child) {
        if (!after) {
          rating++;
          child.innerText = 'star';
        } else {
          child.innerText = 'star_border';
        }
        after = after || child.isSameNode(el);
      });
    };
    el.addEventListener('mouseover', rate);
  });
};

FriendlyEats.prototype.initFilterDialog = function() {
  // TODO: Reset filter dialog to init state on close.
  this.dialogs.filter = new mdc.dialog.MDCDialog(document.querySelector('#dialog-filter-all'));

  var that = this;
  this.dialogs.filter.listen('MDCDialog:accept', function() {
    that.updateQuery(that.filters);
  });

  var dialog = document.querySelector('aside');
  var pages = dialog.querySelectorAll('.page');

  this.replaceElement(
    dialog.querySelector('#category-list'),
    this.renderTemplate('item-list', { items: ['Any'].concat(this.data.categories) })
  );

  this.replaceElement(
    dialog.querySelector('#city-list'),
    this.renderTemplate('item-list', { items: ['Any'].concat(this.data.cities) })
  );

  var renderAllList = function() {
    that.replaceElement(
      dialog.querySelector('#all-filters-list'),
      that.renderTemplate('all-filters-list', that.filters)
    );

    dialog.querySelectorAll('#page-all .mdc-list-item').forEach(function(el) {
      el.addEventListener('click', function() {
        var id = el.id.split('-').slice(1).join('-');
        displaySection(id);
      });
    });
  };

  var displaySection = function(id) {
    if (id === 'page-all') {
      renderAllList();
    }

    pages.forEach(function(sel) {
      if (sel.id === id) {
        sel.style.display = 'block';
      } else {
        sel.style.display = 'none';
      }
    });
  };

  pages.forEach(function(sel) {
    var type = sel.id.split('-')[1];
    if (type === 'all') {
      return;
    }

    sel.querySelectorAll('.mdc-list-item').forEach(function(el) {
      el.addEventListener('click', function() {
        that.filters[type] = el.innerText.trim() === 'Any'? '' : el.innerText.trim();
        displaySection('page-all');
      });
    });
  });

  displaySection('page-all');
  dialog.querySelectorAll('.back').forEach(function(el) {
    el.addEventListener('click', function() {
      displaySection('page-all');
    });
  });
};

FriendlyEats.prototype.updateQuery = function(filters) {
  var query_description = '';

  if (filters.category !== '') {
    query_description += filters.category + ' places';
  } else {
    query_description += 'any restaurant';
  }

  if (filters.city !== '') {
    query_description += ' in ' + filters.city;
  } else {
    query_description += ' located anywhere';
  }

  if (filters.price !== '') {
    query_description += ' with a price of ' + filters.price;
  } else {
    query_description += ' with any price';
  }

  if (filters.sort === 'Rating') {
    query_description += ' sorted by rating';
  } else if (filters.sort === 'Reviews') {
    query_description += ' sorted by # of reviews';
  }

  this.viewList(filters, query_description);
};

FriendlyEats.prototype.viewRestaurant = function(id) {
  var sectionHeaderEl;

  var that = this;
  return this.getRestaurant(id)
    .then(function(doc) {
      var data = doc.data();
      var dialog =  that.dialogs.add_review;

      data.show_add_review = function() {
        dialog.show();
      };

      sectionHeaderEl = that.renderTemplate('restaurant-header', data);
      sectionHeaderEl
        .querySelector('.rating')
        .append(that.renderRating(data.avgRating));

      sectionHeaderEl
        .querySelector('.price')
        .append(that.renderPrice(data.price));
      return doc.ref.collection('ratings').orderBy('timestamp', 'desc').get();
    })
    .then(function(ratings) {
      var mainEl;

      if (ratings.size) {
        mainEl = that.renderTemplate('main');

        ratings.forEach(function(rating) {
          var data = rating.data();
          var el = that.renderTemplate('review-card', data);
          el.querySelector('.rating').append(that.renderRating(data.rating));
          mainEl.querySelector('#cards').append(el);
        });
      } else {
        mainEl = that.renderTemplate('no-ratings', {
          add_mock_data: function() {
            that.addMockRatings(id).then(function() {
              that.rerender();
            });
          }
        });
      }

      var headerEl = that.renderTemplate('header-base', {
        hasSectionHeader: true
      });

      that.replaceElement(document.querySelector('.header'), sectionHeaderEl);
      that.replaceElement(document.querySelector('main'), mainEl);
    })
    .then(function() {
      that.router.updatePageLinks();
    })
    .catch(function(err) {
      console.warn('Error rendering page', err);
    });
};

FriendlyEats.prototype.renderTemplate = function(id, data) {
  var template = this.templates[id];
  var el = template.cloneNode(true);
  el.removeAttribute('hidden');
  this.render(el, data);
  return el;
};

FriendlyEats.prototype.render = function(el, data) {
  if (!data) {
    return;
  }

  var that = this;
  var modifiers = {
    'data-fir-foreach': function(tel) {
      var field = tel.getAttribute('data-fir-foreach');
      var values = that.getDeepItem(data, field);

      values.forEach(function(value, index) {
        var cloneTel = tel.cloneNode(true);
        tel.parentNode.append(cloneTel);

        Object.keys(modifiers).forEach(function(selector) {
          var children = Array.prototype.slice.call(
            cloneTel.querySelectorAll('[' + selector + ']')
          );
          children.push(cloneTel);
          children.forEach(function(childEl) {
            var currentVal = childEl.getAttribute(selector);

            if (!currentVal) {
              return;
            }
            childEl.setAttribute(
              selector,
              currentVal.replace('~', field + '/' + index)
            );
          });
        });
      });

      tel.parentNode.removeChild(tel);
    },
    'data-fir-content': function(tel) {
      var field = tel.getAttribute('data-fir-content');
      tel.innerText = that.getDeepItem(data, field);
    },
    'data-fir-click': function(tel) {
      tel.addEventListener('click', function() {
        var field = tel.getAttribute('data-fir-click');
        that.getDeepItem(data, field)();
      });
    },
    'data-fir-if': function(tel) {
      var field = tel.getAttribute('data-fir-if');
      if (!that.getDeepItem(data, field)) {
        tel.style.display = 'none';
      }
    },
    'data-fir-if-not': function(tel) {
      var field = tel.getAttribute('data-fir-if-not');
      if (that.getDeepItem(data, field)) {
        tel.style.display = 'none';
      }
    },
    'data-fir-attr': function(tel) {
      var chunks = tel.getAttribute('data-fir-attr').split(':');
      var attr = chunks[0];
      var field = chunks[1];
      tel.setAttribute(attr, that.getDeepItem(data, field));
    },
    'data-fir-style': function(tel) {
      var chunks = tel.getAttribute('data-fir-style').split(':');
      var attr = chunks[0];
      var field = chunks[1];
      var value = that.getDeepItem(data, field);

      if (attr.toLowerCase() === 'backgroundimage') {
        value = 'url(' + value + ')';
      }
      tel.style[attr] = value;
    }
  };

  var preModifiers = ['data-fir-foreach'];

  preModifiers.forEach(function(selector) {
    var modifier = modifiers[selector];
    that.useModifier(el, selector, modifier);
  });

  Object.keys(modifiers).forEach(function(selector) {
    if (preModifiers.indexOf(selector) !== -1) {
      return;
    }

    var modifier = modifiers[selector];
    that.useModifier(el, selector, modifier);
  });
};

FriendlyEats.prototype.useModifier = function(el, selector, modifier) {
  el.querySelectorAll('[' + selector + ']').forEach(modifier);
};

FriendlyEats.prototype.getDeepItem = function(obj, path) {
  path.split('/').forEach(function(chunk) {
    obj = obj[chunk];
  });
  return obj;
};

FriendlyEats.prototype.renderRating = function(rating) {
  var el = this.renderTemplate('rating', {});
  for (var r = 0; r < 5; r += 1) {
    var star;
    if (r < Math.floor(rating)) {
      star = this.renderTemplate('star-icon', {});
    } else {
      star = this.renderTemplate('star-border-icon', {});
    }
    el.append(star);
  }
  return el;
};

FriendlyEats.prototype.renderPrice = function(price) {
  var el = this.renderTemplate('price', {});
  for (var r = 0; r < price; r += 1) {
    el.append('$');
  }
  return el;
};

FriendlyEats.prototype.replaceElement = function(parent, content) {
  parent.innerHTML = '';
  parent.append(content);
};

FriendlyEats.prototype.rerender = function() {
  this.router.navigate(document.location.pathname + '?' + new Date().getTime());
};
