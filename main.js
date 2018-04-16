$(document).ready(function() {
  var streamers = new Streamers(localStorage.getItem('streamers'));

  streamers.appendStreamersToDOM();

  $('.add-streamers').on('submit', function(e) {
    e.preventDefault();
    streamers.addStreamer(e.target[0].value);
    e.target[0].value = '';
  });

  $('.error').on('click', '.close', function(e) {
    $('.error').text('').css('display', 'none');
  });
});

// Twitch Streamers object
function Streamers(streamers) {
  var api_key = '?client_id=fdnj189hn9cwh5etw8j353v1iejl5ve';
  var urlStream = "https://api.twitch.tv/kraken/streams/";
  var urlChannel = 'https://api.twitch.tv/kraken/channels/'

  this.streamers = streamers ? JSON.parse(streamers) : [];

  /**
   * 
   * @param {string} streamer 
   * adds a streamer to the users list of streamers
   */
  this.addStreamer = function(streamer) {
    if (this.streamers.indexOf(streamer) > -1) {
      $('.error').text('<p>User already exist</p><span class="close">X</span>').css('display', 'flex');
      return;
    }

    $.ajax({
      type: 'get',
      dataType: 'json',
      url: urlChannel + streamer + api_key,
      success: function() {
        $('.error').text('').hide();
        this.streamers.push(streamer);
        localStorage.setItem('streamers', JSON.stringify(this.streamers));
        this.appendStreamer(streamer);
      }.bind(this),
      error: function(err) {
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
    $.ajax({
      type: 'get',
      dataType: 'json',
      url: urlStream + streamer + api_key,
      success: function(data) {
        if (data.stream) {
          this.streamStatus(data.stream, true);
        } else {
          $.getJSON(urlChannel+streamer+api_key, function(data){
            this.streamStatus(data, false);
          }.bind(this));
        }
      }.bind(this)
    });
  }

  this.appendStreamersToDOM = function() {
    if (this.streamers.length < 1) {
      console.log('no streamers on load');
      return;
    }

    this.streamers.forEach(function(streamer) {
      this.appendStreamer(streamer);
    }.bind(this));
  }

  /**
   * 
   * @param {object} stream the stream object
   * @param {boolean} live status of the streamer
   */
  this.streamStatus = function(stream, live) {
    var streamStatus;
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
}