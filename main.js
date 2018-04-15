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
      }.bind(this),
      error: function(err) {
        $('.error').text('User not found').css('display', 'flex');
        return;
      }
    });
  }
}