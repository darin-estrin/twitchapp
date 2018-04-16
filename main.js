$(document).ready(function() {
  var streamers = new Streamers(localStorage.getItem('streamers'));

  // Load Followed streamers to the dom
  streamers.appendStreamersToDOM();

  // Add a streamer to follow
  $('.add-streamers').on('submit', function(e) {
    e.preventDefault();
    streamers.addStreamer(e.target[0].value);
    e.target[0].value = '';
  });

  // Clears errors
  $('.error').on('click', '.close', function(e) {
    $('.error').text('').css('display', 'none');
  });

  // Unfollows streamers
  $('.streams').on('click', '.delete', function(e) {
    var streamer = e.currentTarget.classList[1];
    var element = e.currentTarget.parentNode.parentNode;
    streamers.unfollow(streamer, element);
  });
});

// Twitch Streamers object
function Streamers(streamers) {
  // api imformation
  var api_key = '?client_id=fdnj189hn9cwh5etw8j353v1iejl5ve';
  var urlStream = "https://api.twitch.tv/kraken/streams/";
  var urlChannel = 'https://api.twitch.tv/kraken/channels/'

  // Set the value of steamers
  this.streamers = streamers ? JSON.parse(streamers) : [];

  /**
   * 
   * @param {string} streamer 
   * adds a streamer to the users list of streamers
   */
  this.addStreamer = function(streamer) {
    $.ajax({
      type: 'get',
      dataType: 'json',
      url: urlChannel + streamer + api_key,
      // successful api call
      success: function(data) {
        // exits if attempting to add a streamer that is already being followed
        if (this.streamers.indexOf(data.display_name) > -1) {
          $('.error').html('<p>Already following streamer</p><span class="close">X</span>').css('display', 'flex');
          return;
        }

        // clears errors
        $('.error').text('').hide();

        // adds streamer to the list of streamers to follow
        streamer = data.display_name
        this.streamers.push(streamer);
        localStorage.setItem('streamers', JSON.stringify(this.streamers));

        // Adds streamer information to the DOM
        this.appendStreamer(streamer);
      }.bind(this),
      // On failed api call
      error: function(err) {
        // Informs user that no streamer has been found with that name
        $('.error').html('<p>User not found</p><span class="close">X</span>').css('display','flex');
        return;
      }
    });
  }

  /**
   * 
   * @param {string} streamer 
   * @method adds a streamer to the DOM
   */
  this.appendStreamer = function(streamer) {
    // removes empty streamer list notification from the dom if it is there
    $('#no-streamers').remove();
    $.ajax({
      type: 'get',
      dataType: 'json',
      url: urlStream + streamer + api_key,
      // successful api call
      success: function(data) {
        // if streamer is current streaming
        if (data.stream) {
          this.streamStatus(data.stream, true);
        // streamer is currently offline
        } else {
          $.getJSON(urlChannel+streamer+api_key, function(data){
            this.streamStatus(data, false);
          }.bind(this));
        }
      }.bind(this)
    });
  }

  /**
   * Called on page load to render streamers status'
   */
  this.appendStreamersToDOM = function() {
    // runs if no streamers found on page load
    if (this.streamers.length < 1) {
      this.emptyStreamersList();
      return;
    }

    // runs if streamers are found on page load
    this.streamers.forEach(function(streamer) {
      this.appendStreamer(streamer);
    }.bind(this));
  }

  /**
   * runs when streamers list is empty
   */
  this.emptyStreamersList = function() {
    $('.streams').append(`
      <div class="stream" id="no-streamers" style="text-align: center;">
        <h2>You are currently not following any streamers</h2>
      </div>
    `);
  }

  /**
   * 
   * @param {object} stream the stream object
   * @param {boolean} live status of the streamer
   */
  this.streamStatus = function(stream, live) {
    var streamStatus;
    // runs if streamer is currently streaming
    if (live) {
      streamStatus = `
        <div class="stream">
          <a class="preview" href="${stream.channel.url}"><img src="${stream.preview.medium}"></a>
          <h2 class="name">${stream.channel.display_name} is currently playing ${stream.channel.game}</h2>
          <p class="status">
            <a href="${stream.channel.url}">Watch live: ${stream.channel.status}</a>
          </p>
          <span class="details">
            <p class="viewers">Viewers: ${stream.viewers}</p>
            <button class="delete ${stream.channel.name}">Unfollow</button>
          </span>
        </div>
      `;
    // runs if streamer is currently of line
    } else {
      streamStatus = `
        <div class="stream">
          <a class="preview" href="${stream.url}"><img src="${stream.logo.toString()}"></a>
          <h2 class="name">${stream.display_name} is currently offline</h2>
          <span class="details">
            <p class="viewers">Followers: ${stream.followers}</p>
            <button class="delete ${stream.display_name}">Unfollow</button>
          </span>
        </div>
      `;
    }
    $('.streams').append(streamStatus);
  }

  /**
   * 
   * @param {string} streamer name of streamer to unfollow
   * @param {object} element DOM element to remove from the DOM on unfollow
   * @method unfollows a streamer
   */
  this.unfollow = function(streamer, element) {
    // removes streamer from list of followed streamers;
    this.streamers.splice(this.streamers.indexOf(streamer), 1);
    localStorage.setItem('streamers', JSON.stringify(this.streamers));
    // removes streamer status from the dom
    $(element).remove();
    //run if streamer list is empty
    if (this.streamers.length < 1) {
      this.emptyStreamersList();
    }
  }
}