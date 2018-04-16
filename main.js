$(document).ready(function() {
  var streamers = new Streamers(localStorage.getItem('streamers'));

  $('.add-streamers').on('submit', function(e) {
    e.preventDefault();
    streamers.addStreamer(e.target[0].value);
    e.target[0].value = '';
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
      $('.error').text('User Already Exist').css('display', 'flex');
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
        $('.error').text('User not found').css('display', 'flex');
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
        }
      }.bind(this)
    });
  }

  /**
   * 
   * @param {object} stream the stream object
   * @param {boolean} live status of the streamer
   */
  this.streamStatus = function(stream, live) {
    console.log(stream);
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
            <p className="viewers">Viewers: ${stream.viewers}</p>
            <button class="delete ${stream.channel.name}">Unfollow</button>
          </span>
        </div>
      `;
    }
    $('.streams').append(streamStatus);
  }
}