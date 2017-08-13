//https://dev.twitter.com/oauth/application-only
//https://dev.twitter.com/oauth/overview/application-owner-access-tokens
//https://dev.twitter.com/oauth/overview
var Twitter = require('twitter');
var request = require('request');
var Promise = require('bluebird');

//USE TO GET THE BEARER TOKEN
// var key = config.consumerKey;
// var secret = config.consumerSecret;
// var cat = key + ":" + secret;
// var credentials = new Buffer(cat).toString('base64');

// var url = 'https://api.twitter.com/oauth2/token';

// request({ url: url,
//   method:'POST',
//   headers: {
//     "Authorization": "Basic " + credentials,
//     "Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"
//   },
//   body: "grant_type=client_credentials"

// }, function(err, resp, body) {

//   console.log(body); //the bearer token...

// });
const MAX_TWEETS = 100;
const MAX_FRIENDS = 100;

var consumerKey = process.env.twitterConsumerKey || require('../config.js').twitterKey.consumerKey;
var consumerSecret = process.env.twitterConsumerSecret || require('../config.js').twitterKey.consumerSecret;
var bearerToken = process.env.twitterBearerToken || require('../config.js').twitterKey.bearerToken;

var client = new Twitter({
  // WARNING Twitter library want snake case!
  consumer_key: consumerKey,
  consumer_secret: consumerSecret,
  bearer_token: bearerToken,
});


// trim the array of tweets and return an object
var parseTweets = function(screenName, tweets) {

  var parsedTweets = {};

  parsedTweets.screen_name = screenName;
  parsedTweets.name = tweets[0].user.name;
  parsedTweets.location = tweets[0].user.location;
  parsedTweets.description = tweets[0].user.description;
  parsedTweets.imageUrl = tweets[0].user.profile_image_url;
  parsedTweets.tweets = tweets.map(tweet => tweet.text);

  // For V2 => MORE ANALYSIS
  // parsedTweets.mentions = tweets.map(tweet => tweet.entities.user_mentions).map(function(el) {
  //   if (el.length) {
  //     for (var i = 0; i < el.length; i++) {
  //       //delete(el[i].name);
  //       delete(el[i].id);
  //       delete(el[i].id_str);
  //       delete(el[i].indices);
  //     }
  //   }
  //   return el;
  // });
  // parsedTweets.url = tweets.map(tweet => tweet.entities.urls).map(function(el) {
  //   if (el.length) {
  //     for (var i = 0; i < el.length; i++) {
  //       delete(el[i].url);
  //       delete(el[i].indices);
  //     }
  //   }
  //   return el;
  // });

  return parsedTweets;
};

// add the friens to the object return by parseTweets
var parseFriends = function(tweets, friends) {
  // {srceenName:'realDonaldTrump', friends:[]}
  tweets.friends = friends.users.map(function(friend) {
    return {screen_name: friend.screen_name, name: friend.name};
  });
  return tweets;
};

//https://dev.twitter.com/rest/reference/get/statuses/user_timeline
// return an array of tweets parse by parseTweets
var getTweets = function(screenName, callback) {
  //screen_name example 'realDonaldTrump'
  //count default to 20
  var promiseGetTweets = new Promise(function(resolve, reject) {
    var params = { screen_name: screenName, count: MAX_TWEETS, exclude_replies: true };
    client.get('statuses/user_timeline', params, function(error, tweets, response) {
      if (error) {
        reject(error);
      } else {
        resolve(parseTweets(screenName, tweets));
      }
    });
  });
  return promiseGetTweets;

};


//https://dev.twitter.com/rest/reference/get/friends/list
// return an array of friend
var getFriends = function(tweets, callback) {
  var promiseGetFriends = new Promise(function(resolve, reject) {
    var params = { screen_name: tweets.screen_name, count: MAX_FRIENDS}; //screen_name example 'realDonaldTrump'
    client.get('friends/list', params, function(error, friends, response) {
      if (error) {
        reject(error);
      } else {
        resolve(parseFriends(tweets, friends));
      }
    });
  });
  return promiseGetFriends;
};


//'application/rate_limit_status'


// https://dev.twitter.com/rest/reference/get/friends/list
// var getFriends = function(screenName, callback) {
//   var params = { screen_name: screenName, count: 100}; //screen_name example 'realDonaldTrump'
//   client.get('friends/list', params, function(error, friends, response) {
//     if (error) {
//       callback(error);
//     } else {
//       callback(error, friends);//parseFriends(screenName, friends)
//     }
//   });
// };

// //https://dev.twitter.com/rest/reference/get/statuses/user_timeline
// var getTweets = function(screenName, callback) {
//   //screen_name example 'realDonaldTrump'
//   //count default to 20
//   var params = { screen_name: screenName, count: 5, exclude_replies: true };
//   client.get('statuses/user_timeline', params, function(error, tweets, response) {
//     if (error) {
//       callback(error);
//     } else {
//       callback(error, tweets);//parseTweets(screenName, tweets)
//     }
//   });
// };

module.exports.getTweets = getTweets;
module.exports.getFriends = getFriends;
