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
  this.streamers = streamers ? JSON.parse(streamers) : [];

  /**
   * 
   * @param {string} streamer 
   * adds a streamer to the users list of streamers
   */
  this.addStreamer = function(streamer) {
    if (this.streamers.indexOf(streamer) > 0) {
      return;
    }
    
    this.streamers.push(streamer);
    localStorage.setItem('streamers', JSON.stringify(this.streamers));
  }
}